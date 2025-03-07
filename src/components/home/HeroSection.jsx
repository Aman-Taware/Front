import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { LOCATIONS } from '../../constants/propertyConstants';

const HeroSection = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (selectedLocation) {
      navigate(`/search?location=${selectedLocation}`);
    }
  };

  return (
    <section className="relative h-[600px] flex items-center">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format"
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Find Your Dream Property
          </h1>
          <p className="text-xl mb-8">
            Discover properties in prime locations
          </p>
          
          <form onSubmit={handleSearch} className="flex gap-4 max-w-xl mx-auto">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 bg-white"
            >
              <option value="">Select Location</option>
              {LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
              disabled={!selectedLocation}
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 