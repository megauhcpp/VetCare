import React, { useState, useEffect, useRef } from 'react';
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
  TableSortLabel,
  TablePagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import './client-table.css';
import { Add as AddIcon } from '@mui/icons-material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PetsIcon from '@mui/icons-material/Pets';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';

/**
 * Página de gestión de citas del cliente
 * Permite ver, agendar, editar y cancelar citas para las mascotas del usuario
 */
const Appointments = () => {
  const { appointments, pets, setAppointments, addAppointment, updateAppointment, deleteAppointment, token } = useApp();
  const { user } = useAuth();
  // Estado para controlar la apertura del diálogo de cita
  const [openDialog, setOpenDialog] = useState(false);
  // Estado para almacenar la cita seleccionada para edición
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  // Estado para almacenar la lista de veterinarios
  const [veterinarians, setVeterinarians] = useState([]);
  // Estado para almacenar los datos del formulario
  const [formData, setFormData] = useState({
    petId: '',
    date: '',
    time: '',
    type: '',
    motivo: '',
    estado: 'pendiente',
    id_usuario: ''
  });
  // Estado para controlar las notificaciones
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  // Estado para controlar la hora y minutos seleccionados
  const [selectedHour, setSelectedHour] = useState('10');
  const [selectedMinute, setSelectedMinute] = useState('00');
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para el ordenamiento de la tabla
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('fecha_hora');
  // Estado para controlar el diálogo de eliminación
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  // Referencia para el input de fecha
  const dateInputRef = useRef(null);
  // Estado para controlar el diálogo de detalles
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [detailsAppointment, setDetailsAppointment] = useState(null);
  // Estado para la paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Mostrar indicador de carga si los datos no están disponibles
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

  // Ordenar las citas según la fecha y hora
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

  /**
   * Efecto para cargar la lista de veterinarios al montar el componente
   */
  useEffect(() => {
    const fetchVeterinarians = async () => {
      try {
        const response = await fetch('https://vetcareclinica.com/api/veterinarios', {
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

  /**
   * Efecto para refrescar las citas cuando cambien las mascotas
   */
  useEffect(() => {
    refreshAppointments();
  }, [pets]);

  /**
   * Formatea la fecha y hora para mostrarla en la interfaz
   * @param {string} dateString - Fecha y hora en formato ISO
   * @returns {string} Fecha y hora formateada
   */
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const [datePart, timePart] = dateString.split('T');
    if (!timePart) return datePart;
    const [hour, minute] = timePart.split(':');
    return `${datePart}, ${hour}:${minute}`;
  };

  /**
   * Abre el diálogo para agregar o editar una cita
   * @param {Object} appointment - Cita a editar (opcional)
   */
  const handleOpenDialog = (appointment = null) => {
    if (appointment) {
      setSelectedAppointment(appointment);
      // Parsear fecha y hora como texto, no como Date
      const [datePart, timePart] = appointment.fecha_hora.split('T');
      const [hour, minute] = timePart.split(':');
      setFormData({
        petId: appointment.mascota?.id_mascota || '',
        date: datePart,
        time: `${hour}:${minute}`,
        type: appointment.tipo_consulta,
        motivo: appointment.motivo || appointment.motivo_consulta || '',
        estado: appointment.estado,
        id_usuario: appointment.veterinario?.id_usuario || ''
      });
      setSelectedHour(hour);
      setSelectedMinute(minute);
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
      setSelectedHour('10');
      setSelectedMinute('00');
    }
    setOpenDialog(true);
  };

  /**
   * Cierra el diálogo de cita
   */
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAppointment(null);
  };

  /**
   * Maneja el envío del formulario de cita
   * Realiza una petición POST o PUT al API según si es una nueva cita o una edición
   */
  const handleSubmit = async () => {
    try {
      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      const url = selectedAppointment 
        ? `https://vetcareclinica.com/api/citas/${selectedAppointment.id_cita}`
        : 'https://vetcareclinica.com/api/citas';
      
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
        body: JSON.stringify(requestData)
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

  /**
   * Maneja la eliminación de una cita
   * @param {number} appointmentId - ID de la cita a eliminar
   */
  const handleDelete = async (appointmentId) => {
    try {
      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      const response = await fetch(`https://vetcareclinica.com/api/citas/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
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
      const response = await fetch('https://vetcareclinica.com/api/citas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAppointments(Array.isArray(data) ? data : (data.data || []));
      } else {
        throw new Error('Error al obtener las citas');
      }
    } catch (error) {
      console.error('Error al refrescar citas:', error);
      setSnackbar({
        open: true,
        message: 'Error al actualizar la lista de citas',
        severity: 'error'
      });
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleOpenDeleteDialog = (appointmentId) => {
    setAppointmentToDelete(appointmentId);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setAppointmentToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!appointmentToDelete) return;
    await handleDelete(appointmentToDelete);
    setOpenDeleteDialog(false);
    setAppointmentToDelete(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#111' }}>
          Gestión de Citas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Cita
        </Button>
      </Box>

      <input
        className="client-search-bar"
        placeholder="Buscar cita, mascota, veterinario..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#222' }}
      />

      <TableContainer component={Paper} sx={{ 
        borderRadius: '12px',
        boxShadow: '0 1px 6px rgba(60,60,60,0.07)'
      }}>
        <Table className="client-table">
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
            {sortedAppointments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length > 0 ? (
              sortedAppointments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((appointment) => (
                <TableRow key={appointment.id_cita}>
                  <TableCell>
                    {formatDateTime(appointment.fecha_hora)}
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
                      sx={{ minWidth: 110, maxWidth: 110, justifyContent: 'center', fontWeight: 600, color: 'white', textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Ver detalles">
                      <IconButton size="small" onClick={() => { setDetailsAppointment(appointment); setOpenDetailsDialog(true); }}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleOpenDialog(appointment)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" onClick={() => handleOpenDeleteDialog(appointment.id_cita)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sortedAppointments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`}
          sx={{
            background: '#fff',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
            boxShadow: '0 1px 6px rgba(60,60,60,0.07)',
            padding: 0,
            '.MuiTablePagination-toolbar': { minHeight: 40, paddingLeft: 2, paddingRight: 2 },
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: 15 },
            '.MuiTablePagination-actions': { marginRight: 1 }
          }}
        />
      </TableContainer>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        className="client-modal"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle className="client-modal-title">
          {selectedAppointment ? 'Editar Cita' : 'Nueva Cita'}
        </DialogTitle>
        <DialogContent className="client-modal-content">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
              inputRef={dateInputRef}
              inputProps={{
                min: new Date().toISOString().split('T')[0],
                onFocus: (e) => { if (e.target.showPicker) e.target.showPicker(); },
                onClick: (e) => { if (e.target.showPicker) e.target.showPicker(); }
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
        <DialogActions className="client-modal-actions">
          <button onClick={handleCloseDialog} className="client-create-btn" style={{ background: '#f5f5f5', color: '#1769aa' }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} className="client-create-btn">
            {selectedAppointment ? 'Actualizar' : 'Guardar'}
          </button>
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

      {/* Modal de detalles de cita */}
      <Dialog 
        open={openDetailsDialog} 
        onClose={() => setOpenDetailsDialog(false)}
        maxWidth="sm"
        fullWidth
        className="client-modal"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(33,150,243,0.13)',
            background: 'linear-gradient(135deg, #f8fafc 60%, #e3f2fd 100%)'
          }
        }}
      >
        <DialogTitle className="client-modal-title" sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 0 }}>
          <Avatar sx={{ bgcolor: '#1976d2', width: 48, height: 48 }}>
            <PetsIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ letterSpacing: 1 }}>Cita</Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontStyle: 'italic' }}>{detailsAppointment?.mascota?.nombre || pets.find(p => p.id_mascota === detailsAppointment?.id_mascota)?.nombre}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent className="client-modal-content" sx={{ pt: 0 }}>
          {detailsAppointment && (
            <Box sx={{
              display: 'flex', flexDirection: 'column', gap: 2, mt: 1,
              bgcolor: 'rgba(255,255,255,0.85)', borderRadius: 2, p: 2, boxShadow: '0 2px 8px rgba(33,150,243,0.04)'
            }}>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Veterinario</Typography>
                <Typography fontWeight={500}>{detailsAppointment.veterinario?.nombre} {detailsAppointment.veterinario?.apellido}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Fecha</Typography>
                <Typography fontWeight={500}>{new Date(detailsAppointment.fecha_hora).toLocaleDateString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Hora</Typography>
                <Typography fontWeight={500}>{detailsAppointment.fecha_hora ? detailsAppointment.fecha_hora.split('T')[1]?.substring(0,5) : ''}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Tipo de Consulta</Typography>
                <Typography fontWeight={500}>{detailsAppointment.tipo_consulta}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">Motivo</Typography>
                <Typography sx={{ minHeight: 40, fontStyle: detailsAppointment.motivo_consulta ? 'normal' : 'italic', color: detailsAppointment.motivo_consulta ? 'text.primary' : 'text.secondary', fontWeight: 400, fontSize: 15, textAlign: 'right' }}>{detailsAppointment.motivo_consulta || 'Sin motivo'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Estado</Typography>
                <Typography fontWeight={500}>{detailsAppointment.estado}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions className="client-modal-actions">
          <Button onClick={() => setOpenDetailsDialog(false)} className="client-create-btn" style={{ background: '#f5f5f5', color: '#1769aa' }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación para eliminar */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(244,67,54,0.13)',
          p: 2,
          minWidth: 350,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #fff 60%, #ffebee 100%)'
        }
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, pb: 0, pt: 2 }}>
          <DeleteIcon sx={{ color: '#f44336', fontSize: 48, mb: 1 }} />
          <Typography variant="h6" fontWeight={700} color="error.main">Confirmar Eliminación</Typography>
        </Box>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>¿Estás seguro de que deseas eliminar esta cita?</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
          <Button onClick={handleCloseDeleteDialog} sx={{ bgcolor: '#f5f5f5', color: '#1769aa', borderRadius: 2 }}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" sx={{ borderRadius: 2 }}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Appointments; 