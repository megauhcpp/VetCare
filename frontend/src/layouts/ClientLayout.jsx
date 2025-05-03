import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { Outlet } from 'react-router-dom';

const ClientLayout = () => (
  <div style={{ display: 'flex' }}>
    <Sidebar />
    <div style={{ marginLeft: 250, width: '100%' }}>
      <DashboardHeader />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  </div>
);

export default ClientLayout; 