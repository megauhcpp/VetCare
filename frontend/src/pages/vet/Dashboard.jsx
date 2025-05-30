import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Button } from '@mui/material';
import { useApp } from '../../context/AppContext';
import { Calendar, Clock, PawPrint, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Estilos constantes fuera del componente
const statNumberStyle = { fontWeight: 800, color: '#111', fontSize: '2.8rem', lineHeight: 1.1, mb: 0.5, textAlign: 'center' };
const statLabelStyle = { color: '#222', fontSize: '1.15rem', textAlign: 'center', mb: 0.5, fontWeight: 500 };

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
      // Filtrar citas solo del veterinario logueado
      const vetAppointments = appointments.filter(
        appointment => appointment.id_usuario === user?.id_usuario || 
                      appointment.veterinario?.id_usuario === user?.id_usuario
      );

      // Filtrar tratamientos solo del veterinario logueado
      const vetTreatments = treatments.filter(
        treatment => treatment.cita?.id_usuario === user?.id_usuario || 
                    treatment.cita?.veterinario?.id_usuario === user?.id_usuario
      );

      setStats({
        totalAppointments: vetAppointments.length,
        pendingAppointments: vetAppointments.filter(apt => apt.estado === 'pendiente').length,
        totalPets: pets.length,
        activeTreatments: vetTreatments.filter(t => t.estado === 'en_progreso' || t.estado === 'activo').length
      });
      setLoading(false);
    }
  }, [appointments, pets, treatments, user]);

  // Memoizar statsCards para evitar recreaciones innecesarias
  const statsCards = useMemo(() => [
    {
      icon: <Calendar size={38} color="#4CAF50" style={{ marginBottom: 8 }} />,
      value: stats.totalAppointments,
      label: 'Mis Citas',
      link: '/vet/appointments',
      linkText: 'Ver mis citas',
    },
    {
      icon: <Clock size={38} color="#FFA726" style={{ marginBottom: 8 }} />,
      value: stats.pendingAppointments,
      label: 'Citas Pendientes',
      link: '/vet/appointments',
      linkText: 'Ver citas pendientes',
    },
    {
      icon: <PawPrint size={38} color="#2196F3" style={{ marginBottom: 8 }} />,
      value: stats.totalPets,
      label: 'Mascotas Atendidas',
      link: '/vet/pets',
      linkText: 'Ver mascotas',
    },
    {
      icon: <Activity size={38} color="#F44336" style={{ marginBottom: 8 }} />,
      value: stats.activeTreatments,
      label: 'Tratamientos Activos',
      link: '/vet/treatments',
      linkText: 'Ver tratamientos',
    },
  ], [stats]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 1, color: '#111', fontWeight: 700, fontSize: { xs: '2rem', md: '2.5rem' } }}>
        ¡Bienvenido/a, {user?.nombre || 'Veterinario'}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 3, fontSize: { xs: '1rem', md: '1.2rem' } }}>
        Aquí tienes un resumen de tus citas y pacientes.
      </Typography>

      <Grid container spacing={2} sx={{ maxWidth: 1600, margin: '0 auto' }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex' }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, md: 2.5 },
                width: '100%',
                minHeight: 180,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fff',
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                {stat.icon}
                <Typography sx={statNumberStyle}>
                  {stat.value}
                </Typography>
                <Typography sx={statLabelStyle}>
                  {stat.label}
                </Typography>
                <Button
                  variant="text"
                  color="primary"
                  href={stat.link}
                  sx={{
                    mt: 0.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1.05rem',
                    '&:hover': {
                      background: 'transparent',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {stat.linkText}
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default VetDashboard; 