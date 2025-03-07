import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Building, Users, TrendingUp } from 'lucide-react';
import { LOCATIONS } from '../../constants/propertyConstants';

const LocationSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
          >
            Prime Locations
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            Explore our carefully selected locations offering the perfect blend of comfort and convenience
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {LOCATIONS.map((location, index) => (
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-500"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-200 group-hover:bg-blue-400 transition-colors" />
                  <div className="w-2 h-2 rounded-full bg-blue-200 group-hover:bg-blue-400 transition-colors delay-100" />
                  <div className="w-2 h-2 rounded-full bg-blue-200 group-hover:bg-blue-400 transition-colors delay-200" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300 mb-3">
                {location}
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-600 text-sm">
                  <Building className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Premium Properties</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Users className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Growing Community</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                  <span>High ROI</span>
                </div>
              </div>

              <div className="mt-6 h-1 w-16 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LocationSection; 