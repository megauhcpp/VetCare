import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, User, Calendar, PawPrint, Stethoscope, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/Sidebar.css';
import vetcareLogo from '../vetcarelogonobg.png';

const Sidebar = ({ isAdmin, isVet }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const adminNavItems = [
    { label: 'Dashboard', icon: <Calendar />, to: '/admin/dashboard' },
    { label: 'Mascotas', icon: <PawPrint />, to: '/admin/pets' },
    { label: 'Citas', icon: <Calendar />, to: '/admin/appointments' },
    { label: 'Tratamientos', icon: <Stethoscope />, to: '/admin/treatments' },
    { label: 'Usuarios', icon: <Users />, to: '/admin/users' },
    { label: 'Perfil', icon: <User />, to: '/admin/profile' },
  ];

  const vetNavItems = [
    { label: 'Dashboard', icon: <Calendar />, to: '/vet/dashboard' },
    { label: 'Mascotas', icon: <PawPrint />, to: '/vet/pets' },
    { label: 'Citas', icon: <Calendar />, to: '/vet/appointments' },
    { label: 'Tratamientos', icon: <Stethoscope />, to: '/vet/treatments' },
    { label: 'Perfil', icon: <User />, to: '/vet/profile' },
  ];

  const clientNavItems = [
    { label: 'Dashboard', icon: <Calendar />, to: '/dashboard' },
    { label: 'Mis Mascotas', icon: <PawPrint />, to: '/pets' },
    { label: 'Citas', icon: <Calendar />, to: '/appointments' },
    { label: 'Tratamientos', icon: <Stethoscope />, to: '/treatments' },
    { label: 'Perfil', icon: <User />, to: '/profile' },
  ];

  const navItems = isAdmin ? adminNavItems : isVet ? vetNavItems : clientNavItems;

  return (
    <aside className="sidebar">
      <div className="sidebar-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
        <div className="sidebar-logo">
          <img src={vetcareLogo} alt="VetCare Logo" style={{ height: 130, width: 'auto', display: 'block', objectFit: 'contain', margin: '0 auto' }} />
        </div>
      </div>
      <div className="sidebar-user" style={{ paddingTop: '0.5rem' }}>
        <div className="user-avatar">
          {user?.nombre ? (
            <span style={{ fontSize: 28, fontWeight: 400, color: '#b0b3b8' }}>
              {user.nombre.charAt(0).toUpperCase()}
            </span>
          ) : (
            <User size={32} />
          )}
        </div>
        <div className="user-info">
          <span className="user-name">{user?.nombre || 'Usuario'}</span>
          <span className="user-role">
            {isAdmin ? 'Administrador' : isVet ? 'Veterinario' : 'Cliente'}
          </span>
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