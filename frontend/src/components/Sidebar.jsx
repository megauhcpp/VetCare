import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, User, Calendar, PawPrint, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: <Calendar />, to: '/dashboard' },
    { label: 'Mis Mascotas', icon: <PawPrint />, to: '/pets' },
    { label: 'Citas', icon: <Calendar />, to: '/appointments' },
    { label: 'Tratamientos', icon: <Stethoscope />, to: '/treatments' },
    { label: 'Perfil', icon: <User />, to: '/profile' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-circle"></span>
          <span className="logo-text">VETCARE</span>
        </div>
      </div>
      <div className="sidebar-user">
        <div className="user-avatar">
          <User size={32} />
        </div>
        <div className="user-info">
          <span className="user-name">{user?.nombre || 'Usuario'}</span>
          <span className="user-role">{user?.rol || 'Cliente'}</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`sidebar-link${location.pathname === item.to ? ' active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={logout}>
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 