import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  TableSortLabel,
  Avatar,
  Divider,
  TablePagination
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  SwapHoriz as SwapHorizIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Pets as PetsIcon
} from '@mui/icons-material';
import '../client/client-table.css';

const AdminAppointments = () => {
  const { appointments, pets, users, setAppointments } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    id_mascota: '',
    id_usuario: '',
    fecha_hora: '',
    tipo_consulta: '',
    motivo_consulta: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [changingStateId, setChangingStateId] = useState(null);
  const [selectedHour, setSelectedHour] = useState('10');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('fecha');
  const dateInputRef = useRef(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [detailsAppointment, setDetailsAppointment] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Extraer las citas del objeto de respuesta
  const appointmentsData = useMemo(() => {
    console.log('Raw appointments:', appointments);
    return Array.isArray(appointments) ? appointments : (appointments?.data || []);
  }, [appointments]);

  if (!appointmentsData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'warning';
      case 'confirmada':
        return 'success';
      case 'completada':
        return 'success';
      case 'cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const [datePart, timePart] = dateString.split('T');
    if (!timePart) return datePart;
    const [hour, minute] = timePart.split(':');
    return `${datePart}, ${hour}:${minute}`;
  };

  const handleOpenDialog = (appointment = null) => {
    if (appointment) {
      // Parsear fecha y hora como local
      const [datePart, timePart] = appointment.fecha_hora.split('T');
      const [year, month, day] = datePart.split('-');
      const [hour, minute] = timePart.split(':');
      const local = `${year}-${month}-${day}T${hour}:${minute}`;
      setFormData({
        id_mascota: appointment.id_mascota || appointment.mascota?.id_mascota || '',
        id_usuario: appointment.id_usuario || appointment.veterinario?.id_usuario || '',
        fecha_hora: local,
        tipo_consulta: appointment.tipo_consulta,
        motivo_consulta: appointment.motivo_consulta,
      });
      setSelectedHour(hour);
      setSelectedMinute(minute);
      setSelectedAppointment(appointment);
    } else {
      setFormData({
        id_mascota: '',
        id_usuario: '',
        fecha_hora: '',
        tipo_consulta: '',
        motivo_consulta: '',
      });
      setSelectedHour('10');
      setSelectedMinute('00');
      setSelectedAppointment(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAppointment(null);
  };

  const handleOpenDeleteDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedAppointment(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const url = selectedAppointment
        ? `http://vetcareclinica.com/api/citas/${selectedAppointment.id_cita}`
        : 'http://vetcareclinica.com/api/citas';
      
      const method = selectedAppointment ? 'PUT' : 'POST';
      
      const token = localStorage.getItem('token');
      const citaData = {
        id_mascota: formData.id_mascota,
        id_usuario: formData.id_usuario,
        fecha_hora: formData.fecha_hora,
        motivo_consulta: formData.motivo_consulta,
        tipo_consulta: formData.tipo_consulta
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(citaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar la cita');
      }

      setSnackbar({
        open: true,
        message: `Cita ${selectedAppointment ? 'actualizada' : 'creada'} exitosamente`,
        severity: 'success'
      });
      await refreshAppointments();
      handleCloseDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://vetcareclinica.com/api/citas/${selectedAppointment.id_cita}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error al eliminar la cita');

      setSnackbar({
        open: true,
        message: 'Cita eliminada exitosamente',
        severity: 'success'
      });
      await refreshAppointments();
      handleCloseDeleteDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
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
        const updatedAppointments = appointmentsData.map(a => 
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

  const filteredAppointments = appointmentsData.filter(appointment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.motivo_consulta?.toLowerCase().includes(searchLower) ||
      appointment.mascota?.nombre?.toLowerCase().includes(searchLower) ||
      appointment.mascota?.usuario?.nombre?.toLowerCase().includes(searchLower) ||
      appointment.mascota?.usuario?.apellido?.toLowerCase().includes(searchLower) ||
      appointment.veterinario?.nombre?.toLowerCase().includes(searchLower) ||
      appointment.veterinario?.apellido?.toLowerCase().includes(searchLower) ||
      appointment.estado?.toLowerCase().includes(searchLower)
    );
  });

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (orderBy === 'fecha') {
      if (order === 'asc') {
        return new Date(a.fecha_hora) - new Date(b.fecha_hora);
      } else {
        return new Date(b.fecha_hora) - new Date(a.fecha_hora);
      }
    } else if (orderBy === 'estado') {
      if (order === 'asc') {
        return (a.estado || '').localeCompare(b.estado || '');
      } else {
        return (b.estado || '').localeCompare(a.estado || '');
      }
    } else if (orderBy === 'dueno') {
      const aName = (a.mascota?.usuario?.nombre || '') + ' ' + (a.mascota?.usuario?.apellido || '');
      const bName = (b.mascota?.usuario?.nombre || '') + ' ' + (b.mascota?.usuario?.apellido || '');
      if (order === 'asc') {
        return aName.localeCompare(bName);
      } else {
        return bName.localeCompare(aName);
      }
    } else if (orderBy === 'veterinario') {
      const aVet = (a.veterinario?.nombre || '') + ' ' + (a.veterinario?.apellido || '');
      const bVet = (b.veterinario?.nombre || '') + ' ' + (b.veterinario?.apellido || '');
      if (order === 'asc') {
        return aVet.localeCompare(bVet);
      } else {
        return bVet.localeCompare(aVet);
      }
    }
    return 0;
  });

  // Función para refrescar la lista de citas
  const refreshAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://vetcareclinica.com/api/citas', {
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#111' }}>
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

      <Box sx={{ mb: 2 }}>
        <input
          className="client-search-bar"
          placeholder="Buscar por mascota, dueño, motivo..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#222' }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ 
        borderRadius: '12px',
        boxShadow: '0 1px 6px rgba(60,60,60,0.07)'
      }}>
        <Table className="client-table">
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
              <TableCell>Mascota</TableCell>
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
              <TableCell>Tipo de Consulta</TableCell>
              <TableCell>Motivo</TableCell>
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
            {sortedAppointments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length > 0 ? (
              sortedAppointments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((appointment) => (
                <TableRow key={appointment.id_cita}>
                  <TableCell>{formatDateTime(appointment.fecha_hora)}</TableCell>
                  <TableCell>{appointment.mascota?.nombre}</TableCell>
                  <TableCell>
                    {appointment.mascota?.usuario?.nombre} {appointment.mascota?.usuario?.apellido}
                  </TableCell>
                  <TableCell>
                    {appointment.veterinario?.nombre} {appointment.veterinario?.apellido}
                  </TableCell>
                  <TableCell>{appointment.tipo_consulta}</TableCell>
                  <TableCell>{appointment.motivo_consulta}</TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.estado}
                      color={getStatusColor(appointment.estado)}
                      size="small"
                      sx={{ minWidth: 110, maxWidth: 110, justifyContent: 'center', fontWeight: 600, color: 'white', textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Cambiar estado">
                        <IconButton size="small" onClick={() => setChangingStateId(changingStateId === appointment.id_cita ? null : appointment.id_cita)}>
                          <SwapHorizIcon />
                        </IconButton>
                      </Tooltip>
                      {changingStateId === appointment.id_cita && (
                        <>
                          <Tooltip title="Marcar como confirmada">
                            <IconButton size="small" onClick={() => handleChangeState(appointment, 'confirmada')} color="success">
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Marcar como cancelada">
                            <IconButton size="small" onClick={() => handleChangeState(appointment, 'cancelada')} color="error">
                              <CloseIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title="Ver detalles">
                        <IconButton size="small" onClick={() => { setDetailsAppointment(appointment); setOpenDetailsDialog(true); }}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenDialog(appointment)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" onClick={() => handleOpenDeleteDialog(appointment)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
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

      {/* Modal para crear/editar cita */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        className="client-modal"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(33,150,243,0.10)'
          }
        }}
      >
        <DialogTitle className="client-modal-title">
          {selectedAppointment ? 'Editar Cita' : 'Nueva Cita'}
        </DialogTitle>
        <DialogContent className="client-modal-content">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Mascota</InputLabel>
              <Select
                name="id_mascota"
                value={formData.id_mascota}
                onChange={handleInputChange}
                label="Mascota"
              >
                {pets?.map((pet) => (
                  <MenuItem key={pet.id_mascota} value={pet.id_mascota}>
                    {pet.nombre} - {pet.usuario?.nombre} {pet.usuario?.apellido}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Veterinario</InputLabel>
              <Select
                name="id_usuario"
                value={formData.id_usuario}
                onChange={handleInputChange}
                label="Veterinario"
              >
                {users?.filter(user => user.rol === 'veterinario').map((vet) => (
                  <MenuItem key={vet.id_usuario} value={vet.id_usuario}>
                    {vet.nombre} {vet.apellido}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="fecha"
              label="Fecha"
              type="date"
              value={formData.fecha_hora ? formData.fecha_hora.split('T')[0] : ''}
              onChange={e => {
                const date = e.target.value;
                const time = formData.fecha_hora ? formData.fecha_hora.split('T')[1]?.slice(0,5) : '';
                setFormData({ ...formData, fecha_hora: date && time ? `${date}T${time}` : date ? `${date}T10:00` : '' });
              }}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputRef={dateInputRef}
              inputProps={{
                min: new Date().toISOString().split('T')[0],
                onFocus: (e) => { if (e.target.showPicker) e.target.showPicker(); },
                onClick: (e) => { if (e.target.showPicker) e.target.showPicker(); }
              }}
              required
              sx={{ borderRadius: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                name="hora"
                label="Hora"
                select
                value={selectedHour}
                onChange={e => {
                  setSelectedHour(e.target.value);
                  const date = formData.fecha_hora ? formData.fecha_hora.split('T')[0] : '';
                  setFormData({ ...formData, fecha_hora: date ? `${date}T${e.target.value}:${selectedMinute}` : '' });
                }}
                sx={{ width: 100, mr: 2, borderRadius: 2 }}
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
                name="minuto"
                label="Minutos"
                select
                value={selectedMinute}
                onChange={e => {
                  setSelectedMinute(e.target.value);
                  const date = formData.fecha_hora ? formData.fecha_hora.split('T')[0] : '';
                  setFormData({ ...formData, fecha_hora: date ? `${date}T${selectedHour}:${e.target.value}` : '' });
                }}
                sx={{ width: 100, borderRadius: 2 }}
                InputLabelProps={{ shrink: true }}
                required
              >
                {['00', '15', '30', '45'].map(min => (
                  <MenuItem key={min} value={min}>{min}</MenuItem>
                ))}
              </TextField>
            </Box>
            <FormControl fullWidth>
              <InputLabel>Tipo de Consulta</InputLabel>
              <Select
                name="tipo_consulta"
                value={formData.tipo_consulta}
                onChange={handleInputChange}
                label="Tipo de Consulta"
              >
                <MenuItem value="consulta_general">Consulta General</MenuItem>
                <MenuItem value="vacunacion">Vacunación</MenuItem>
                <MenuItem value="cirugia">Cirugía</MenuItem>
                <MenuItem value="urgencia">Urgencia</MenuItem>
                <MenuItem value="control">Control</MenuItem>
              </Select>
            </FormControl>
            <TextField
              name="motivo_consulta"
              label="Motivo de la Consulta"
              value={formData.motivo_consulta}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
              sx={{ borderRadius: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions className="client-modal-actions">
          <Button onClick={handleCloseDialog} className="client-create-btn" style={{ background: '#f5f5f5', color: '#1769aa' }}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="client-create-btn" variant="contained">
            {selectedAppointment ? 'Actualizar' : 'Crear'}
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
          <Typography sx={{ mb: 2 }}>¿Estás seguro de que deseas eliminar la cita programada para {selectedAppointment?.mascota?.nombre}?</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
          <Button onClick={handleCloseDeleteDialog} sx={{ bgcolor: '#f5f5f5', color: '#1769aa', borderRadius: 2 }}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained" sx={{ borderRadius: 2 }}>Eliminar</Button>
        </DialogActions>
      </Dialog>

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
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontStyle: 'italic' }}>{detailsAppointment?.mascota?.nombre}</Typography>
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
                <Typography variant="subtitle2" color="text.secondary">Dueño</Typography>
                <Typography fontWeight={500}>{detailsAppointment.mascota?.usuario?.nombre} {detailsAppointment.mascota?.usuario?.apellido}</Typography>
              </Box>
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

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminAppointments; 