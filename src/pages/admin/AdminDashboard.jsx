import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const adminOptions = [
    {
      to: '/admin/properties',
      icon: <Building2 className="h-6 w-6" />,
      label: 'Properties',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      to: '/admin/bookings',
      icon: <Calendar className="h-6 w-6" />,
      label: 'Bookings',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      to: '/admin/statistics',
      icon: <BarChart3 className="h-6 w-6" />,
      label: 'Statistics',
      color: 'bg-emerald-50 text-emerald-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your properties and bookings</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {adminOptions.map((option) => (
            <button
              key={option.to}
              onClick={() => navigate(option.to)}
              className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-left"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${option.color}`}>
                  {option.icon}
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all" />
              </div>
              <h2 className="text-xl font-semibold mt-4 text-gray-900">
                {option.label}
              </h2>
              <div className="mt-1 h-1 w-12 bg-gray-200 group-hover:bg-blue-500 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;