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
  CircularProgress,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  InputAdornment
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, SwapHoriz as SwapHorizIcon, Check as CheckIcon, Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';
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
    id_veterinario: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [changingStateId, setChangingStateId] = useState(null);
  const [selectedHour, setSelectedHour] = useState('10');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('fecha'); // 'fecha', 'estado', 'dueno'

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
        id_usuario: formData.id_veterinario
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

  const handleChangeState = async (appointment, newState) => {
    try {
      const token = localStorage.getItem('token');
      const vetId = appointment.id_usuario || appointment.veterinario?.id_usuario;

      const response = await fetch(`/api/citas/${appointment.id_cita}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          estado: newState,
          id_veterinario: vetId,
          id_usuario: vetId
        }),
      });

      if (response.ok) {
        // Actualizar el estado local inmediatamente
        const updatedAppointments = appointments.map(a => 
          a.id_cita === appointment.id_cita 
            ? { ...a, estado: newState }
            : a
        );
        setAppointments(updatedAppointments);
        
        // Mostrar mensaje de éxito
        setSnackbar({ 
          open: true, 
          message: `Cita marcada como ${newState}`, 
          severity: 'success' 
        });
        setChangingStateId(null);

        // Recargar los datos para asegurar sincronización
        try {
          const refreshResponse = await fetch('/api/citas', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            setAppointments(data.data || []);
          }
        } catch (refreshError) {
          console.error('Error al recargar las citas:', refreshError);
        }
      } else {
        const errorData = await response.json();
        console.error('Error al cambiar el estado:', errorData);
        setSnackbar({ 
          open: true, 
          message: errorData.error || errorData.message || 'Error al cambiar el estado', 
          severity: 'error' 
        });
      }
    } catch (error) {
      console.error('Error al cambiar el estado:', error);
      setSnackbar({ open: true, message: 'Error al cambiar el estado', severity: 'error' });
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

  const filteredAppointments = vetAppointments.filter(appointment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.motivo_consulta?.toLowerCase().includes(searchLower) ||
      pets.find(p => p.id_mascota === appointment.id_mascota)?.nombre?.toLowerCase().includes(searchLower) ||
      appointment.estado?.toLowerCase().includes(searchLower) ||
      appointment.veterinario?.nombre?.toLowerCase().includes(searchLower) ||
      appointment.veterinario?.apellido?.toLowerCase().includes(searchLower) ||
      (pets.find(p => p.id_mascota === appointment.id_mascota)?.usuario?.nombre || '').toLowerCase().includes(searchLower) ||
      (pets.find(p => p.id_mascota === appointment.id_mascota)?.usuario?.apellido || '').toLowerCase().includes(searchLower)
    );
  });
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (orderBy === 'fecha') {
      if (order === 'asc') {
        return new Date(a.fecha_hora) - new Date(b.fecha_hora);
      } else {
        return new Date(b.fecha_hora) - new Date(a.fecha_hora);
      }
    } else if (orderBy === 'mascota') {
      const aName = (pets.find(p => p.id_mascota === a.id_mascota)?.nombre || '');
      const bName = (pets.find(p => p.id_mascota === b.id_mascota)?.nombre || '');
      return order === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
    } else if (orderBy === 'dueno') {
      const aName = (pets.find(p => p.id_mascota === a.id_mascota)?.usuario?.nombre || '') + ' ' + (pets.find(p => p.id_mascota === a.id_mascota)?.usuario?.apellido || '');
      const bName = (pets.find(p => p.id_mascota === b.id_mascota)?.usuario?.nombre || '') + ' ' + (pets.find(p => p.id_mascota === b.id_mascota)?.usuario?.apellido || '');
      return order === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
    } else if (orderBy === 'veterinario') {
      const aVet = (a.veterinario?.nombre || '') + ' ' + (a.veterinario?.apellido || '');
      const bVet = (b.veterinario?.nombre || '') + ' ' + (b.veterinario?.apellido || '');
      return order === 'asc' ? aVet.localeCompare(bVet) : bVet.localeCompare(aVet);
    } else if (orderBy === 'estado') {
      return order === 'asc' ? (a.estado || '').localeCompare(b.estado || '') : (b.estado || '').localeCompare(a.estado || '');
    } else if (orderBy === 'tipo_consulta') {
      return order === 'asc' ? (a.tipo_consulta || '').localeCompare(b.tipo_consulta || '') : (b.tipo_consulta || '').localeCompare(a.tipo_consulta || '');
    } else if (orderBy === 'motivo') {
      return order === 'asc' ? (a.motivo_consulta || '').localeCompare(b.motivo_consulta || '') : (b.motivo_consulta || '').localeCompare(a.motivo_consulta || '');
    } else if (orderBy === 'cambiar_estado' || orderBy === 'acciones') {
      // No tiene sentido ordenar por estas columnas, así que no cambiamos el orden
      return 0;
    }
    return 0;
  });

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Citas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Nueva Cita
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por mascota, dueño, motivo..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'fecha'}
                  direction={orderBy === 'fecha' ? order : 'asc'}
                  onClick={() => handleRequestSort('fecha')}
                >
                  Fecha y Hora
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'mascota'}
                  direction={orderBy === 'mascota' ? order : 'asc'}
                  onClick={() => handleRequestSort('mascota')}
                >
                  Mascota
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'dueno'}
                  direction={orderBy === 'dueno' ? order : 'asc'}
                  onClick={() => handleRequestSort('dueno')}
                >
                  Dueño
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'veterinario'}
                  direction={orderBy === 'veterinario' ? order : 'asc'}
                  onClick={() => handleRequestSort('veterinario')}
                >
                  Veterinario
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'tipo_consulta'}
                  direction={orderBy === 'tipo_consulta' ? order : 'asc'}
                  onClick={() => handleRequestSort('tipo_consulta')}
                >
                  Tipo de Consulta
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'motivo'}
                  direction={orderBy === 'motivo' ? order : 'asc'}
                  onClick={() => handleRequestSort('motivo')}
                >
                  Motivo
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'estado'}
                  direction={orderBy === 'estado' ? order : 'asc'}
                  onClick={() => handleRequestSort('estado')}
                >
                  Estado
                </TableSortLabel>
              </TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAppointments.length > 0 ? (
              sortedAppointments.map((appointment) => (
                <TableRow key={appointment.id_cita}>
                  <TableCell>{formatDateTime(appointment.fecha_hora)}</TableCell>
                  <TableCell>{appointment.mascota?.nombre || pets.find(p => p.id_mascota === appointment.id_mascota)?.nombre}</TableCell>
                  <TableCell>{(appointment.mascota?.usuario?.nombre || pets.find(p => p.id_mascota === appointment.id_mascota)?.usuario?.nombre || '') + ' ' + (appointment.mascota?.usuario?.apellido || pets.find(p => p.id_mascota === appointment.id_mascota)?.usuario?.apellido || '')}</TableCell>
                  <TableCell>{appointment.veterinario?.nombre} {appointment.veterinario?.apellido}</TableCell>
                  <TableCell>{appointment.tipo_consulta}</TableCell>
                  <TableCell>
                    {appointment.motivo_consulta ? (
                      <Tooltip title={appointment.motivo_consulta}>
                        <Typography noWrap sx={{ maxWidth: 200 }}>{appointment.motivo_consulta}</Typography>
                      </Tooltip>
                    ) : (
                      <Typography color="text.secondary">Sin motivo</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.estado}
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 600, color: 'white', textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Cambiar estado">
                      <IconButton onClick={() => setChangingStateId(changingStateId === appointment.id_cita ? null : appointment.id_cita)}>
                        <SwapHorizIcon />
                      </IconButton>
                    </Tooltip>
                    {changingStateId === appointment.id_cita && (
                      <>
                        <Tooltip title="Confirmar">
                          <IconButton onClick={() => handleChangeState(appointment, 'confirmada')} color="success">
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancelar">
                          <IconButton onClick={() => handleChangeState(appointment, 'cancelada')} color="error">
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title="Editar">
                      <IconButton onClick={() => handleOpenDialog(appointment)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton onClick={() => handleDelete(appointment.id_cita)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
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
              disabled
            >
              <MenuItem key={user?.id_usuario} value={user?.id_usuario}>
                {user?.nombre} {user?.apellido}
              </MenuItem>
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
              rows={2}
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              required
            />
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