import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, Heart, Calendar, LogIn, Menu, X, LayoutDashboard } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../auth/AuthModal';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold">Truvista</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center text-gray-700 hover:text-blue-600 px-3"
                  >
                    <LayoutDashboard className="h-5 w-5 mr-2" />
                    Admin Dashboard
                  </button>
                )}
                <button
                  onClick={() => navigate('/profile')}
                  className="text-gray-700 hover:text-blue-600 px-3"
                >
                  <User className="h-5 w-5 inline mr-2" />
                  Profile
                </button>
                <button
                  onClick={() => navigate('/shortlist')}
                  className="text-gray-700 hover:text-blue-600 px-3"
                >
                  <Heart className="h-5 w-5 inline mr-2" />
                  Shortlisted
                </button>
                <button
                  onClick={() => navigate('/bookings')}
                  className="text-gray-700 hover:text-blue-600 px-3"
                >
                  <Calendar className="h-5 w-5 inline mr-2" />
                  Bookings
                </button>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-blue-600 px-3"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-2">
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <button
                    onClick={() => {
                      navigate('/admin');
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <LayoutDashboard className="h-5 w-5 mr-2" />
                    Admin Dashboard
                  </button>
                )}
                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <User className="h-5 w-5 mr-2" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    navigate('/shortlist');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Shortlisted
                </button>
                <button
                  onClick={() => {
                    navigate('/bookings');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Bookings
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Sign In
              </button>
            )}
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {isModalOpen && (
        <AuthModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            setIsMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;