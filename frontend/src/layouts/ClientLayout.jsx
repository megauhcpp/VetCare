import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { useAuth } from '../context/AuthContext';

// Ancho fijo del sidebar en píxeles
const SIDEBAR_WIDTH = 250;

/**
 * Layout principal para la sección de cliente
 * Proporciona la estructura base con sidebar, header y área de contenido
 */
const ClientLayout = () => {
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
    <div className="dashboard-layout" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Contenedor del sidebar con clases responsivas */}
      <div 
        className={`sidebar-container ${isSidebarOpen ? 'sidebar-open' : ''}`}
      >
        <Sidebar onClose={toggleSidebar} />
      </div>

      {/* Contenido principal del dashboard */}
      <div 
        className="dashboard-content" 
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh', 
          overflow: 'auto',
        }}
      >
        {/* Encabezado del dashboard */}
        <DashboardHeader onMenuClick={toggleSidebar} />
        
        {/* Área principal de contenido */}
        <main 
          className="dashboard-main" 
          style={{ 
            flex: '1 1 0%', 
            overflow: 'auto', 
            padding: '1rem',
            backgroundColor: '#f8f9fb'
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

export default ClientLayout; 