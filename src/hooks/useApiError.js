import { useState } from 'react';

export const useApiError = () => {
  const [error, setError] = useState(null);

  const handleError = (error) => {
    if (error.response) {
      // Server responded with error
      setError(error.response.data.message || 'Something went wrong');
    } else if (error.request) {
      // Request made but no response
      setError('Network error. Please try again.');
    } else {
      // Other errors
      setError('An error occurred. Please try again.');
    }
  };

  return { error, setError, handleError };
}; 