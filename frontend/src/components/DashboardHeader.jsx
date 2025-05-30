import { Link } from 'react-router-dom';
import { User, Search } from 'lucide-react';
import '../styles/DashboardHeader.css';

const DashboardHeader = ({ isAdmin, isVet }) => {
  const getTitle = () => {
    if (isAdmin) return 'Admin Dashboard';
    if (isVet) return 'Veterinario Dashboard';
    return 'Cliente Dashboard';
  };

  const getProfilePath = () => {
    if (isAdmin) return '/admin/profile';
    if (isVet) return '/vet/profile';
    return '/profile';
  };

  return (
    <header className="dashboard-topbar">
      <div className="dashboard-title">{getTitle()}</div>
      <div className="dashboard-actions">
        <Link to={getProfilePath()} className="profile-btn">
          <User size={18} />
          <span>Perfil</span>
        </Link>
      </div>
    </header>
  );
};

export default DashboardHeader; 