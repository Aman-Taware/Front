import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { MapPin, Building, Calendar, Heart, Ruler } from 'lucide-react';
// import { shortlistApi } from '../../services/api';

const PROPERTY_STATUS = {
  AVAILABLE: 'AVAILABLE',
  SOLD: 'SOLD',
  UNDER_CONSTRUCTION: 'UNDER_CONSTRUCTION',
};

const PropertyCard = ({ property, showName = true, onPropertyClick }) => {
  const [isShortlisted, setIsShortlisted] = useState(false);
  const navigate = useNavigate();

  // const handleShortlist = async (e) => {
  //   e.preventDefault();
  //   e.stopPropagation(); // Prevent navigating to property detail page
    
  //   // Check if authenticated before shortlisting
  //   const token = localStorage.getItem('jwtToken');
  //   if (!token) {
  //     // Don't attempt to shortlist if not authenticated
  //     console.log('User not authenticated, cannot shortlist property');
  //     return;
  //   }
    
  //   try {
  //     await shortlistApi.add(property.id);
  //     setIsShortlisted(true);
  //   } catch (error) {
  //     console.error('Failed to shortlist property:', error);
  //   }
  // };

  const handleClick = () => {
    if (onPropertyClick) {
      onPropertyClick(property.id);
    } else {
      navigate(`/properties/${property.id}`);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case PROPERTY_STATUS.AVAILABLE:
        return 'bg-green-100 text-green-800';
      case PROPERTY_STATUS.SOLD:
        return 'bg-red-100 text-red-800';
      case PROPERTY_STATUS.UNDER_CONSTRUCTION:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to format price into lakhs and crores
  const formatPrice = (price) => {
    let formatted;
    if (price >= 10000000) {
      formatted = (price / 10000000).toFixed(2);
      if (formatted.endsWith('.00')) {
        formatted = formatted.slice(0, -3);
      }
      return formatted + " Cr";
    } else if (price >= 100000) {
      formatted = (price / 100000).toFixed(2);
      if (formatted.endsWith('.00')) {
        formatted = formatted.slice(0, -3);
      }
      return formatted + " Lakh";
    } else {
      return price.toLocaleString();
    }
  };
  



  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative">
        <img
          src={property.imageUrl}
          alt={property.name}
          className="w-full h-64 object-cover"
        />
        {/* <button
          onClick={handleShortlist}
          className={`absolute top-4 right-4 p-2 rounded-full ${
            isShortlisted ? 'bg-red-500' : 'bg-white'
          }`}
        >
          <Heart
            className={`h-5 w-5 ${
              isShortlisted ? 'text-white fill-current' : 'text-gray-600'
            }`}
          />
        </button> */}
        <div className="absolute top-4 left-4 bg-blue-600 text-white px-2 py-1 rounded text-sm">
          Featured
        </div>
        <span className={`absolute bottom-4 right-4 p-2 rounded-full text-sm ${getStatusColor(property.status)}`}>
          {property.status ? property.status.replace('_', ' ') : 'Status Unknown'}
        </span>
      </div>

      <div className="p-6">
        {showName && <h3 className="text-xl font-semibold mb-2">{property.name}</h3>}

        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="text-sm">{property.location}</span>
        </div>

        <div className="flex items-center text-gray-600 mb-2">
          <Building className="h-4 w-4 mr-2" />
          <span className="text-sm">{property.flatTypes.join(', ')}</span>
        </div>

        <div className="flex items-center text-gray-600 mb-2">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="text-sm">Possession: {format(new Date(property.possessionDate), 'MMM dd')}</span>
          {/* <span>Possession: {format(new Date(property.possessionDate), 'MMM dd')}</span> */}
        </div>

        <div className="flex items-center text-gray-600 mb-4">
          <Ruler className="h-4 w-4 mr-2" />
          <span className="text-sm">{property.area} sq ft</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-blue-600 font-semibold text-lg">
          ₹{formatPrice(property.minPrice)} - ₹{formatPrice(property.maxPrice)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
