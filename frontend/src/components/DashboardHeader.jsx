import { Link } from 'react-router-dom';
import { User, Menu } from 'lucide-react';
import '../styles/DashboardHeader.css';

/**
 * Componente de encabezado para el dashboard que muestra el título y acciones principales
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isAdmin - Indica si el usuario es administrador
 * @param {boolean} props.isVet - Indica si el usuario es veterinario
 * @param {Function} props.onMenuClick - Función para manejar el clic en el botón de menú
 */
const DashboardHeader = ({ isAdmin, isVet, onMenuClick }) => {
  // Obtiene el título del dashboard según el rol del usuario
  const getTitle = () => {
    if (isAdmin) return 'Admin Dashboard';
    if (isVet) return 'Veterinario Dashboard';
    return 'Cliente Dashboard';
  };

  // Obtiene la ruta del perfil según el rol del usuario
  const getProfilePath = () => {
    if (isAdmin) return '/admin/profile';
    if (isVet) return '/vet/profile';
    return '/profile';
  };

  return (
    <header className="dashboard-topbar">
      {/* Sección izquierda con botón de menú y título */}
      <div className="dashboard-header-left">
        <button 
          className="dashboard-menu-btn"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <Menu size={24} />
        </button>
        <div className="dashboard-title">
          {getTitle()}
        </div>
      </div>

      {/* Sección derecha con acciones del usuario */}
      <div className="dashboard-actions">
        <Link 
          to={getProfilePath()} 
          className="profile-btn"
        >
          <User size={18} />
          <span>Perfil</span>
        </Link>
      </div>
    </header>
  );
};

export default DashboardHeader; 