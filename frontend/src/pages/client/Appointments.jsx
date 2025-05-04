import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const Appointments = () => {
  const { appointments, setAppointments, pets } = useApp();
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    petId: '',
    date: '',
    time: '',
    type: '',
    notes: ''
  });

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      petId: '',
      date: '',
      time: '',
      type: '',
      notes: ''
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newAppointment = await response.json();
        setAppointments([...appointments, newAppointment]);
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const response = await fetch(`/api/appointments/${appointmentId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setAppointments(appointments.filter(a => a.id !== appointmentId));
        }
      } catch (error) {
        console.error('Error canceling appointment:', error);
      }
    }
  };

  const getPetName = (petId) => {
    const pet = pets.find(p => p.id === petId);
    return pet ? pet.name : 'Unknown';
  };

  const upcomingAppointments = appointments
    .filter(a => new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const pastAppointments = appointments
    .filter(a => new Date(a.date) < new Date())
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Mis Citas</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenDialog}
        >
          Agendar Nueva Cita
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Próximas Citas
              </Typography>
              <List>
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <ListItem key={appointment.id}>
                      <ListItemText
                        primary={new Date(appointment.date).toLocaleDateString()}
                        secondary={
                          <>
                            <Typography component="span" variant="body2">
                              {appointment.time} - {getPetName(appointment.petId)}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color="text.secondary">
                              {appointment.type}
                            </Typography>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={appointment.status}
                          color={
                            appointment.status === 'scheduled' ? 'primary' :
                            appointment.status === 'completed' ? 'success' :
                            appointment.status === 'cancelled' ? 'error' : 'default'
                          }
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        {appointment.status === 'scheduled' && (
                          <IconButton
                            edge="end"
                            onClick={() => handleCancel(appointment.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No hay citas próximas" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Citas Pasadas
              </Typography>
              <List>
                {pastAppointments.length > 0 ? (
                  pastAppointments.map((appointment) => (
                    <ListItem key={appointment.id}>
                      <ListItemText
                        primary={new Date(appointment.date).toLocaleDateString()}
                        secondary={
                          <>
                            <Typography component="span" variant="body2">
                              {appointment.time} - {getPetName(appointment.petId)}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color="text.secondary">
                              {appointment.type}
                            </Typography>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={appointment.status}
                          color={
                            appointment.status === 'completed' ? 'success' :
                            appointment.status === 'cancelled' ? 'error' : 'default'
                          }
                          size="small"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No hay citas anteriores" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Agendar Nueva Cita</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Mascota</InputLabel>
            <Select
              value={formData.petId}
              onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
              label="Mascota"
            >
              {pets.map((pet) => (
                <MenuItem key={pet.id} value={pet.id}>
                  {pet.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
          <FormControl fullWidth margin="dense">
            <InputLabel>Tipo</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              label="Tipo"
            >
              <MenuItem value="checkup">Chequeo</MenuItem>
              <MenuItem value="vaccination">Vacunación</MenuItem>
              <MenuItem value="surgery">Cirugía</MenuItem>
              <MenuItem value="grooming">Estética</MenuItem>
              <MenuItem value="other">Otro</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Notas"
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
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Appointments; 