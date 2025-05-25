import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import { useApp } from '../../context/AppContext';
import { Calendar, Clock, Users, Activity } from 'lucide-react';

const VetDashboard = () => {
  const { appointments, pets, treatments } = useApp();
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
        activeTreatments: treatments.filter(t => t.estado === 'en_progreso').length
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      {/* Estadísticas principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#f8f9fa',
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            <Calendar size={24} color="#4CAF50" />
            <Typography variant="h6" sx={{ mt: 1, color: '#2c3e50' }}>
              {stats.totalAppointments}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de Citas
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#f8f9fa',
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            <Clock size={24} color="#FFA726" />
            <Typography variant="h6" sx={{ mt: 1, color: '#2c3e50' }}>
              {stats.pendingAppointments}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Citas Pendientes
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#f8f9fa',
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            <Users size={24} color="#2196F3" />
            <Typography variant="h6" sx={{ mt: 1, color: '#2c3e50' }}>
              {stats.totalPets}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de Mascotas
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#f8f9fa',
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            <Activity size={24} color="#F44336" />
            <Typography variant="h6" sx={{ mt: 1, color: '#2c3e50' }}>
              {stats.activeTreatments}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tratamientos Activos
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VetDashboard; 