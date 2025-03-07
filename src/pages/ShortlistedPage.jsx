import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import CompactPropertyCard from '../components/property/CompactPropertyCard';
import { shortlistApi } from '../services/api';
import { useApiError } from '../hooks/useApiError';

const ShortlistedPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { error, handleError } = useApiError();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchShortlistedProperties();
  }, []);

  const fetchShortlistedProperties = async () => {
    try {
      const response = await shortlistApi.getUserShortlist();
      // Validate and transform data if needed
      const validProperties = response.data.filter(property => 
        property && property.shortlistId && property.propertyId
      );
      setProperties(validProperties);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (shortlistId) => {
    try {
      await shortlistApi.remove(shortlistId);
      setProperties(properties.filter(p => p.shortlistId !== shortlistId));
      showToastMessage('Property removed from shortlist');
    } catch (err) {
      handleError(err);
    }
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Shortlisted Properties</h1>
          <span className="text-gray-600">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </span>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg">No properties shortlisted yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map(property => (
              <CompactPropertyCard
                key={property.shortlistId}
                property={property}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </div>

      {showToast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-md shadow-lg flex items-center">
          <Check className="h-5 w-5 mr-2" />
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default ShortlistedPage;