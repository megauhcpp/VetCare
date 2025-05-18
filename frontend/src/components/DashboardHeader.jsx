import { Link } from 'react-router-dom';
import { User, Search } from 'lucide-react';
import '../styles/DashboardHeader.css';

const DashboardHeader = () => {
  return (
    <header className="dashboard-topbar">
      <div className="dashboard-title">Client Dashboard</div>
      <div className="dashboard-actions">
        
        <Link to="/profile" className="profile-btn">
          <User size={18} />
          <span>Perfil</span>
        </Link>
      </div>
    </header>
  );
};

export default DashboardHeader; 