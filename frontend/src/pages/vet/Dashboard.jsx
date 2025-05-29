import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Button } from '@mui/material';
import { useApp } from '../../context/AppContext';
import { Calendar, Clock, Users, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const VetDashboard = () => {
  const { appointments, pets, treatments } = useApp();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    totalPets: 0,
    activeTreatments: 0
  });

  useEffect(() => {
    if (appointments && pets && treatments) {
      setStats({
        totalAppointments: appointments.length,
        pendingAppointments: appointments.filter(apt => apt.estado === 'pendiente').length,
        totalPets: pets.length,
        activeTreatments: treatments.filter(t => t.estado === 'en_progreso' || t.estado === 'activo').length
      });
      setLoading(false);
    }
  }, [appointments, pets, treatments]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Estilo para los números grandes y textos oscuros
  const statNumberStyle = { fontWeight: 800, color: '#111', fontSize: '2.8rem', lineHeight: 1.1, mb: 1, textAlign: 'center' };
  const statLabelStyle = { color: '#222', fontSize: '1rem', textAlign: 'center', mb: 0.5, fontWeight: 400 };

  const statsCards = [
    {
      icon: <Calendar size={32} color="#4CAF50" style={{ marginBottom: 8 }} />,
      value: stats.totalAppointments,
      label: 'Total de Citas',
      link: '/vet/appointments',
      linkText: 'Ir a citas',
    },
    {
      icon: <Clock size={32} color="#FFA726" style={{ marginBottom: 8 }} />,
      value: stats.pendingAppointments,
      label: 'Citas Pendientes',
      link: '/vet/appointments',
      linkText: 'Ir a citas',
    },
    {
      icon: <Users size={32} color="#2196F3" style={{ marginBottom: 8 }} />,
      value: stats.totalPets,
      label: 'Total de Mascotas',
      link: '/vet/pets',
      linkText: 'Ir a mascotas',
    },
    {
      icon: <Activity size={32} color="#F44336" style={{ marginBottom: 8 }} />,
      value: stats.activeTreatments,
      label: 'Tratamientos Activos',
      link: '/vet/treatments',
      linkText: 'Ir a tratamientos',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 1, color: '#111', fontWeight: 700 }}>
        ¡Bienvenido/a, {user?.nombre || 'Veterinario'}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Aquí tienes un resumen de tu actividad y tus pacientes.
      </Typography>

      {/* Estadísticas principales */}
      <Box sx={{ width: '100%', maxWidth: 1600, mx: 'auto', mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'nowrap', justifyContent: 'center', minWidth: 1200 }}>
          {statsCards.map((stat, idx) => (
            <Box
              key={stat.label}
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
              {stat.icon}
              <Typography variant="body2" sx={statLabelStyle}>{stat.label}</Typography>
              <Typography variant="h3" sx={statNumberStyle}>{stat.value}</Typography>
              <Button
                href={stat.link}
                variant="text"
                sx={{ color: '#1976d2', fontWeight: 600, textTransform: 'none', fontSize: 15, mt: 1 }}
              >
                {stat.linkText} →
              </Button>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default VetDashboard; 