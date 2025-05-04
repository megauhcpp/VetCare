import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip
} from '@mui/material';
import {
  Pets as PetsIcon,
  Event as EventIcon,
  LocalHospital as TreatmentIcon
} from '@mui/icons-material';

const diasSemana = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

const ClientDashboard = () => {
  const { pets, appointments, treatments } = useApp();
  const { user } = useAuth();
  const hoy = new Date();
  const upcomingAppointments = appointments
    .filter(a => new Date(a.date) >= hoy)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 2);
  const activeTreatments = treatments
    .filter(t => t.status === 'active')
    .slice(0, 2);

  // Calendario
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();
  const weeks = [];
  let week = [];
  for (let i = 0; i < startingDay; i++) week.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  while (week.length < 7) week.push(null);
  weeks.push(week);

  return (
    <Box sx={{ p: 3, background: '#f8f9fb', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        ¡Bienvenido/a, {user?.name}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Aquí tienes un resumen de la salud de tus mascotas y tus próximas citas.
      </Typography>

      {/* Bloques resumen en display flex */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Card sx={{ flex: 1, minWidth: 220, border: '1px solid #e5e7eb', boxShadow: 'none', background: '#fff', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Mis Mascotas</Typography>
          <Typography variant="body2" color="text.secondary">Total de mascotas registradas</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>{pets.length}</Typography>
          <Button href="/pets" size="small" sx={{ pl: 0 }}>Ver todas las mascotas →</Button>
        </Card>
        <Card sx={{ flex: 1, minWidth: 220, border: '1px solid #e5e7eb', boxShadow: 'none', background: '#fff', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Citas</Typography>
          <Typography variant="body2" color="text.secondary">Próximas citas</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>{upcomingAppointments.length}</Typography>
          <Button href="/appointments" size="small" sx={{ pl: 0 }}>Ver todas las citas →</Button>
        </Card>
        <Card sx={{ flex: 1, minWidth: 220, border: '1px solid #e5e7eb', boxShadow: 'none', background: '#fff', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Tratamientos</Typography>
          <Typography variant="body2" color="text.secondary">Tratamientos activos</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>{activeTreatments.length}</Typography>
          <Button href="/treatments" size="small" sx={{ pl: 0 }}>Ver todos los tratamientos →</Button>
        </Card>
        <Card sx={{ flex: 1, minWidth: 220, border: '1px solid #e5e7eb', boxShadow: 'none', background: '#fff', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Nueva Cita</Typography>
          <Typography variant="body2" color="text.secondary">Programar una visita</Typography>
          <Button href="/appointments" variant="contained" fullWidth sx={{ mt: 2 }}>Reservar ahora</Button>
        </Card>
      </Box>

      {/* Bloques de visitas programadas y calendario */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Card sx={{ flex: 2, minWidth: 320, border: '1px solid #e5e7eb', boxShadow: 'none', background: '#fff', p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Tus visitas programadas</Typography>
            <Button href="/appointments" size="small" sx={{ pl: 0 }}>Ver todas las citas →</Button>
          </Box>
          <List>
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <ListItem key={appointment.id} sx={{ mb: 1, border: '1px solid #e5e7eb', borderRadius: 2, background: '#f9fafb' }}>
                  <ListItemIcon>
                    <EventIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={<span style={{ fontWeight: 600 }}>{pets.find(p => p.id === appointment.petId)?.name || ''} - {appointment.type}</span>}
                    secondary={<>
                      <span style={{ color: '#555' }}>{new Date(appointment.date).toLocaleDateString()} &nbsp;·&nbsp; {appointment.time}</span>
                    </>}
                  />
                  <Chip
                    label={appointment.status === 'confirmed' ? 'confirmada' : appointment.status === 'pending' ? 'pendiente' : appointment.status}
                    color={appointment.status === 'confirmed' ? 'success' : appointment.status === 'pending' ? 'warning' : 'default'}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">No tienes citas próximas.</Typography>
            )}
          </List>
        </Card>
        <Card sx={{ flex: 1, minWidth: 280, border: '1px solid #e5e7eb', boxShadow: 'none', background: '#fff', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
            Calendario
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Calendario de citas
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Button size="small" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>{'<'}</Button>
            <Typography variant="subtitle2">{currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</Typography>
            <Button size="small" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>{'>'}</Button>
          </Box>
          <table style={{ width: '100%', textAlign: 'center' }}>
            <thead>
              <tr>
                {diasSemana.map(dia => <th key={dia}>{dia}</th>)}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, i) => (
                <tr key={i}>
                  {week.map((day, j) => (
                    <td key={j} style={{ padding: 4, color: day ? '#222' : '#ccc' }}>{day || ''}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Box>

      {/* Tratamientos activos */}
      <Card sx={{ mt: 3, border: '1px solid #e5e7eb', boxShadow: 'none', background: '#fff', p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
          Tratamientos Activos
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Tratamientos activos para tus mascotas
        </Typography>
        <List>
          {activeTreatments.length > 0 ? (
            activeTreatments.map((treatment) => (
              <ListItem key={treatment.id} sx={{ mb: 1, border: '1px solid #e5e7eb', borderRadius: 2, background: '#f9fafb', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <ListItemIcon>
                    <TreatmentIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={<span style={{ fontWeight: 600 }}>{pets.find(p => p.id === treatment.petId)?.name || ''} - {treatment.name}</span>}
                    secondary={<span style={{ color: '#555' }}>{treatment.description}</span>}
                  />
                </Box>
                {treatment.startDate && treatment.endDate && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, ml: 5 }}>
                    {new Date(treatment.startDate).toLocaleDateString()} a {new Date(treatment.endDate).toLocaleDateString()}
                  </Typography>
                )}
              </ListItem>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">No hay tratamientos activos.</Typography>
          )}
        </List>
        <Button href="/treatments" size="small" sx={{ mt: 1, pl: 0 }}>Ver todos los tratamientos →</Button>
      </Card>
    </Box>
  );
};

export default ClientDashboard; 