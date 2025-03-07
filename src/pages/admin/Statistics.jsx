import React, { useState, useEffect } from 'react';
import { Building2, Calendar, Users, TrendingUp } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';

// Mock statistics data
const mockStats = {
  totalProperties: 150,
  activeBookings: 45,
  totalUsers: 1200,
  monthlyVisits: 320,
};

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(mockStats);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Properties',
      value: stats.totalProperties,
      icon: <Building2 className="h-8 w-8 text-blue-600" />,
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Bookings',
      value: stats.activeBookings,
      icon: <Calendar className="h-8 w-8 text-green-600" />,
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <Users className="h-8 w-8 text-purple-600" />,
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Monthly Visits',
      value: stats.monthlyVisits,
      icon: <TrendingUp className="h-8 w-8 text-orange-600" />,
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-6">Statistics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`${stat.bgColor} rounded-lg p-6 shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Statistics;