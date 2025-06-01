import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './layouts/AdminLayout';
import ClientLayout from './layouts/ClientLayout';
import VetLayout from './layouts/VetLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminPets from './pages/admin/Pets';
import AdminTreatments from './pages/admin/Treatments';
import AdminAppointments from './pages/admin/Appointments';
import AdminSettings from './pages/admin/Settings';
import AdminProfile from './pages/admin/Profile';
import VetDashboard from './pages/vet/Dashboard';
import VetPets from './pages/vet/Pets';
import VetTreatments from './pages/vet/Treatments';
import VetAppointments from './pages/vet/Appointments';
import VetProfile from './pages/vet/Profile';
import ClientDashboard from './pages/client/Dashboard';
import ClientPets from './pages/client/Pets';
import ClientAppointments from './pages/client/Appointments';
import ClientTreatments from './pages/client/Treatments';
import ClientProfile from './pages/client/Profile';

/**
 * Componente de ruta protegida que maneja la autenticación y autorización
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar
 * @param {boolean} props.requireAdmin - Indica si se requiere rol de administrador
 * @param {boolean} props.requireVet - Indica si se requiere rol de veterinario
 */
const ProtectedRoute = ({ children, requireAdmin = false, requireVet = false }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Redirecciones basadas en el rol del usuario
  if (user?.rol === 'admin' && !requireAdmin) {
    return <Navigate to="/admin/dashboard" />;
  }

  if (user?.rol === 'veterinario' && !requireVet) {
    return <Navigate to="/vet/dashboard" />;
  }

  if (user?.rol === 'cliente' && (requireAdmin || requireVet)) {
    return <Navigate to="/dashboard" />;
  }

  // Verificación de permisos específicos
  if (requireAdmin && user?.rol !== 'admin') {
    return <Navigate to="/login" />;
  }

  if (requireVet && user?.rol !== 'veterinario') {
    return <Navigate to="/login" />;
  }

  return children;
};

/**
 * Componente que maneja la redirección inicial según el rol del usuario
 */
const RootRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  switch (user.rol) {
    case 'admin':
      return <Navigate to="/admin/dashboard" />;
    case 'veterinario':
      return <Navigate to="/vet/dashboard" />;
    case 'cliente':
      return <Navigate to="/dashboard" />;
    default:
      return <Navigate to="/login" />;
  }
};

const App = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Rutas de administrador */}
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

            {/* Rutas de veterinario */}
            <Route path="/vet" element={
              <ProtectedRoute requireVet={true}>
                <VetLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<VetDashboard />} />
              <Route path="pets" element={<VetPets />} />
              <Route path="treatments" element={<VetTreatments />} />
              <Route path="appointments" element={<VetAppointments />} />
              <Route path="profile" element={<VetProfile />} />
            </Route>
            
            {/* Rutas de cliente */}
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

            {/* Redirección de la ruta raíz */}
            <Route path="/" element={<RootRedirect />} />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
};

export default App; 