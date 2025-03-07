import React from 'react';
import { X, MapPin } from 'lucide-react';
import { LOCATIONS } from '../../constants/propertyConstants';
import { motion } from 'framer-motion';

const LocationModal = ({ onClose, onSelect }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-xl"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Select Location
            </h2>
            <p className="text-gray-500 text-sm mt-1">Choose your preferred location</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {LOCATIONS.map((location, index) => (
            <motion.button
              key={location}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                transition: { delay: index * 0.1 }
              }}
              onClick={() => onSelect(location)}
              className="group flex items-center p-4 border-2 border-gray-100 rounded-xl bg-white hover:border-blue-500 transition-all duration-300 hover:shadow-md"
            >
              <div className="ml-4 flex-grow text-center">
                <h3 className="text-lg font-medium text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                  {location}
                </h3>
                {/* <div className="mt-1 h-0.5 w-12 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" /> */}
              </div>
              {/* <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.div
                  initial={false}
                  animate={{ rotate: 90 }}
                  className="w-5 h-5 text-blue-600"
                >
                  →
                </motion.div>
              </div> */}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LocationModal; 