import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { useAuth } from '../context/AuthContext';

const SIDEBAR_WIDTH = 250;

const VetLayout = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-layout" style={{ minHeight: '100vh', display: 'flex' }}>
      <div style={{ width: SIDEBAR_WIDTH, flexShrink: 0 }}>
        <Sidebar isVet={true} />
      </div>
      <div className="dashboard-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'auto' }}>
        <DashboardHeader isVet={true} />
        <main className="dashboard-main" style={{ flex: 1, overflow: 'auto', padding: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VetLayout; 