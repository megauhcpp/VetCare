import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

const AdminAppointments = () => {
  const { appointments, pets, addAppointment, updateAppointment, deleteAppointment } = useApp();
  const [open, setOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    motivo: '',
    mascota_id: '',
    estado: 'pendiente'
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  if (!appointments || !pets) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const handleOpen = (appointment = null) => {
    if (appointment) {
      setSelectedAppointment(appointment);
      setFormData({
        fecha: appointment.fecha,
        hora: appointment.hora,
        motivo: appointment.motivo,
        mascota_id: appointment.mascota_id,
        estado: appointment.estado
      });
    } else {
      setSelectedAppointment(null);
      setFormData({
        fecha: '',
        hora: '',
        motivo: '',
        mascota_id: '',
        estado: 'pendiente'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAppointment(null);
    setFormData({
      fecha: '',
      hora: '',
      motivo: '',
      mascota_id: '',
      estado: 'pendiente'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedAppointment) {
        await updateAppointment(selectedAppointment.id, formData);
        setSnackbar({
          open: true,
          message: 'Cita actualizada exitosamente',
          severity: 'success'
        });
      } else {
        await addAppointment(formData);
        setSnackbar({
          open: true,
          message: 'Cita creada exitosamente',
          severity: 'success'
        });
      }
      handleClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Error al procesar la cita',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAppointment(id);
      setSnackbar({
        open: true,
        message: 'Cita eliminada exitosamente',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Error al eliminar la cita',
        severity: 'error'
      });
    }
  };

  const getPetName = (petId) => {
    const pet = pets.find(p => p.id === petId);
    return pet ? pet.nombre : 'N/A';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <h2>Gestión de Citas</h2>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Nueva Cita
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Hora</TableCell>
              <TableCell>Mascota</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(appointments) && appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{appointment.fecha}</TableCell>
                <TableCell>{appointment.hora}</TableCell>
                <TableCell>{getPetName(appointment.mascota_id)}</TableCell>
                <TableCell>{appointment.motivo}</TableCell>
                <TableCell>{appointment.estado}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(appointment)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(appointment.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedAppointment ? 'Editar Cita' : 'Nueva Cita'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Fecha"
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Hora"
              type="time"
              value={formData.hora}
              onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Mascota</InputLabel>
              <Select
                value={formData.mascota_id}
                onChange={(e) => setFormData({ ...formData, mascota_id: e.target.value })}
                label="Mascota"
                required
              >
                {Array.isArray(pets) && pets.map((pet, idx) => (
                  <MenuItem key={pet.id || `${pet.nombre}-${pet.especie}-${idx}`} value={pet.id}>
                    {pet.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Motivo"
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              margin="normal"
              multiline
              rows={3}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                label="Estado"
                required
              >
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="confirmada">Confirmada</MenuItem>
                <MenuItem value="completada">Completada</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
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
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminAppointments; 