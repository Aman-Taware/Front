import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { propertyApi } from '../../services/api';
import { useApiError } from '../../hooks/useApiError';

const ITEMS_PER_PAGE = 10;

const PropertiesManagement = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { error, setError, handleError } = useApiError();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await propertyApi.getAdminProperties();
      setProperties(response.data);
      setError(null);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId) => {
    try {
      await propertyApi.delete(propertyId);
      setSuccessMessage('Property deleted successfully');
      setShowDeleteModal(false);
      setPropertyToDelete(null);
      fetchProperties();
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to delete properties');
      } else if (err.response?.status === 404) {
        setError('Property not found');
      } else {
        handleError(err);
      }
    }
  };

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProperties = filteredProperties.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Properties Management</h1>
          <button
            onClick={() => navigate('/admin/properties/create')}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Property
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md"
            />
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md">
            <span className="text-sm">{successMessage}</span>
          </div>
        )}

        {/* Properties List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {paginatedProperties.map((property) => (
              <div 
                key={property.id} 
                className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0">
                    <img
                      className="h-full w-full rounded-md object-cover"
                      src={property.images[0]?.imageUrl || '/placeholder.jpg'}
                      alt={property.name}
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{property.name}</div>
                    <div className="text-sm text-gray-500">{property.location}</div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => navigate(`/admin/properties/edit/${property.id}`)}
                    className="p-2 text-blue-600 hover:text-blue-900 rounded-full hover:bg-blue-50"
                    aria-label="Edit property"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setPropertyToDelete(property);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50"
                    aria-label="Delete property"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 rounded-md bg-white border disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 rounded-md bg-white border disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg max-w-md w-full mx-4">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Confirm Delete</h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Are you sure you want to delete "{propertyToDelete.name}"? This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPropertyToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(propertyToDelete.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PropertiesManagement;