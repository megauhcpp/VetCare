import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { useAuth } from '../context/AuthContext';

const ClientLayout = () => {
  const { user } = useAuth();
  
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar user={user} />
      <div style={{ marginLeft: 250, width: '100%' }}>
        <DashboardHeader />
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ClientLayout; 