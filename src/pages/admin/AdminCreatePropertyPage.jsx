import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Upload } from 'lucide-react';
import { propertyApi } from '../../services/api';
import { useApiError } from '../../hooks/useApiError';
import AdminLayout from '../../components/layouts/AdminLayout';

import { 
  PROPERTY_TYPES, 
  PROPERTY_STATUS, 
  FLAT_AVAILABILITY,
  LOCATIONS 
} from '../../constants/propertyConstants';

const AdminCreatePropertyPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { error, setError, handleError } = useApiError();
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    propertyType: PROPERTY_TYPES[0],
    videoUrl: '', // Video URL field
    status: PROPERTY_STATUS[0],
    isFeatured: false,
    area: '', // New area field
    possessionDate: '',
    images: [],
    brochure: null,
    layout: null,
    flats: [
      {
        type: '',
        area: '',
        price: '',
        availability: FLAT_AVAILABILITY[0],
        totalUnits: '',
      },
    ],
    characteristics: [{ key: '', value: '' }],
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      const newImages = [...formData.images];
      newImages[index] = { file, preview };
      setFormData((prev) => ({ ...prev, images: newImages }));
    }
  };

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [field]: file }));
    }
  };

  const addImageField = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, { file: null, preview: null }],
    }));
  };

  const removeImageField = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleFlatChange = (index, field, value) => {
    const newFlats = [...formData.flats];
    newFlats[index] = { ...newFlats[index], [field]: value };
    setFormData((prev) => ({ ...prev, flats: newFlats }));
  };

  const addFlatField = () => {
    setFormData((prev) => ({
      ...prev,
      flats: [
        ...prev.flats,
        {
          type: '',
          area: '',
          price: '',
          availability: FLAT_AVAILABILITY[0],
          totalUnits: '',
        },
      ],
    }));
  };

  const removeFlatField = (index) => {
    setFormData((prev) => ({
      ...prev,
      flats: prev.flats.filter((_, i) => i !== index),
    }));
  };

  const handleCharacteristicChange = (index, field, value) => {
    const newCharacteristics = [...formData.characteristics];
    newCharacteristics[index] = { ...newCharacteristics[index], [field]: value };
    setFormData((prev) => ({ ...prev, characteristics: newCharacteristics }));
  };

  const addCharacteristicField = () => {
    setFormData((prev) => ({
      ...prev,
      characteristics: [...prev.characteristics, { key: '', value: '' }],
    }));
  };

  const removeCharacteristicField = (index) => {
    setFormData((prev) => ({
      ...prev,
      characteristics: prev.characteristics.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      // Validate form data
      if (!formData.name || !formData.location || !formData.description) {
        throw new Error('Please fill in all required fields');
      }
      if (parseFloat(formData.minPrice) > parseFloat(formData.maxPrice)) {
        throw new Error('Minimum price cannot be greater than maximum price');
      }
      if (!formData.flats.length) {
        throw new Error('Please add at least one flat configuration');
      }

      // Prepare the non-file data as JSON
      const data = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        minPrice: parseFloat(formData.minPrice),
        maxPrice: parseFloat(formData.maxPrice),
        propertyType: formData.propertyType,
        videoUrl: formData.videoUrl,
        status: formData.status,
        featured: formData.isFeatured, // Changed key from isFeatured to featured
        area: formData.area,
        possessionDate: formData.possessionDate || null,
        flats: formData.flats.map(flat => ({
          ...flat,
          area: parseFloat(flat.area),
          price: parseFloat(flat.price),
          totalUnits: parseInt(flat.totalUnits, 10),
        })),
        characteristics: formData.characteristics
          .filter(char => char.key && char.value)
          .map(char => ({
            keyName: char.key,
            valueName: char.value,
          })),
      };

      // Build FormData for multipart upload
      const fd = new FormData();
      fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));

      // Append image files
      formData.images.forEach((imgObj) => {
        if (imgObj && imgObj.file) {
          fd.append('images', imgObj.file);
        }
      });

      // Append brochure file if available
      if (formData.brochure) {
        fd.append('brochure', formData.brochure);
      }

      // Append layout file if available
      if (formData.layout) {
        fd.append('layout', formData.layout);
      }

      await propertyApi.create(fd);
      setSuccessMessage('Property created successfully!');
      
      setTimeout(() => {
        navigate('/admin/properties');
      }, 1500);
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'Please check your input data and try again');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to create properties');
      } else {
        handleError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Create New Property</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Property Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Location*
                </label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select Location</option>
                  {LOCATIONS.map(location => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Property Type*
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Status*
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  {PROPERTY_STATUS.map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Minimum Price*
                </label>
                <input
                  type="number"
                  name="minPrice"
                  value={formData.minPrice}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Price*
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  value={formData.maxPrice}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              {/* New Area Field */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Area*
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g., 1500 sq.ft"
                  required
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Description*
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Possession Date*
                </label>
                <input
                  type="date"
                  name="possessionDate"
                  value={formData.possessionDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Video URL
                </label>
                <input
                  type="text"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter video URL"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <label className="text-sm font-medium text-gray-700">
                  Featured Property
                </label>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">Property Images</h2>
              <button
                type="button"
                onClick={addImageField}
                className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Image
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
                    {image && image.preview ? (
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <label className="cursor-pointer text-center p-4">
                          <Upload className="h-6 w-6 mx-auto text-gray-400" />
                          <span className="mt-2 block text-sm text-gray-600">
                            Click to upload
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(index, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brochure
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange('brochure', e)}
                  className="w-full p-2 border rounded-md"
                />
                {formData.brochure && (
                  <div className="mt-1">
                    {typeof formData.brochure === 'object' ? (
                      <p className="text-sm text-gray-500">{formData.brochure.name}</p>
                    ) : (
                      <a
                        href={formData.brochure}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 underline"
                      >
                        View Existing Brochure
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Layout
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  onChange={(e) => handleFileChange('layout', e)}
                  className="w-full p-2 border rounded-md"
                />
                {formData.layout && (
                  <div className="mt-1">
                    {typeof formData.layout === 'object' ? (
                      <p className="text-sm text-gray-500">{formData.layout.name}</p>
                    ) : (
                      <a
                        href={formData.layout}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 underline"
                      >
                        View Existing Layout
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Flats Configuration Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Flat Configurations</h2>
              <button
                type="button"
                onClick={addFlatField}
                className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Configuration
              </button>
            </div>
            <div className="space-y-6">
              <div className="hidden sm:grid sm:grid-cols-6 gap-4 px-4 text-sm font-medium text-gray-500">
                <div>Type</div>
                <div>Area (sq ft)</div>
                <div>Price</div>
                <div>Availability</div>
                <div>Total Units</div>
                <div></div>
              </div>
              {formData.flats.map((flat, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="sm:hidden flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-900">Configuration {index + 1}</h3>
                    {formData.flats.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFlatField(index)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700 sm:hidden">Type</label>
                      <input
                        type="text"
                        placeholder="e.g., 2BHK"
                        value={flat.type}
                        onChange={(e) => handleFlatChange(index, 'type', e.target.value)}
                        className="w-full p-2 border rounded-md bg-white"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700 sm:hidden">Area (sq ft)</label>
                      <input
                        type="number"
                        placeholder="Area"
                        value={flat.area}
                        onChange={(e) => handleFlatChange(index, 'area', e.target.value)}
                        className="w-full p-2 border rounded-md bg-white"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700 sm:hidden">Price</label>
                      <input
                        type="number"
                        placeholder="Price"
                        value={flat.price}
                        onChange={(e) => handleFlatChange(index, 'price', e.target.value)}
                        className="w-full p-2 border rounded-md bg-white"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700 sm:hidden">Availability</label>
                      <select
                        value={flat.availability}
                        onChange={(e) => handleFlatChange(index, 'availability', e.target.value)}
                        className="w-full p-2 border rounded-md bg-white"
                        required
                      >
                        {FLAT_AVAILABILITY.map(status => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700 sm:hidden">Total Units</label>
                      <input
                        type="number"
                        placeholder="Units"
                        value={flat.totalUnits}
                        onChange={(e) => handleFlatChange(index, 'totalUnits', e.target.value)}
                        className="w-full p-2 border rounded-md bg-white"
                        required
                      />
                    </div>
                    <div className="hidden sm:flex items-center justify-end">
                      {formData.flats.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFlatField(index)}
                          className="text-red-600 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                          title="Remove configuration"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {formData.flats.length === 0 && (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No flat configurations added yet.</p>
                  <button
                    type="button"
                    onClick={addFlatField}
                    className="mt-2 inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Configuration
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Characteristics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Characteristics</h2>
              <button
                type="button"
                onClick={addCharacteristicField}
                className="text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              {formData.characteristics.map((characteristic, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Key"
                      value={characteristic.key}
                      onChange={(e) => handleCharacteristicChange(index, 'key', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Value"
                      value={characteristic.value}
                      onChange={(e) => handleCharacteristicChange(index, 'value', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  {formData.characteristics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCharacteristicField(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Create Property
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminCreatePropertyPage;
