import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const AdminUpdatePropertyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { error, setError, handleError } = useApiError();
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    propertyType: '',
    videoUrl: '',
    status: '',
    isFeatured: false,
    area: '',
    possessionDate: '',
    // images: array of { file: File|null, preview: string }
    images: [],
    // For documents, we store either a file object (if updated) or a URL (existing)
    brochure: '',
    layout: '',
    flats: [],
    characteristics: [],
  });

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await propertyApi.getById(id);
      const property = response.data;
      console.log("Fetched property images:", property.images); // Debug log
      setFormData({
        ...property,
        minPrice: property.minPrice.toString(),
        maxPrice: property.maxPrice.toString(),
        possessionDate: property.possessionDate
          ? new Date(property.possessionDate).toISOString().split('T')[0]
          : '',
        images: property.images
          ? property.images.map(img => ({
              // Use img.imageUrl if available, otherwise fall back to img.url
              preview: img.imageUrl || img.url || '',
              file: null,
            }))
          : [],
        flats: property.flats.map(flat => ({
          ...flat,
          area: flat.area.toString(),
          price: flat.price.toString(),
          totalUnits: flat.totalUnits.toString()
        })),
        characteristics: property.characteristics.map(char => ({
          key: char.keyName,
          value: char.valueName
        })),
        brochure: property.brochureUrl || '',
        layout: property.layoutUrl || '',
      });
      setError(null);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
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
      setFormData(prev => ({ ...prev, images: newImages }));
    }
  };

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));
    }
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { file: null, preview: null }],
    }));
  };

  const removeImageField = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleFlatChange = (index, field, value) => {
    const newFlats = [...formData.flats];
    newFlats[index] = { ...newFlats[index], [field]: value };
    setFormData(prev => ({ ...prev, flats: newFlats }));
  };

  const addFlatField = () => {
    setFormData(prev => ({
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
    setFormData(prev => ({
      ...prev,
      flats: prev.flats.filter((_, i) => i !== index),
    }));
  };

  const handleCharacteristicChange = (index, field, value) => {
    const newCharacteristics = [...formData.characteristics];
    newCharacteristics[index] = { ...newCharacteristics[index], [field]: value };
    setFormData(prev => ({ ...prev, characteristics: newCharacteristics }));
  };

  const addCharacteristicField = () => {
    setFormData(prev => ({
      ...prev,
      characteristics: [...prev.characteristics, { key: '', value: '' }],
    }));
  };

  const removeCharacteristicField = (index) => {
    setFormData(prev => ({
      ...prev,
      characteristics: prev.characteristics.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage('');

    try {
      if (!formData.name || !formData.location || !formData.description) {
        throw new Error('Please fill in all required fields');
      }
      if (parseFloat(formData.minPrice) > parseFloat(formData.maxPrice)) {
        throw new Error('Minimum price cannot be greater than maximum price');
      }
      if (!formData.flats.length) {
        throw new Error('Please add at least one flat configuration');
      }

      const data = {
        id: parseInt(id, 10),
        name: formData.name,
        description: formData.description,
        location: formData.location,
        minPrice: parseFloat(formData.minPrice),
        maxPrice: parseFloat(formData.maxPrice),
        propertyType: formData.propertyType,
        videoUrl: formData.videoUrl,
        status: formData.status,
        isFeatured: formData.isFeatured,
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
        // Note: images are not included in JSON since files are appended separately.
      };

      const fd = new FormData();
      // Append JSON data as a Blob with application/json content-type
      fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));

      // Append new image files (if replaced)
      formData.images.forEach((imgObj) => {
        if (imgObj && imgObj.file) {
          fd.append('images', imgObj.file);
        }
      });

      // Append brochure file if a new file is selected;
      // If no new file is selected, the existing brochure URL (string) will be sent in JSON data.
      if (typeof formData.brochure === 'object') {
        fd.append('brochure', formData.brochure);
      }
      // Append layout file if a new file is selected
      if (typeof formData.layout === 'object') {
        fd.append('layout', formData.layout);
      }

      await propertyApi.update(id, fd);
      setSuccessMessage('Property updated successfully!');
      setTimeout(() => {
        navigate('/admin/properties');
      }, 1500);
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'Please check your input data and try again');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to update properties');
      } else if (err.response?.status === 404) {
        setError('Property not found');
      } else {
        handleError(err);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Update Property</h1>

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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Name
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Price
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Price
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type
              </label>
              <input
                type="text"
                name="propertyType"
                value={formData.propertyType}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video URL
              </label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                placeholder="Enter video URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Featured Property
              </label>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full p-2 border rounded-md"
              required
            ></textarea>
          </div>
        </div>

        {/* Characteristics Section - Move it up, right after Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Property Characteristics</h2>
              <p className="text-sm text-gray-500 mt-1">Add key features and amenities of the property</p>
            </div>
            <button
              type="button"
              onClick={addCharacteristicField}
              className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Feature
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.characteristics.map((characteristic, index) => (
              <div 
                key={index} 
                className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg group hover:bg-blue-50 transition-colors"
              >
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Feature Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Parking"
                    value={characteristic.key}
                    onChange={(e) => handleCharacteristicChange(index, 'key', e.target.value)}
                    className="w-full p-2 border rounded-md bg-white"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="e.g., 2 Covered Parking Spots"
                    value={characteristic.value}
                    onChange={(e) => handleCharacteristicChange(index, 'value', e.target.value)}
                    className="w-full p-2 border rounded-md bg-white"
                    required
                  />
                </div>
                <div className="flex items-end">
                  {formData.characteristics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCharacteristicField(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove characteristic"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {formData.characteristics.length === 0 && (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No characteristics added yet.</p>
                <button
                  type="button"
                  onClick={addCharacteristicField}
                  className="mt-2 inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Feature
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Images Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Property Images</h2>
            <button
              type="button"
              onClick={addImageField}
              className="text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            {formData.images.map((image, index) => {
              // Debug log: Check what's stored in each image object
              console.log(`Image ${index}:`, image);
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(index, e)}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  {image.preview ? (
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="h-16 w-16 object-cover rounded"
                    />
                  ) : null}
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              );
            })}
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
                    <a href={formData.brochure} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline">
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
                    <a href={formData.layout} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline">
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

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Update Property
              </>
            )}
          </button>
        </div>
      </form>
    </div>
    </AdminLayout>
  );
};

export default AdminUpdatePropertyPage;
