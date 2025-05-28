import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  TableSortLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Appointments = () => {
  const { appointments, pets, setAppointments, addAppointment, updateAppointment, deleteAppointment, token } = useApp();
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
    id_usuario: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedHour, setSelectedHour] = useState('10');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('fecha_hora');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  if (!Array.isArray(appointments) || !Array.isArray(pets)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Filtrar las mascotas del usuario actual
  const userPets = pets.filter(pet => pet.usuario?.id_usuario === user?.id_usuario);

  // Filtrar las citas que corresponden a las mascotas del usuario
  const filteredAppointments = appointments.filter(appointment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.motivo_consulta?.toLowerCase().includes(searchLower) ||
      pets.find(p => p.id_mascota === appointment.id_mascota)?.nombre?.toLowerCase().includes(searchLower) ||
      appointment.estado?.toLowerCase().includes(searchLower) ||
      appointment.veterinario?.nombre?.toLowerCase().includes(searchLower) ||
      appointment.veterinario?.apellido?.toLowerCase().includes(searchLower)
    );
  });

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (orderBy === 'fecha_hora') {
      if (order === 'asc') {
        return new Date(a.fecha_hora) - new Date(b.fecha_hora);
      } else {
        return new Date(b.fecha_hora) - new Date(a.fecha_hora);
      }
    }
    return 0;
  });

  useEffect(() => {
    // Fetch veterinarians when component mounts
    const fetchVeterinarians = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/veterinarios', {
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
  }, [token]);

  // Añadir useEffect para refrescar citas cuando cambien las mascotas
  useEffect(() => {
    refreshAppointments();
  }, [pets]);

  const handleOpenDialog = (appointment = null) => {
    if (appointment) {
      setSelectedAppointment(appointment);
      setFormData({
        petId: appointment.mascota?.id_mascota || '',
        date: appointment.fecha_hora.split('T')[0],
        time: appointment.fecha_hora.split('T')[1].substring(0, 5),
        type: appointment.tipo_consulta,
        motivo: appointment.motivo || appointment.motivo_consulta || '',
        estado: appointment.estado,
        id_usuario: appointment.veterinario?.id_usuario || ''
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
        id_usuario: ''
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
      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      const url = selectedAppointment 
        ? `http://localhost:8000/api/citas/${selectedAppointment.id_cita}`
        : 'http://localhost:8000/api/citas';
      
      const method = selectedAppointment ? 'PUT' : 'POST';
      
      const fechaHora = `${formData.date}T${formData.time}:00`;
      
      const requestData = {
        id_mascota: formData.petId,
        fecha_hora: fechaHora,
        tipo_consulta: formData.type,
        motivo_consulta: formData.motivo,
        id_usuario: Number(formData.id_usuario)
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
        credentials: 'include'
      });

      if (response.ok) {
        const updatedAppointment = await response.json();
        if (selectedAppointment) {
          setAppointments(appointments.map(a => a.id_cita === updatedAppointment.id_cita ? updatedAppointment : a));
        } else {
          setAppointments([...appointments, updatedAppointment]);
        }
        await refreshAppointments();
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
        if (!token) {
          console.error('No hay token de autenticación');
          return;
        }

        const response = await fetch(`http://localhost:8000/api/citas/${appointmentId}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });

        if (response.ok) {
          setAppointments(appointments.filter(a => a.id_cita !== appointmentId));
          await refreshAppointments();
          setSnackbar({ open: true, message: 'Cita eliminada correctamente', severity: 'success' });
        } else {
          const errorData = await response.json();
          console.error('Error al eliminar la cita:', errorData);
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

  // Función para refrescar la lista de citas
  const refreshAppointments = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/citas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAppointments(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (e) { /* opcional: manejar error */ }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
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

      <Box sx={{ mb: 2 }}>
        <TextField
          label="Buscar"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
          fullWidth
          sx={{ mb: 2 }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'fecha_hora'}
                  direction={orderBy === 'fecha_hora' ? order : 'asc'}
                  onClick={() => handleRequestSort('fecha_hora')}
                >
                  Fecha y Hora
                </TableSortLabel>
              </TableCell>
              <TableCell>Mascota</TableCell>
              <TableCell>Veterinario</TableCell>
              <TableCell>Tipo de Consulta</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAppointments.length > 0 ? (
              sortedAppointments.map((appointment) => (
                <TableRow key={appointment.id_cita}>
                  <TableCell>
                    {new Date(appointment.fecha_hora).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {appointment.mascota?.nombre || pets.find(p => p.id_mascota === appointment.id_mascota)?.nombre}
                  </TableCell>
                  <TableCell>
                    {appointment.veterinario?.nombre} {appointment.veterinario?.apellido}
                  </TableCell>
                  <TableCell>{appointment.tipo_consulta}</TableCell>
                  <TableCell>
                    {appointment.motivo_consulta ? (
                      <Tooltip title={appointment.motivo_consulta}>
                        <Typography noWrap sx={{ maxWidth: 200 }}>
                          {appointment.motivo_consulta}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography color="text.secondary">Sin motivo</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.estado}
                      color={getStatusColor(appointment.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Editar">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(appointment)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(appointment.id_cita)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay citas programadas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
              {userPets.map((pet) => (
                <MenuItem key={pet.id_mascota} value={pet.id_mascota}>
                  {pet.nombre}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Veterinario"
              fullWidth
              value={formData.id_usuario}
              onChange={(e) => setFormData({ ...formData, id_usuario: Number(e.target.value) })}
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
              inputProps={{
                min: new Date().toISOString().split('T')[0]
              }}
              required
            />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                select
                label="Hora"
                value={selectedHour}
                onChange={e => {
                  setSelectedHour(e.target.value);
                  setFormData({ ...formData, time: `${e.target.value}:${selectedMinute}` });
                }}
                sx={{ width: 100 }}
                InputLabelProps={{ shrink: true }}
                required
              >
                {[...Array(8)].map((_, i) => {
                  const hour = 10 + i;
                  return (
                    <MenuItem key={hour} value={hour.toString().padStart(2, '0')}>
                      {hour.toString().padStart(2, '0')}
                    </MenuItem>
                  );
                })}
              </TextField>
              <TextField
                select
                label="Minutos"
                value={selectedMinute}
                onChange={e => {
                  setSelectedMinute(e.target.value);
                  setFormData({ ...formData, time: `${selectedHour}:${e.target.value}` });
                }}
                sx={{ width: 100 }}
                InputLabelProps={{ shrink: true }}
                required
              >
                {['00', '15', '30', '45'].map(min => (
                  <MenuItem key={min} value={min}>{min}</MenuItem>
                ))}
              </TextField>
            </Box>
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
              rows={3}
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedAppointment ? 'Actualizar' : 'Guardar'}
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

export default Appointments; 