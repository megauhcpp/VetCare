import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import {
  People as PeopleIcon,
  Pets as PetsIcon,
  Event as EventIcon,
  LocalHospital as TreatmentIcon
} from '@mui/icons-material';

const AdminDashboard = () => {
  const { pets, appointments, treatments, users, loading } = useApp();
  const { user } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2'
    },
    {
      title: 'Total Pets',
      value: pets.length,
      icon: <PetsIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32'
    },
    {
      title: 'Total Appointments',
      value: appointments.length,
      icon: <EventIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02'
    },
    {
      title: 'Active Treatments',
      value: treatments.filter(t => t.status === 'active').length,
      icon: <TreatmentIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Here's an overview of your veterinary clinic
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: stat.color, mr: 2 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h6" component="div">
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ color: stat.color }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 