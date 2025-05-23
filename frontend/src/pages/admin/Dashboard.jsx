import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Button,
  CircularProgress
} from '@mui/material';

const AdminDashboard = () => {
  const { pets, appointments, treatments, users } = useApp();
  const { user } = useAuth();

  if (!Array.isArray(pets) || !Array.isArray(appointments) || !Array.isArray(treatments) || !Array.isArray(users)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const stats = [
    {
      title: 'Usuarios',
      subtitle: 'Total de usuarios registrados',
      value: users.length,
      link: '/admin/users',
      linkText: 'VER TODOS LOS USUARIOS →'
    },
    {
      title: 'Mascotas',
      subtitle: 'Total de mascotas registradas',
      value: pets.length,
      link: '/admin/pets',
      linkText: 'VER TODAS LAS MASCOTAS →'
    },
    {
      title: 'Citas',
      subtitle: 'Total de citas',
      value: appointments.length,
      link: '/admin/appointments',
      linkText: 'VER TODAS LAS CITAS →'
    },
    {
      title: 'Tratamientos',
      subtitle: 'Total de tratamientos',
      value: treatments.length,
      link: '/admin/treatments',
      linkText: 'VER TODOS LOS TRATAMIENTOS →'
    }
  ];

  return (
    <Box sx={{ p: 3, background: '#f8f9fb', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Bienvenido, {user?.nombre || 'Administrador'}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Aquí tienes un resumen general del sistema.
      </Typography>

      {/* Stats Cards */}
      <Box sx={{ width: '100%', maxWidth: 1600, mx: 'auto', mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'nowrap', justifyContent: 'center', minWidth: 1200 }}>
          {stats.map((stat, index) => (
            <Box
              key={index}
              sx={{
                flex: '0 0 377.5px',
                width: '377.5px',
                maxWidth: '377.5px',
                minWidth: '280px',
                height: 214,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e5e7eb',
                borderRadius: 2,
                background: '#fff',
                boxShadow: 'none',
                px: 3,
                py: 2,
                boxSizing: 'border-box',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: 3 }
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center', mb: 0.5, color: 'text.primary' }}>{stat.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 1 }}>{stat.subtitle}</Typography>
              {typeof stat.value !== 'undefined' && stat.value !== null && (
                <Typography variant="h3" sx={{ fontWeight: 700, my: 0.5, textAlign: 'center', color: 'text.primary' }}>{stat.value}</Typography>
              )}
              <Button href={stat.link} size="small" sx={{ pl: 0, fontWeight: 600 }}>{stat.linkText}</Button>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard; 