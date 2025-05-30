import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-layout" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar with responsive classes */}
      <div 
        className={`sidebar-container ${isSidebarOpen ? 'sidebar-open' : ''}`}
      >
        <Sidebar isAdmin={true} onClose={toggleSidebar} />
      </div>

      {/* Main Content */}
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
        <DashboardHeader isAdmin={true} onMenuClick={toggleSidebar} />
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

      {/* Overlay for mobile */}
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