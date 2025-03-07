import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import ProfilePage from './pages/ProfilePage';
import ShortlistedPage from './pages/ShortlistedPage';
import BookingsPage from './pages/BookingsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import PropertiesManagement from './pages/admin/PropertiesManagement';
import BookingsManagement from './pages/admin/BookingsManagement';
import Statistics from './pages/admin/Statistics';
import AdminCreatePropertyPage from './pages/admin/AdminCreatePropertyPage';
import AdminUpdatePropertyPage from './pages/admin/AdminUpdatePropertyPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          
          {/* Protected Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/shortlist" element={
            <ProtectedRoute>
              <ShortlistedPage />
            </ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute>
              <BookingsPage />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/properties" element={
            <ProtectedRoute adminOnly>
              <PropertiesManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/properties/create" element={
            <ProtectedRoute adminOnly>
              <AdminCreatePropertyPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/properties/edit/:id" element={
            <ProtectedRoute adminOnly>
              <AdminUpdatePropertyPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute adminOnly>
              <BookingsManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/statistics" element={
            <ProtectedRoute adminOnly>
              <Statistics />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;