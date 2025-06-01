/**
 * Página de dashboard del cliente
 * Muestra un resumen de las mascotas, citas y tratamientos del usuario
 * Incluye un calendario para visualizar las citas programadas
 */
import React, { useState, useMemo } from 'react';
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
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Pets as PetsIcon,
  Event as EventIcon,
  LocalHospital as TreatmentIcon
} from '@mui/icons-material';

// Array con las abreviaturas de los días de la semana
const diasSemana = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

const ClientDashboard = () => {
  const { pets, appointments, treatments } = useApp();
  const { user } = useAuth();
  const hoy = new Date();
  // Estado para controlar la fecha actual del calendario
  const [currentDate, setCurrentDate] = useState(new Date());

  // Memoización de los datos de tratamientos para optimizar el rendimiento
  const treatmentsData = useMemo(() => treatments?.data || [], [treatments]);
  
  // Memoización de las próximas citas, filtradas y ordenadas por fecha
  const upcomingAppointments = useMemo(() =>
    Array.isArray(appointments)
      ? appointments
        .filter(a => new Date(a.fecha_hora) >= hoy)
        .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))
        .slice(0, 2)
      : []
  , [appointments]);
  
  // Memoización de los tratamientos activos
  const activeTreatments = useMemo(() =>
    Array.isArray(treatmentsData)
      ? treatmentsData.filter(t => t.estado === 'pendiente' || t.estado === 'en_progreso').slice(0, 2)
      : []
  , [treatmentsData]);

  // Mostrar indicador de carga si los datos no están disponibles
  if (!Array.isArray(pets) || !Array.isArray(appointments) || !Array.isArray(treatments)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Lógica para generar el calendario
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

  // Configuración de las tarjetas de estadísticas
  const stats = [
    {
      title: 'Mis Mascotas',
      subtitle: 'Total de mascotas registradas',
      value: pets.length,
      icon: <PetsIcon sx={{ fontSize: 40 }} />,
      link: '/pets',
      linkText: 'VER TODAS LAS MASCOTAS →'
    },
    {
      title: 'Citas',
      subtitle: 'Próximas citas',
      value: appointments.length,
      icon: <EventIcon sx={{ fontSize: 40 }} />,
      link: '/appointments',
      linkText: 'VER TODAS LAS CITAS →'
    },
    {
      title: 'Tratamientos',
      subtitle: 'Tratamientos activos',
      value: treatments.length,
      icon: <TreatmentIcon sx={{ fontSize: 40 }} />,
      link: '/treatments',
      linkText: 'VER TODOS LOS TRATAMIENTOS →'
    },
    {
      title: 'Nueva Cita',
      subtitle: 'Programar una visita',
      value: null,
      icon: null,
      link: '/appointments',
      linkText: 'RESERVAR AHORA',
      isButton: true
    }
  ];

  return (
    <Box sx={{ p: 3, background: '#f8f9fb' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#111' }}>
        ¡Bienvenido/a, {user?.nombre || 'Cliente'}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Aquí tienes un resumen de la salud de tus mascotas y tus próximas citas.
      </Typography>

      {/* Tarjetas de estadísticas */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        {stats.map((stat, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              minWidth: 260,
              maxWidth: 370,
              height: 180,
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
              transition: 'box-shadow 0.2s',
              '&:hover': { boxShadow: 3 }
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center', mb: 0.5, color: 'text.primary' }}>{stat.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 1 }}>{stat.subtitle}</Typography>
            {typeof stat.value !== 'undefined' && stat.value !== null && (
              <Typography variant="h3" sx={{ fontWeight: 700, my: 0.5, textAlign: 'center', color: 'text.primary' }}>{stat.value}</Typography>
            )}
            {stat.isButton ? (
              <Button href={stat.link} variant="contained" fullWidth sx={{ mt: 1, py: 1.2, fontSize: '1rem', fontWeight: 600, borderRadius: 1 }}>
                {stat.linkText}
              </Button>
            ) : (
              <Button href={stat.link} size="small" sx={{ pl: 0, fontWeight: 600 }}>{stat.linkText}</Button>
            )}
          </Box>
        ))}
      </Box>

      {/* Sección de citas programadas y calendario */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        {/* Lista de próximas citas */}
        <Card sx={{ flex: 2, minWidth: 320, border: '1px solid #e5e7eb', boxShadow: 'none', background: '#fff', p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Tus visitas programadas</Typography>
            <Button href="/appointments" size="small" sx={{ pl: 0 }}>Ver todas las citas →</Button>
          </Box>
          <List>
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <ListItem key={appointment.id_cita} sx={{ mb: 1, border: '1px solid #e5e7eb', borderRadius: 2, background: '#f9fafb' }}>
                  <ListItemIcon>
                    <EventIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={<span style={{ fontWeight: 600 }}>{appointment.mascota?.nombre || ''} - {appointment.tipo_consulta}</span>}
                    secondary={<>
                      <span style={{ color: '#555' }}>{new Date(appointment.fecha_hora).toLocaleDateString()} &nbsp;·&nbsp; {new Date(appointment.fecha_hora).toLocaleTimeString()}</span>
                    </>}
                  />
                  <Chip
                    label={appointment.estado === 'confirmada' ? 'confirmada' : appointment.estado === 'pendiente' ? 'pendiente' : appointment.estado}
                    color={appointment.estado === 'confirmada' ? 'success' : appointment.estado === 'pendiente' ? 'warning' : 'default'}
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

        {/* Calendario de citas */}
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
                  {week.map((day, j) => {
                    const isToday = day === hoy.getDate() && month === hoy.getMonth() && year === hoy.getFullYear();
                    return (
                      <td
                        key={j}
                        style={{
                          padding: 4,
                          color: day ? (isToday ? '#fff' : '#222') : '#ccc',
                          background: isToday ? '#1976d2' : 'transparent',
                          borderRadius: isToday ? 8 : 0,
                          fontWeight: isToday ? 700 : 400,
                          transition: 'background 0.2s'
                        }}
                      >
                        {day || ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Box>
    </Box>
  );
};

export default ClientDashboard; 