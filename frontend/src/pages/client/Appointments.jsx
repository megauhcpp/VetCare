import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
  Stack
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const Appointments = () => {
  const { appointments, pets, setAppointments } = useApp();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    petId: '',
    date: '',
    time: '',
    type: '',
    notes: ''
  });

  const handleOpenDialog = (appointment = null) => {
    if (appointment) {
      setSelectedAppointment(appointment);
      setFormData({
        petId: appointment.id_mascota,
        date: appointment.fecha_hora.split('T')[0],
        time: appointment.fecha_hora.split('T')[1].substring(0, 5),
        type: appointment.tipo_consulta,
        notes: appointment.observaciones || ''
      });
    } else {
      setSelectedAppointment(null);
      setFormData({
        petId: '',
        date: '',
        time: '',
        type: '',
        notes: ''
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
      const url = selectedAppointment 
        ? `/api/citas/${selectedAppointment.id_cita}`
        : '/api/citas';
      
      const method = selectedAppointment ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id_mascota: formData.petId,
          fecha_hora: `${formData.date}T${formData.time}:00`,
          tipo_consulta: formData.type,
          observaciones: formData.notes,
          estado: 'pendiente'
        }),
      });

      if (response.ok) {
        const updatedAppointment = await response.json();
        if (selectedAppointment) {
          setAppointments(appointments.map(a => a.id_cita === updatedAppointment.id_cita ? updatedAppointment : a));
        } else {
          setAppointments([...appointments, updatedAppointment]);
        }
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const handleDelete = async (appointmentId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      try {
        const response = await fetch(`/api/citas/${appointmentId}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          setAppointments(appointments.filter(a => a.id_cita !== appointmentId));
        }
      } catch (error) {
        console.error('Error deleting appointment:', error);
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
        <Typography variant="h4">Mis Citas</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Agendar Cita
        </Button>
      </Box>

      {appointments.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
          No tienes citas programadas. ¡Agenda una nueva cita!
        </Typography>
      ) : (
        <List>
          {appointments.map((appointment) => (
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
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ mb: 0.5 }}>
                      Fecha: {new Date(appointment.fecha_hora).toLocaleString()}
                    </Box>
                    <Box sx={{ mb: 0.5 }}>
                      Tipo de Consulta: {appointment.tipo_consulta}
                    </Box>
                    {appointment.observaciones && (
                      <Box>
                        Observaciones: {appointment.observaciones}
                      </Box>
                    )}
                  </Box>
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

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedAppointment ? 'Editar Cita' : 'Agendar Cita'}
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            margin="dense"
            label="Mascota"
            fullWidth
            value={formData.petId}
            onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
          >
            {pets.map((pet) => (
              <MenuItem key={pet.id_mascota} value={pet.id_mascota}>
                {pet.nombre}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Fecha"
            type="date"
            fullWidth
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="Hora"
            type="time"
            fullWidth
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            margin="dense"
            label="Tipo de Consulta"
            fullWidth
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <MenuItem value="consulta_general">Consulta General</MenuItem>
            <MenuItem value="vacunacion">Vacunación</MenuItem>
            <MenuItem value="cirugia">Cirugía</MenuItem>
            <MenuItem value="urgencia">Urgencia</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Observaciones"
            fullWidth
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} color="primary">
            {selectedAppointment ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Appointments; 