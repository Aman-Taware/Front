import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import { bookingApi } from '../services/api';
import { useApiError } from '../hooks/useApiError';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { error, handleError } = useApiError();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingApi.getUserBookings();
      setBookings(response.data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">My Bookings</h1>
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">No bookings found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow p-4 flex flex-col"
              >
                {/* Image Section */}
                <div className="mb-2">
                  <img
                    src={booking.imageUrl || '/placeholder.jpg'}
                    alt={booking.propertyName}
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
                {/* Details Section */}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold mb-1">{booking.propertyName}</h2>
                  <p className="text-xs text-gray-600 mb-2">{booking.location}</p>
                  <div
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {booking.status}
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <Calendar className="h-4 w-4 mr-1 text-blue-600" />
                  <span className="text-xs">
                    {format(new Date(booking.visitDate), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;
