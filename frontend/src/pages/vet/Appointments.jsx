import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Stack,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const Appointments = () => {
  const { appointments, pets, setAppointments } = useApp();
  const { user } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [veterinarians, setVeterinarians] = useState([]);
  const [formData, setFormData] = useState({
    petId: '',
    date: '',
    time: '',
    type: '',
    motivo: '',
    estado: 'pendiente',
    id_veterinario: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // Fetch veterinarians when component mounts
    const fetchVeterinarians = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/veterinarios', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setVeterinarians(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching veterinarians:', error);
      }
    };
    fetchVeterinarians();
  }, []);

  // Filtrar citas solo del veterinario logueado (soporta ambas estructuras)
  const vetAppointments = appointments.filter(
    (appointment) =>
      appointment.id_usuario === user?.id_usuario ||
      appointment.veterinario?.id_usuario === user?.id_usuario
  );

  if (!Array.isArray(appointments) || !Array.isArray(pets)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const handleOpenDialog = (appointment = null) => {
    if (appointment) {
      setSelectedAppointment(appointment);
      setFormData({
        petId: appointment.id_mascota,
        date: appointment.fecha_hora.split('T')[0],
        time: appointment.fecha_hora.split('T')[1].substring(0, 5),
        type: appointment.tipo_consulta,
        motivo: appointment.motivo_consulta || '',
        estado: appointment.estado,
        id_veterinario: appointment.id_usuario
      });
    } else {
      setSelectedAppointment(null);
      setFormData({
        petId: '',
        date: '',
        time: '',
        type: '',
        motivo: '',
        estado: 'pendiente',
        id_veterinario: user?.id_usuario || ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAppointment(null);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      const url = selectedAppointment 
        ? `/api/citas/${selectedAppointment.id_cita}`
        : '/api/citas';
      
      const method = selectedAppointment ? 'PUT' : 'POST';
      
      const appointmentData = {
        id_mascota: formData.petId,
        fecha_hora: `${formData.date}T${formData.time}:00`,
        tipo_consulta: formData.type,
        motivo_consulta: formData.motivo,
        estado: formData.estado,
        id_veterinario: formData.id_veterinario
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        const updatedAppointment = await response.json();
        if (selectedAppointment) {
          setAppointments(appointments.map(a => a.id_cita === updatedAppointment.id_cita ? updatedAppointment : a));
        } else {
          setAppointments([...appointments, updatedAppointment]);
        }
        handleCloseDialog();
        setSnackbar({ open: true, message: 'Cita guardada correctamente', severity: 'success' });
      } else {
        const errorData = await response.json();
        console.error('Error al guardar la cita:', errorData);
        setSnackbar({ open: true, message: 'Error al guardar la cita', severity: 'error' });
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      setSnackbar({ open: true, message: 'Error al guardar la cita', severity: 'error' });
    }
  };

  const handleDelete = async (appointmentId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No hay token de autenticación');
          return;
        }

        const response = await fetch(`/api/citas/${appointmentId}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setAppointments(appointments.filter(a => a.id_cita !== appointmentId));
          setSnackbar({ open: true, message: 'Cita eliminada correctamente', severity: 'success' });
        } else {
          console.error('Error al eliminar la cita:', await response.text());
          setSnackbar({ open: true, message: 'Error al eliminar la cita', severity: 'error' });
        }
      } catch (error) {
        console.error('Error deleting appointment:', error);
        setSnackbar({ open: true, message: 'Error al eliminar la cita', severity: 'error' });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'warning';
      case 'confirmada':
        return 'success';
      case 'cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestión de Citas</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Nueva Cita
        </Button>
      </Box>

      {vetAppointments.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
          No hay citas programadas
        </Typography>
      ) : (
        <List>
          {vetAppointments.map((appointment) => (
            <ListItem
              key={appointment.id_cita}
              sx={{
                mb: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1
              }}
            >
              <ListItemText
                primary={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h6">
                      {pets.find(p => p.id_mascota === appointment.id_mascota)?.nombre}
                    </Typography>
                    <Chip
                      label={appointment.estado}
                      color={getStatusColor(appointment.estado)}
                      size="small"
                    />
                  </Stack>
                }
                secondary={
                  <Typography component="div" variant="body2">
                    <Typography component="div" sx={{ mb: 0.5 }}>
                      Fecha: {new Date(appointment.fecha_hora).toLocaleString()}
                    </Typography>
                    <Typography component="div" sx={{ mb: 0.5 }}>
                      Tipo de Consulta: {appointment.tipo_consulta}
                    </Typography>
                    {appointment.motivo_consulta && (
                      <Typography component="div">
                        Motivo: {appointment.motivo_consulta}
                      </Typography>
                    )}
                  </Typography>
                }
              />
              <ListItemSecondaryAction>
                <IconButton onClick={() => handleOpenDialog(appointment)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(appointment.id_cita)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedAppointment ? 'Editar Cita' : 'Nueva Cita'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              select
              label="Mascota"
              fullWidth
              value={formData.petId}
              onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
              required
            >
              {pets.map((pet) => (
                <MenuItem key={pet.id_mascota} value={pet.id_mascota}>
                  {pet.nombre}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Veterinario"
              fullWidth
              value={formData.id_veterinario}
              onChange={(e) => setFormData({ ...formData, id_veterinario: e.target.value })}
              required
            >
              {veterinarians.map((vet) => (
                <MenuItem key={vet.id_usuario} value={vet.id_usuario}>
                  {`${vet.nombre} ${vet.apellido}`}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Fecha"
              type="date"
              fullWidth
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Hora"
              type="time"
              fullWidth
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              select
              label="Tipo de Consulta"
              fullWidth
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              <MenuItem value="consulta_general">Consulta General</MenuItem>
              <MenuItem value="vacunacion">Vacunación</MenuItem>
              <MenuItem value="cirugia">Cirugía</MenuItem>
              <MenuItem value="urgencia">Urgencia</MenuItem>
              <MenuItem value="control">Control</MenuItem>
            </TextField>
            <TextField
              label="Motivo de la Consulta"
              fullWidth
              multiline
              rows={2}
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              required
            />
            <TextField
              select
              label="Estado"
              fullWidth
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              required
            >
              <MenuItem value="pendiente">Pendiente</MenuItem>
              <MenuItem value="confirmada">Confirmada</MenuItem>
              <MenuItem value="cancelada">Cancelada</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedAppointment ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Appointments; 