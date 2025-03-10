// src/pages/AuthModal.js
import React, { useState } from 'react';
import { X, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AuthModal = ({ onClose, onSuccess }) => {
  const [authMode, setAuthMode] = useState('CONTACT'); // CONTACT, OTP, SIGNUP_DETAILS, LOGIN_COMPLETE
  const { startAuth, verifyOtp, login, signup } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  
  const [formData, setFormData] = useState({
    contactNo: '',
    otp: '',
    name: '',
    email: '',
  });

  const handleStartAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccessMessage(null);

    try {
      if (!formData.contactNo || formData.contactNo.length !== 10) {
        throw new Error('Please enter a valid 10-digit phone number');
      }

      const authType = await startAuth(formData.contactNo);
      setIsNewUser(authType === 'SIGNUP');
      setSuccessMessage('OTP sent successfully! Please check your phone.');
      setAuthMode('OTP');
    } catch (err) {
      console.error('Start auth error:', err);
      setError(err.message || 'Failed to start authentication');
      // Keep the form in CONTACT mode so user can try again
      setAuthMode('CONTACT');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.otp || formData.otp.length !== 4) {
        throw new Error('Please enter a valid 4-digit OTP');
      }

      const result = await verifyOtp(formData.contactNo, formData.otp);
      console.log('OTP verification result:', result);
      
      if (result === 'PROCEED_TO_SIGNUP') {
        setSuccessMessage('Phone number verified successfully! Please complete your registration.');
        setAuthMode('SIGNUP_DETAILS');
      } else if (result === 'PROCEED_TO_LOGIN') {
        console.log('Proceeding to login with verified OTP');
        // Immediately log in as this is an existing user
        await handleLoginWithOtp();
      } else {
        console.warn('Unexpected OTP verification result:', result);
        setError('Unexpected verification result. Please try again.');
      }
    } catch (err) {
      console.error('OTP verification failed:', err);
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLoginWithOtp = async () => {
    setError(null);
    setLoading(true);
    
    try {
      console.log('Attempting login with OTP for:', formData.contactNo);
      await login(formData.contactNo);
      setSuccessMessage('Login successful!');
      setAuthMode('LOGIN_COMPLETE');
      setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      console.error('Login with OTP failed:', err);
      setError(err.message || 'Login failed');
      // Don't reset to contact entry if login fails
      // Keep in OTP mode so user can try again or go back manually
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.name || !formData.email) {
        throw new Error('Please fill in all fields');
      }

      await signup({
        name: formData.name,
        email: formData.email,
        contactNo: formData.contactNo,
      });
      
      setSuccessMessage('Account created successfully!');
      setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const renderContactForm = () => {
    return (
      <form onSubmit={handleStartAuth} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="flex">
            <select className="px-2 py-2 border rounded-l-md bg-gray-50">
              <option>+91</option>
            </select>
            <input
              type="tel"
              pattern="[0-9]{10}"
              value={formData.contactNo}
              onChange={(e) => {
                setError(null);
                setFormData({ ...formData, contactNo: e.target.value });
              }}
              className={`w-full px-3 py-2 border border-l-0 rounded-r-md ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter 10-digit number"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Sending OTP...' : 'Continue with OTP'}
        </button>
      </form>
    );
  };

  const renderOtpForm = () => {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm text-gray-700">
              Enter OTP
            </label>
            <button
              type="button"
              onClick={() => setAuthMode('CONTACT')}
              className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Change Number
            </button>
          </div>
          <input
            type="text"
            pattern="[0-9]{6}"
            value={formData.otp}
            onChange={(e) => {
              setError(null);
              setFormData({ ...formData, otp: e.target.value });
            }}
            className={`w-full px-3 py-2 border rounded-md ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter 6-digit OTP"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
    );
  };

  const renderSignupDetailsForm = () => {
    return (
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setError(null);
              setFormData({ ...formData, name: e.target.value });
            }}
            className={`w-full px-3 py-2 border rounded-md ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => {
              setError(null);
              setFormData({ ...formData, email: e.target.value });
            }}
            className={`w-full px-3 py-2 border rounded-md ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    );
  };

  const renderAuthContent = () => {
    switch (authMode) {
      case 'CONTACT':
        return renderContactForm();
      case 'OTP':
        return renderOtpForm();
      case 'SIGNUP_DETAILS':
        return renderSignupDetailsForm();
      case 'LOGIN_COMPLETE':
        return null;
      default:
        return renderContactForm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {authMode === 'SIGNUP_DETAILS' 
              ? 'Complete Your Registration' 
              : authMode === 'LOGIN_COMPLETE'
                ? 'Login Successful'
                : 'Sign In or Sign Up'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {authMode === 'CONTACT' 
              ? 'Enter your phone number to continue' 
              : authMode === 'OTP'
                ? 'Enter the OTP sent to your phone'
                : authMode === 'SIGNUP_DETAILS'
                  ? 'Please provide your details to complete registration'
                  : ''}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}

        {renderAuthContent()}

        <div className="mt-4 text-center text-sm text-gray-600">
          {authMode === 'CONTACT' && (
            <p>
              By continuing, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
