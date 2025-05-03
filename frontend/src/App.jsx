import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
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

// Componente de ruta protegida
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="loading">Cargando...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
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
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/pets" element={
            <ProtectedRoute>
              <AdminPets />
            </ProtectedRoute>
          } />
          <Route path="/admin/treatments" element={
            <ProtectedRoute>
              <AdminTreatments />
            </ProtectedRoute>
          } />
          <Route path="/admin/appointments" element={
            <ProtectedRoute>
              <AdminAppointments />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute>
              <AdminSettings />
            </ProtectedRoute>
          } />
          <Route path="/admin/profile" element={
            <ProtectedRoute>
              <AdminProfile />
            </ProtectedRoute>
          } />
          
          {/* Client Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/pets" element={
            <ProtectedRoute>
              <ClientPets />
            </ProtectedRoute>
          } />
          <Route path="/appointments" element={
            <ProtectedRoute>
              <ClientAppointments />
            </ProtectedRoute>
          } />
          <Route path="/treatments" element={
            <ProtectedRoute>
              <ClientTreatments />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ClientProfile />
            </ProtectedRoute>
          } />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App; 