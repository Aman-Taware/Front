import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi, userApi } from '../services/api';

// Create context with a default value
const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  startAuth: async () => {},
  verifyOtp: async () => {},
  login: async () => {},
  signup: async () => {},
  logout: () => {},
});

// Export the hook first
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the provider as a named export
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        try {
          // Get user profile and role
          const response = await userApi.getProfile();
          const userData = response.data;
          
          // Extract role from JWT token's payload
          const payload = JSON.parse(atob(token.split('.')[1]));
          const role = payload.authorities.includes('ADMIN') ? 'ADMIN' : 'USER';
          
          setUser({
            ...userData,
            role: role
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('jwtToken');
          setError(error.response?.data?.message || 'Authentication failed');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Start authentication process with phone number
  const startAuth = async (contactNo) => {
    try {
      const response = await authApi.startAuth(contactNo);
      return response.data; // Returns "LOGIN" or "SIGNUP"
    } catch (error) {
      let errorMessage = 'Authentication initialization failed';
      
      if (error.response) {
        console.error('Auth start error response:', error.response.status, error.response.data);
        switch (error.response.status) {
          case 400:
            errorMessage = 'Invalid phone number format';
            break;
          case 404:
            errorMessage = 'Authentication endpoint not found. Please check API configuration.';
            break;
          case 429:
            errorMessage = 'Too many authentication attempts';
            break;
          default:
            errorMessage = error.response.data?.message || 'Authentication initialization failed';
        }
      } else if (error.request) {
        console.error('Auth start request error:', error.request);
        errorMessage = 'Network error. Please check your connection.';
      } else {
        console.error('Auth start unexpected error:', error.message);
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Verify OTP during authentication process
  const verifyOtp = async (contactNo, otp) => {
    try {
      console.log('Verifying OTP for:', contactNo, 'OTP:', otp);
      const response = await authApi.verifyAuthOtp({ contactNo, otp });
      console.log('OTP verification response:', response.data);
      return response.data; // Returns "PROCEED_TO_LOGIN" or "PROCEED_TO_SIGNUP"
    } catch (error) {
      let errorMessage = 'OTP verification failed';
      
      if (error.response) {
        console.error('OTP verification error:', error.response.status, error.response.data);
        switch (error.response.status) {
          case 400:
            errorMessage = 'Invalid OTP format';
            break;
          case 401:
            errorMessage = 'Incorrect OTP';
            break;
          case 408:
            errorMessage = 'OTP has expired';
            break;
          default:
            errorMessage = error.response.data?.message || 'OTP verification failed';
        }
      } else if (error.request) {
        console.error('OTP verification request error:', error.request);
        errorMessage = 'Network error. Please check your connection.';
      } else {
        console.error('OTP verification unexpected error:', error.message);
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Login with verified OTP
  const login = async (contactNo) => {
    try {
      const response = await authApi.signin(contactNo);
      const { jwt, role } = response.data;
      
      if (!jwt) {
        throw new Error('Authentication failed - no token received');
      }
      
      localStorage.setItem('jwtToken', jwt);
      
      // Get user profile after successful login
      const userResponse = await userApi.getProfile();
      setUser({
        ...userResponse.data,
        role: role
      });
      
      setError(null);
      return response.data;
    } catch (error) {
      let errorMessage = 'Login failed';
      
      if (error.response) {
        // Server responded with error
        console.error('Login error response:', error.response.status, error.response.data);
        switch (error.response.status) {
          case 400:
            errorMessage = 'Invalid contact number';
            break;
          case 401:
            errorMessage = 'Authentication failed';
            break;
          case 403:
            errorMessage = 'Account is locked';
            break;
          default:
            errorMessage = error.response.data?.message || 'Login failed';
        }
      } else if (error.request) {
        console.error('Login request error:', error.request);
        errorMessage = 'Network error. Please check your connection.';
      } else {
        console.error('Login unexpected error:', error.message);
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Signup with verified OTP and additional details
  const signup = async (userData) => {
    try {
      const response = await authApi.signup(userData);
      const { jwt, role } = response.data;
      
      if (!jwt) {
        throw new Error('Registration failed - no token received');
      }
      
      localStorage.setItem('jwtToken', jwt);
      
      // Get user profile after successful signup
      const userResponse = await userApi.getProfile();
      setUser({
        ...userResponse.data,
        role: role
      });
      
      setError(null);
      return response.data;
    } catch (error) {
      let errorMessage = 'Signup failed';
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data?.message || 'Invalid input data';
            break;
          case 409:
            errorMessage = 'Email already registered';
            break;
          case 422:
            errorMessage = 'Phone number not verified';
            break;
          default:
            errorMessage = error.response.data?.message || 'Registration failed';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    startAuth,
    verifyOtp,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 