import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, ChevronRight } from 'lucide-react';
import { bookingApi } from '../../services/api';
import { format } from 'date-fns';
import AdminLayout from '../../components/layouts/AdminLayout';

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [expandedBooking, setExpandedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.getAllBookings();
      setBookings(response.data);
    } catch (error) {
      showToast('Failed to fetch bookings', 'error');
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (booking, newStatus) => {
    try {
      const updateData = {
        id: booking.id,
        visitDate: booking.visitDate,
        status: newStatus
      };
      
      const response = await bookingApi.update(booking.id, updateData);
      setBookings(bookings.map(b => 
        b.id === booking.id ? response.data : b
      ));
      showToast('Booking status updated successfully');
    } catch (error) {
      showToast('Failed to update booking status', 'error');
      console.error('Error updating booking:', error);
    }
  };

  const handleDateChange = async (booking, newDate) => {
    try {
      const updateData = {
        id: booking.id,
        visitDate: newDate,
        status: booking.status
      };
      
      const response = await bookingApi.update(booking.id, updateData);
      setBookings(bookings.map(b => 
        b.id === booking.id ? response.data : b
      ));
      showToast('Visit date updated successfully');
    } catch (error) {
      showToast('Failed to update visit date', 'error');
      console.error('Error updating date:', error);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Mobile Card View Component
  const BookingCard = ({ booking }) => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-gray-900">{booking.propertyName}</h3>
          <p className="text-sm text-gray-600">{booking.username}</p>
        </div>
        <select
          value={booking.status}
          onChange={(e) => handleStatusChange(booking, e.target.value)}
          className={`text-sm rounded-full px-3 py-1 font-semibold ${getStatusColor(booking.status)}`}
        >
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Email:</span> {booking.userEmail}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Phone:</span> {booking.userPhone}
        </p>
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm">Visit Date:</span>
          <input
            type="date"
            value={booking.visitDate}
            onChange={(e) => handleDateChange(booking, e.target.value)}
            className="text-sm border rounded px-2 py-1"
          />
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-6">Bookings Management</h1>

        {/* Desktop View - Table */}
        <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visit Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.propertyName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{booking.username}</div>
                    <div className="text-sm text-gray-500">{booking.userEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{booking.userPhone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="date"
                      value={booking.visitDate}
                      onChange={(e) => handleDateChange(booking, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking, e.target.value)}
                      className={`text-sm rounded-full px-3 py-1 font-semibold ${getStatusColor(booking.status)}`}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-4">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>

        {/* Toast Message */}
        {toast.show && (
          <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-md shadow-lg flex items-center
            ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white z-50`}>
            {toast.type === 'success' ? (
              <Check className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {toast.message}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default BookingsManagement;