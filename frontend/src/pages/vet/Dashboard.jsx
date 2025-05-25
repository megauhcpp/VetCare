import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { appointments, pets } = useApp();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    cancelledAppointments: 0,
    totalPets: 0
  });

  useEffect(() => {
    if (appointments && pets) {
      const today = new Date();
      const todayAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.fecha_hora);
        return appointmentDate.toDateString() === today.toDateString();
      });

      setStats({
        totalAppointments: appointments.length,
        pendingAppointments: appointments.filter(a => a.estado === 'pendiente').length,
        confirmedAppointments: appointments.filter(a => a.estado === 'confirmada').length,
        cancelledAppointments: appointments.filter(a => a.estado === 'cancelada').length,
        totalPets: pets.length
      });
      setLoading(false);
    }
  }, [appointments, pets]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Panel de Control
      </Typography>

      <Grid container spacing={3}>
        {/* Estadísticas */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Total Citas
            </Typography>
            <Typography variant="h4">
              {stats.totalAppointments}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Citas Pendientes
            </Typography>
            <Typography variant="h4" color="warning.main">
              {stats.pendingAppointments}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Citas Confirmadas
            </Typography>
            <Typography variant="h4" color="success.main">
              {stats.confirmedAppointments}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Total Mascotas
            </Typography>
            <Typography variant="h4" color="primary.main">
              {stats.totalPets}
            </Typography>
          </Paper>
        </Grid>

        {/* Próximas Citas */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Próximas Citas
              </Typography>
              <List>
                {appointments
                  .filter(appointment => new Date(appointment.fecha_hora) > new Date())
                  .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))
                  .slice(0, 5)
                  .map((appointment) => (
                    <React.Fragment key={appointment.id_cita}>
                      <ListItem>
                        <ListItemText
                          primary={pets.find(p => p.id_mascota === appointment.id_mascota)?.nombre}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                {new Date(appointment.fecha_hora).toLocaleString()}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2">
                                {appointment.tipo_consulta}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Mascotas Recientes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Mascotas Recientes
              </Typography>
              <List>
                {pets
                  .slice(0, 5)
                  .map((pet) => (
                    <React.Fragment key={pet.id_mascota}>
                      <ListItem>
                        <ListItemText
                          primary={pet.nombre}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                {pet.especie} - {pet.raza}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2">
                                Edad: {pet.edad} años
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 