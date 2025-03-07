import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter as FilterIcon, X, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import PropertyCard from '../components/property/PropertyCard';
import Navbar from '../components/common/Navbar';
import { propertyApi } from '../services/api';
import { useApiError } from '../hooks/useApiError';
import { LOCATIONS, FLAT_TYPES, PRICE_RANGES } from '../constants/propertyConstants';

const ITEMS_PER_PAGE = 6;

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { error, handleError } = useApiError();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    flatType: searchParams.get('flatType') || '',
    priceRange: searchParams.get('priceRange') || '',
  });

  useEffect(() => {
    const hasActiveFilters = Object.values(filters).some(value => value !== '');
    if (hasActiveFilters) {
      fetchFilteredProperties();
    } else {
      fetchAllProperties();
    }
  }, [filters, currentPage]);

  const fetchAllProperties = async () => {
    setLoading(true);
    try {
      const response = await propertyApi.getAllProperties({
        page: currentPage - 1,
        size: ITEMS_PER_PAGE
      });
      setProperties(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredProperties = async () => {
    setLoading(true);
    try {
      const [minPrice, maxPrice] = filters.priceRange
        ? filters.priceRange.split('-').map(Number)
        : [null, null];

      const response = await propertyApi.search({
        location: filters.location || null,
        flatType: filters.flatType || null,
        minPrice,
        maxPrice,
        page: currentPage - 1,
        size: ITEMS_PER_PAGE
      });

      setProperties(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    setSearchParams(params => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      return params;
    });
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      flatType: '',
      priceRange: '',
    });
    setSearchParams({});
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Top Filter Bar */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            {/* Desktop Filters */}
            <div className="hidden md:flex flex-1 gap-4 items-center">
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="flex-1 p-2.5 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Locations</option>
                {LOCATIONS.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>

              <select
                value={filters.flatType}
                onChange={(e) => handleFilterChange('flatType', e.target.value)}
                className="flex-1 p-2.5 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Types</option>
                {FLAT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="flex-1 p-2.5 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Prices</option>
                {PRICE_RANGES.map((range) => (
                  <option key={range.label} value={`${range.min}-${range.max || ''}`}>
                    {range.label}
                  </option>
                ))}
              </select>

              {(filters.location || filters.flatType || filters.priceRange) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="md:hidden w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span>Filter Properties</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsFilterOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Filters</h2>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full p-3 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Locations</option>
                  {LOCATIONS.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flat Type
                </label>
                <select
                  value={filters.flatType}
                  onChange={(e) => handleFilterChange('flatType', e.target.value)}
                  className="w-full p-3 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {FLAT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="w-full p-3 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Prices</option>
                  {PRICE_RANGES.map((range) => (
                    <option key={range.label} value={`${range.min}-${range.max || ''}`}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 space-y-3">
              {(filters.location || filters.flatType || filters.priceRange) && (
                <button
                  onClick={() => {
                    clearFilters();
                    setIsFilterOpen(false);
                  }}
                  className="w-full py-2.5 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Properties{' '}
            <span className="text-gray-500 text-lg">
              ({properties.length} results)
            </span>
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No properties found matching your criteria.
            </p>
            <button onClick={clearFilters} className="mt-4 text-blue-600 hover:text-blue-800">
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {properties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="px-4 py-2 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
