import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './layouts/AdminLayout';
import ClientLayout from './layouts/ClientLayout';
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
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user?.rol !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Componente para redirigir según el rol
const RootRedirect = () => {
  const { user } = useAuth();
  return user?.rol === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/dashboard" />;
};

const App = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="pets" element={<AdminPets />} />
              <Route path="treatments" element={<AdminTreatments />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>
            
            {/* Client Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <ClientLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<ClientDashboard />} />
              <Route path="pets" element={<ClientPets />} />
              <Route path="appointments" element={<ClientAppointments />} />
              <Route path="treatments" element={<ClientTreatments />} />
              <Route path="profile" element={<ClientProfile />} />
            </Route>

            {/* Redirect root to appropriate dashboard */}
            <Route path="/" element={<RootRedirect />} />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
};

export default App; 