import React from 'react';
import { MapPin, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CompactPropertyCard = ({ property, onRemove }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/properties/${property.propertyId}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div 
        onClick={handleCardClick}
        className="cursor-pointer"
      >
        <div className="relative">
          <img
            src={property.imageUrl || '/placeholder-property.jpg'}
            alt={property.name}
            className="w-full h-48 object-cover"
          />
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click when removing
              onRemove(property.shortlistId);
            }}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
            {property.name}
          </h3>
          
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm">{property.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactPropertyCard; 