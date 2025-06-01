import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { useAuth } from '../context/AuthContext';

/**
 * Layout principal para la sección de administrador
 * Proporciona la estructura base con sidebar, header y área de contenido
 */
const AdminLayout = () => {
  const { user } = useAuth();
  // Estado para controlar la visibilidad del sidebar en dispositivos móviles
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /**
   * Alterna la visibilidad del sidebar
   */
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-layout" style={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>
      {/* Contenedor del sidebar con clases responsivas */}
      <div 
        className={`sidebar-container ${isSidebarOpen ? 'sidebar-open' : ''}`}
      >
        <Sidebar isAdmin={true} onClose={toggleSidebar} />
      </div>

      {/* Contenido principal del dashboard */}
      <div 
        className="dashboard-content" 
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        {/* Encabezado del dashboard */}
        <DashboardHeader isAdmin={true} onMenuClick={toggleSidebar} />
        
        {/* Área principal de contenido */}
        <main 
          className="dashboard-main" 
          style={{ 
            flex: '1 1 0%', 
            padding: '1rem',
            backgroundColor: '#f8f9fb',
            overflow: 'hidden'
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Overlay para dispositivos móviles cuando el sidebar está abierto */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default AdminLayout; 