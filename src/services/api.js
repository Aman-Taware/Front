import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log all API requests in development
    if (import.meta.env.MODE === 'development') {
      console.log(`API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, 
                  config.data || config.params);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if it's an auth error and not for public endpoints
    const publicEndpoints = ['/property/featured', '/property'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      error.config?.url?.includes(endpoint)
    );
    
    if ((error.response?.status === 403 || error.response?.status === 401) && !isPublicEndpoint) {
      localStorage.removeItem('jwtToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// API service modules
export const authApi = {
  // New passwordless auth endpoints
  startAuth: (contactNo) => api.post('/auth/start', { contactNo }),
  verifyAuthOtp: (data) => api.post('/auth/verify-otp', data),
  signin: (contactNo) => api.post('/signin', { contactNo }),
  signup: (userData) => api.post('/signup', userData),
  
  // Legacy API endpoints for OTP (to be used in a different flow now)
  generateOtp: (data) => api.post('/otp/generate', data),
  verifyOtp: async (contactNo, otp) => {
    const response = await api.post('/api/auth/verify-otp', { contactNo, otp });
    if (response.data.success) {
      if (response.data.isExistingUser) {
        // User exists - store token and redirect to dashboard
        localStorage.setItem('token', response.data.token);
        return { success: true, isExisting: true };
      } else {
        // New user - redirect to registration form
        return { success: true, isExisting: false };
      }
    }
    return { success: false, message: response.data.message };
  },
};

export const propertyApi = {
  getAllProperties: (params) => api.get('/property', { params }),
  getFeatured: () => api.get('/property/featured'),
  getById: (id) => api.get(`/property/${id}`),
  search: (params) => api.get('/property/search', { params }),
  // Admin endpoints
  create: (data) => api.post('/admin/properties', data),
  update: (id, data) => api.put(`/admin/properties/${id}`, data),
  delete: (id) => api.delete(`/admin/properties/${id}`),
  getAdminProperties: () => api.get('/admin/properties'),
};

export const bookingApi = {
  getUserBookings: () => api.get('/users/bookings'),
  create: (propertyId, data) => api.post(`/property/${propertyId}/book`, data),
  update: (bookingId, data) => api.put(`/admin/bookings/${bookingId}`, data),
  getUserPropertyBooking: (propertyId) => api.get(`/property/${propertyId}/user-booking`),
  getAllBookings: () => api.get('/admin/bookings'),
};

export const shortlistApi = {
  add: (propertyId) => api.post(`/property/${propertyId}/shortlist`),
  getUserShortlist: () => api.get('/users/shortlist'),
  remove: (shortlistId) => api.delete(`/users/shortlist/${shortlistId}`),
  toggle: (propertyId) => api.post(`/property/${propertyId}/toggle-shortlist`),
};

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

const completeRegistration = async (userData) => {
  const response = await api.post('/api/auth/signup', userData);
  if (response.data.success) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
}; 