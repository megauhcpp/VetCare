import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../Sidebar';
import DashboardHeader from '../DashboardHeader';
import { Menu } from 'lucide-react';
import '../../styles/ClientLayout.css';

const ClientLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      }
    };

    // Ejecutar al montar el componente
    handleResize();

    // Añadir listener para cambios de tamaño
    window.addEventListener('resize', handleResize);

    // Limpiar listener al desmontar
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!user) {
    navigate('/login');
    return null;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="client-layout">
      <DashboardHeader onMenuClick={toggleSidebar} />
      <div className="client-content">
        <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
          <Sidebar onClose={toggleSidebar} />
        </div>
        <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <Outlet />
        </div>
        {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={toggleSidebar} />
        )}
      </div>
    </div>
  );
};

export default ClientLayout; 