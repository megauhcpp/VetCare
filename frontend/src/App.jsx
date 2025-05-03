import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminPets from './pages/admin/Pets';
import AdminTreatments from './pages/admin/Treatments';
import AdminAppointments from './pages/admin/Appointments';
import AdminSettings from './pages/admin/Settings';
import AdminProfile from './pages/admin/Profile';
import ClientDashboard from './pages/client/Dashboard';
import ClientPets from './pages/client/Pets';
import ClientAppointments from './pages/client/Appointments';
import ClientTreatments from './pages/client/Treatments';
import ClientProfile from './pages/client/Profile';

const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} />;
  }
  
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/users" element={
            <PrivateRoute role="admin">
              <AdminUsers />
            </PrivateRoute>
          } />
          <Route path="/admin/pets" element={
            <PrivateRoute role="admin">
              <AdminPets />
            </PrivateRoute>
          } />
          <Route path="/admin/treatments" element={
            <PrivateRoute role="admin">
              <AdminTreatments />
            </PrivateRoute>
          } />
          <Route path="/admin/appointments" element={
            <PrivateRoute role="admin">
              <AdminAppointments />
            </PrivateRoute>
          } />
          <Route path="/admin/settings" element={
            <PrivateRoute role="admin">
              <AdminSettings />
            </PrivateRoute>
          } />
          <Route path="/admin/profile" element={
            <PrivateRoute role="admin">
              <AdminProfile />
            </PrivateRoute>
          } />
          
          {/* Client Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute role="client">
              <ClientDashboard />
            </PrivateRoute>
          } />
          <Route path="/pets" element={
            <PrivateRoute role="client">
              <ClientPets />
            </PrivateRoute>
          } />
          <Route path="/appointments" element={
            <PrivateRoute role="client">
              <ClientAppointments />
            </PrivateRoute>
          } />
          <Route path="/treatments" element={
            <PrivateRoute role="client">
              <ClientTreatments />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute role="client">
              <ClientProfile />
            </PrivateRoute>
          } />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App; 