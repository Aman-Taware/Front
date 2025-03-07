import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Shield,
  Clock,
  Users,
  Home,
  Aperture,
  Filter,
  Calendar,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { propertyApi } from '../services/api';
import Navbar from '../components/common/Navbar';
import PropertyCard from '../components/property/PropertyCard';
import Footer from '../components/common/Footer';
import AuthModal from '../components/auth/AuthModal';
import { useApiError } from '../hooks/useApiError';
import { LOCATIONS } from '../constants/propertyConstants';
import { toast } from 'react-hot-toast';
import LocationModal from '../components/home/LocationModal';

const HomePage = () => {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { error, handleError } = useApiError();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {

      try {
        setLoading(true);
        const response = await propertyApi.getFeatured();
        setFeaturedProperties(response.data);
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    
  };

  const handleSearch = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (selectedLocation) {
      navigate(`/search?location=${selectedLocation}`);
    }
  };

  const handlePropertyClick = (propertyId) => {
    if (!user) {
      setIsAuthModalOpen(true);
      toast.error('Log in required for this feature');
      return;
    }
    navigate(`/properties/${propertyId}`);
  };


  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section with Parallax Effect */}
      <div className="relative h-[80vh] overflow-hidden">
        <div className="absolute inset-0 transform scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: 'translateZ(-1px) scale(2)',
          }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center items-center text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Discover Your Perfect Home
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl">
            Explore our curated selection of premium properties and find the perfect place to call home
          </p>

          <div className="w-full max-w-2xl">
            <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-xl overflow-hidden">
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="flex-1 p-4 text-left text-gray-700 hover:bg-gray-50 transition-colors flex items-center group"
              >
                <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                <span className="flex-grow">{selectedLocation || 'Select Your Location'}</span>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-200" />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                </div>
              </button>
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-8 py-4 flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Search className="h-5 w-5" />
                <span className="ml-2">Search</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Featured Properties Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-4 py-20"
      >
        <motion.h2
          variants={itemVariants}
          className="text-4xl font-bold text-center mb-4"
        >
          Featured Properties
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-gray-600 text-center mb-12 max-w-2xl mx-auto"
        >
          Explore our hand-picked selection of premium properties
        </motion.p>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                transition={{ type: "tween" }}
              >
                <PropertyCard
                  property={property}
                  showName={false}
                  onPropertyClick={handlePropertyClick}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Why Choose Us Section with Modern Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="bg-white py-20"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            variants={itemVariants}
            className="text-4xl font-bold text-center mb-4"
          >
            Why Choose Us
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-gray-600 text-center mb-12 max-w-2xl mx-auto"
          >
            Experience the difference with our premium services
          </motion.p>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield, title: "Trusted Platform", desc: "Verified properties and trusted by thousands" },
              { icon: Clock, title: "24/7 Support", desc: "Round-the-clock assistance for queries" },
              { icon: Users, title: "Expert Guidance", desc: "Professional advice from experts" },
              { icon: Home, title: "Wide Selection", desc: "Extensive range of properties" }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group hover:bg-blue-50 p-6 rounded-xl transition-colors duration-300"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                  <item.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Features Section with Hover Effects */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="bg-gray-50 py-20"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            variants={itemVariants}
            className="text-4xl font-bold text-center mb-4"
          >
            Our Features
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-gray-600 text-center mb-12 max-w-2xl mx-auto"
          >
            Discover what makes us different
          </motion.p>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Aperture, title: "Virtual Tours", desc: "Experience properties from your home" },
              { icon: Filter, title: "Smart Search", desc: "Find perfect properties easily" },
              { icon: Calendar, title: "Instant Booking", desc: "Schedule visits instantly" }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <Footer />

      {/* Modals */}
      {isLocationModalOpen && (
        <LocationModal
          onClose={() => setIsLocationModalOpen(false)}
          onSelect={(location) => {
            setSelectedLocation(location);
            setIsLocationModalOpen(false);
          }}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsAuthModalOpen(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default HomePage;
