import { Link } from 'react-router-dom';
import { User, Search } from 'lucide-react';
import '../styles/DashboardHeader.css';

const DashboardHeader = () => {
  return (
    <header className="dashboard-topbar">
      <div className="dashboard-title">Client Dashboard</div>
      <div className="dashboard-actions">
        <div className="dashboard-search">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
        <Link to="/profile" className="profile-btn">
          <User size={18} />
          <span>Profile</span>
        </Link>
      </div>
    </header>
  );
};

export default DashboardHeader; 