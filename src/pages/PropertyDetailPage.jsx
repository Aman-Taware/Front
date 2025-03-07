import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { format, addDays } from 'date-fns';
import {
  Heart,
  Calendar,
  FileText,
  Video,
  Layout,
  MapPin,
  Check,
  X,
  Home,
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useApiError } from '../hooks/useApiError';
import AuthModal from '../components/auth/AuthModal';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { propertyApi, shortlistApi, bookingApi } from '../services/api';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const { error, handleError } = useApiError();
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedFlatType, setSelectedFlatType] = useState(null);
  const [existingBooking, setExistingBooking] = useState(null);

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  // Separate useEffect for user-dependent operations
  useEffect(() => {
    if (user) {
      checkExistingBooking();
    }
  }, [id, user]);

  const fetchPropertyDetails = async () => {
    try {
      const response = await propertyApi.getById(id);
      setProperty(response.data);

      // Only check shortlist status if user is authenticated
      if (user) {
        try {
          const shortlist = await shortlistApi.getUserShortlist();
          setIsShortlisted(shortlist.data.some(item => item.propertyId === id));
        } catch (shortlistErr) {
          console.error('Failed to fetch shortlist status:', shortlistErr);
        }
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingBooking = async () => {
    try {
      const response = await bookingApi.getUserPropertyBooking(id);
      setExistingBooking(response.data);
    } catch (err) {
      handleError(err);
    }
  };

  const toggleShortlist = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      const response = await shortlistApi.toggle(id);
      setIsShortlisted(response.data.isShortlisted);
      showToastMessage(response.data.message);
    } catch (err) {
      handleError(err);
    }
  };

  const handleBookVisit = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!selectedDate) {
      showToastMessage('Please select a date');
      return;
    }

    try {
      await bookingApi.create(id, { visitDate: selectedDate });
      showToastMessage('Visit scheduled successfully!');
      setShowBookingModal(false);
      checkExistingBooking();
    } catch (err) {
      handleError(err);
    }
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Helper function to format price into lakhs and crores
  const formatPrice = (price) => {
    let formatted;
    if (price >= 10000000) {
      formatted = (price / 10000000).toFixed(2);
      if (formatted.endsWith('.00')) formatted = formatted.slice(0, -3);
      return formatted + " Cr";
    } else if (price >= 100000) {
      formatted = (price / 100000).toFixed(2);
      if (formatted.endsWith('.00')) formatted = formatted.slice(0, -3);
      return formatted + " Lakh";
    } else {
      return price.toLocaleString();
    }
  };

  // Section A: Image Carousel Settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
  };

  const getFlatTypes = () => {
    if (!property?.flats) return [];
    return [...new Set(property.flats.map(flat => flat.type))];
  };

  const getFilteredFlats = () => {
    if (!property?.flats) return [];
    return selectedFlatType
      ? property.flats.filter(flat => flat.type === selectedFlatType)
      : property.flats;
  };

  // WhatsApp chat initialization for location
  const handleLocationClick = () => {
    if (existingBooking) {
      const prepopulatedMessage = encodeURIComponent(
        `Hello, I would like to know the location details for ${property.name}.`
      );
      // WhatsApp URL format: https://api.whatsapp.com/send?phone=<number>&text=<message>
      const whatsAppUrl = `https://api.whatsapp.com/send?phone=+918605606565&text=${prepopulatedMessage}`;
      window.open(whatsAppUrl, '_blank');
    } else {
      showToastMessage("Please book a visit to access the location");
      setShowBookingModal(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Section A: Property Images and Basic Info */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="h-[500px]">
            <Slider {...sliderSettings}>
              {property.images.map((image, index) => (
                <div key={index} className="h-[500px]">
                  <img
                    src={image.url}
                    alt={`Property ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </Slider>
          </div>
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{property.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{property.location}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                <span>Possession: {format(new Date(property.possessionDate), 'MMM dd')}</span>
              </div>
              <div className="flex items-center">
                <Home className="h-5 w-5 mr-2" />
                <span>Area: {property.area} sq ft</span>
              </div>
              <div className="text-2xl font-semibold text-blue-600">
                ₹{formatPrice(property.minPrice)} - ₹{formatPrice(property.maxPrice)}
                <span className="text-sm text-gray-500 ml-2">(Negotiable)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section B: Downloads & Resources */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Downloads & Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {property.brochureUrl && (
              <a
                href={property.brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-4 border rounded-lg hover:border-blue-600 hover:text-blue-600"
              >
                <FileText className="h-5 w-5 mr-2" />
                Brochure
              </a>
            )}
            {property.layoutUrl && (
              <a
                href={property.layoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-4 border rounded-lg hover:border-blue-600 hover:text-blue-600"
              >
                <Layout className="h-5 w-5 mr-2" />
                Layout
              </a>
            )}
            {property.videoUrl && (
              <a
                href={property.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-4 border rounded-lg hover:border-blue-600 hover:text-blue-600"
              >
                <Video className="h-5 w-5 mr-2" />
                Video
              </a>
            )}
            {/* New Location Button */}
            <button
              onClick={handleLocationClick}
              className="flex items-center justify-center p-4 border rounded-lg hover:border-blue-600 hover:text-blue-600"
            >
              <MapPin className="h-5 w-5 mr-2" />
              Location
            </button>
          </div>
        </div>

        {/* Section C: Flat Types */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Available Configurations</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {getFlatTypes().map((type) => (
              <button
                key={type}
                onClick={() => setSelectedFlatType(selectedFlatType === type ? null : type)}
                className={`p-4 rounded-lg transition-all duration-300 ${selectedFlatType === type
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <div className="text-lg font-medium">{type}</div>
                <div className="text-sm mt-1">
                  {property.flats.filter(flat => flat.type === type).length} variants
                </div>
              </button>
            ))}
          </div>
          {selectedFlatType && (
            <div className="mt-6">
              <div className="grid grid-cols-1 gap-4">
                {getFilteredFlats().map((flat, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex flex-row justify-between items-center">
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 uppercase">Area</div>
                        <div className="text-sm font-medium text-gray-800 mt-1">
                          {flat.area} sq ft
                        </div>
                      </div>
                      <div className="flex-1 text-right">
                        <div className="text-xs text-gray-500 uppercase">Price</div>
                        <div className="text-l font-bold text-blue-600 mt-1">
                          ₹{formatPrice(flat.price)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section D: Characteristics */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Property Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {property.characteristics.map((char, index) => (
              <div key={index} className="flex items-center p-3 border rounded-lg">
                <div className="min-w-0">
                  <p className="text-sm text-gray-900 font-medium truncate">
                    {char.keyName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {char.valueName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section E: Description */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-20">
          <h2 className="text-2xl font-semibold mb-4">About this property</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {property.description}
          </p>
        </div>
      </div>

      {/* Section F: Sticky Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={toggleShortlist}
            className={`flex items-center px-6 py-3 rounded-lg transition-all duration-300 ${isShortlisted
              ? 'bg-red-50 text-red-600 border-2 border-red-600 hover:bg-red-100'
              : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
          >
            <Heart className="h-5 w-5 mr-2 fill-current stroke-current transition-colors duration-300" />
            <span className="font-medium">
              {isShortlisted ? 'Shortlisted' : 'Add to Shortlist'}
            </span>
          </button>

          {existingBooking ? (
            <div className="flex items-center px-6 py-3 bg-gray-50 text-gray-700 rounded-lg border border-gray-200">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              <div>
                <div className="font-medium">Visit Scheduled</div>
                <div className="text-sm text-gray-500">
                  {format(new Date(existingBooking.visitDate), 'MMMM d, yyyy')}
                  {existingBooking.status === 'PENDING' && ' (Pending)'}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowBookingModal(true)}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Calendar className="h-5 w-5 mr-2" />
              <span className="font-medium">Book Visit</span>
            </button>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Schedule a Visit</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <input
                type="date"
                min={format(new Date(), 'yyyy-MM-dd')}
                max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Note: Visit can only be booked within the next 30 days.
            </p>
            <button
              onClick={handleBookVisit}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            window.location.reload();
          }}
        />
      )}

      {/* Toast Message */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-md shadow-lg flex items-center">
          <Check className="h-5 w-5 mr-2" />
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default PropertyDetailPage;
