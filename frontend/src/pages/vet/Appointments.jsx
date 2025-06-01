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
  InputAdornment,
  TablePagination
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, SwapHoriz as SwapHorizIcon, Check as CheckIcon, Close as CloseIcon, Search as SearchIcon, Visibility as VisibilityIcon, Add as AddIcon } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import '../client/client-table.css';
import PetsIcon from '@mui/icons-material/Pets';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';

/**
 * Página de gestión de citas para veterinarios
 * Permite ver, crear, editar y gestionar el estado de las citas asignadas al veterinario
 */
const Appointments = () => {
  const { appointments, pets, setAppointments } = useApp();
  const { user } = useAuth();
  // Estado para controlar la apertura del diálogo de creación/edición
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
    id_veterinario: ''
  });
  // Estado para controlar las notificaciones
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  // Estado para controlar el cambio de estado de una cita
  const [changingStateId, setChangingStateId] = useState(null);
  // Estado para controlar la hora seleccionada
  const [selectedHour, setSelectedHour] = useState('10');
  const [selectedMinute, setSelectedMinute] = useState('00');
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para el ordenamiento de la tabla
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('fecha');
  // Estado para controlar el diálogo de detalles
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [detailsAppointment, setDetailsAppointment] = useState(null);
  // Estado para la paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  // Estado para controlar el diálogo de eliminación
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  // Referencia para el input de fecha
  const dateInputRef = React.useRef(null);

  // Efecto para cargar la lista de veterinarios al montar el componente
  useEffect(() => {
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

  // Filtrar citas solo del veterinario logueado
  const vetAppointments = appointments.filter(
    (appointment) =>
      appointment.id_usuario === user?.id_usuario ||
      appointment.veterinario?.id_usuario === user?.id_usuario
  );

  // Efecto para refrescar las citas cuando cambien las mascotas
  useEffect(() => {
    refreshAppointments();
  }, [pets]);

  // Mostrar un indicador de carga mientras se obtienen los datos
  if (!Array.isArray(appointments) || !Array.isArray(pets)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  /**
   * Abre el diálogo para crear o editar una cita
   * @param {Object} appointment - La cita a editar (opcional)
   */
  const handleOpenDialog = (appointment = null) => {
    if (appointment) {
      setSelectedAppointment(appointment);
      // Parsear fecha y hora como texto, no como Date
      const [datePart, timePart] = appointment.fecha_hora.split('T');
      const [hour, minute] = timePart.split(':');
      setFormData({
        petId: String(appointment.id_mascota || appointment.mascota?.id_mascota),
        date: datePart,
        time: `${hour}:${minute}`,
        type: appointment.tipo_consulta,
        motivo: appointment.motivo_consulta || '',
        id_veterinario: appointment.veterinario?.id_usuario || appointment.id_usuario
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
        id_veterinario: user?.id_usuario || ''
      });
      setSelectedHour('10');
      setSelectedMinute('00');
    }
    setOpenDialog(true);
  };

  /**
   * Cierra el diálogo de creación/edición
   */
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAppointment(null);
  };

  /**
   * Actualiza la lista de citas desde el servidor
   */
  const refreshAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('https://vetcareclinica.com/api/citas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const appointmentsArray = Array.isArray(data) ? data : (data.data || []);
        setAppointments(appointmentsArray);
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

  /**
   * Maneja el envío del formulario para crear o actualizar una cita
   */
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const url = selectedAppointment 
        ? `https://vetcareclinica.com/api/citas/${selectedAppointment.id_cita}`
        : 'https://vetcareclinica.com/api/citas';
      
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

      const data = await response.json();

      if (!response.ok) {
        // Manejo de error específico para conflicto de cita
        let errorMsg = data.message || (data.errors && Object.values(data.errors).flat().join(' ')) || 'Error al guardar la cita';
        if (errorMsg.toLowerCase().includes('ya tiene una cita programada')) {
          setSnackbar({
            open: true,
            message: 'No se ha podido crear porque en esa hora el veterinario tiene una cita asignada.',
            severity: 'error'
          });
          return;
        }
        setSnackbar({
          open: true,
          message: errorMsg,
          severity: 'error'
        });
        throw new Error(errorMsg);
      }

      setSnackbar({
        open: true,
        message: `Cita ${selectedAppointment ? 'actualizada' : 'creada'} exitosamente`,
        severity: 'success'
      });

      await refreshAppointments();
      handleCloseDialog();
    } catch (error) {
      console.error('Error al guardar cita:', error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  const handleDelete = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`/api/citas/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar la cita');
      }

      setSnackbar({
        open: true,
        message: 'Cita eliminada exitosamente',
        severity: 'success'
      });

      await refreshAppointments();
    } catch (error) {
      console.error('Error al eliminar cita:', error);
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
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      setChangingStateId(appointment.id_cita);

      const response = await fetch(`/api/citas/${appointment.id_cita}/estado`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: newState }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar el estado de la cita');
      }

      // Actualizar el estado local inmediatamente
      const updatedAppointments = appointments.map(a => 
        a.id_cita === appointment.id_cita 
          ? { ...a, estado: newState }
          : a
      );
      setAppointments(updatedAppointments);

      setSnackbar({
        open: true,
        message: 'Estado de la cita actualizado exitosamente',
        severity: 'success'
      });

      await refreshAppointments();
    } catch (error) {
      console.error('Error al cambiar estado de la cita:', error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    } finally {
      setChangingStateId(null);
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
    if (!dateString) return '';
    const [datePart, timePart] = dateString.split('T');
    if (!timePart) return datePart;
    const [hour, minute] = timePart.split(':');
    return `${datePart}, ${hour}:${minute}`;
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
        placeholder="Buscar por mascota, dueño, motivo..."
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
            {sortedAppointments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length > 0 ? (
              sortedAppointments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((appointment) => (
                <TableRow key={appointment.id_cita}>
                  <TableCell>{formatDateTime(appointment.fecha_hora)}</TableCell>
                  <TableCell>{appointment.mascota?.nombre || pets.find(p => p.id_mascota === appointment.id_mascota)?.nombre}</TableCell>
                  <TableCell>{(appointment.mascota?.usuario?.nombre || pets.find(p => p.id_mascota === appointment.id_mascota)?.usuario?.nombre || '') + ' ' + (appointment.mascota?.usuario?.apellido || pets.find(p => p.id_mascota === appointment.id_mascota)?.usuario?.apellido || '')}</TableCell>
                  <TableCell>{appointment.veterinario?.nombre} {appointment.veterinario?.apellido}</TableCell>
                  <TableCell>{appointment.tipo_consulta}</TableCell>
                  <TableCell>
                    {appointment.motivo_consulta ? (
                      <Tooltip title={appointment.motivo_consulta}>
                        <Typography noWrap sx={{ maxWidth: 200, fontSize: 'inherit' }}>{appointment.motivo_consulta}</Typography>
                      </Tooltip>
                    ) : (
                      <Typography color="text.secondary" sx={{ fontSize: 'inherit' }}>Sin motivo</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.estado}
                      color={getStatusColor(appointment.estado)}
                      size="small"
                      sx={{ fontWeight: 600, color: 'white', textTransform: 'capitalize', minWidth: 110, maxWidth: 110, justifyContent: 'center' }}
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
                    <Tooltip title="Ver detalles">
                      <IconButton onClick={() => { setDetailsAppointment(appointment); setOpenDetailsDialog(true); }}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton onClick={() => handleOpenDialog(appointment)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton onClick={() => handleOpenDeleteDialog(appointment.id_cita)}>
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
            boxShadow: '0 8px 32px rgba(33,150,243,0.10)'
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
              {pets.map((pet) => (
                <MenuItem key={pet.id_mascota} value={String(pet.id_mascota)}>
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
              name="fecha"
              label="Fecha"
              type="date"
              value={formData.date}
              onChange={e => {
                const date = e.target.value;
                const time = formData.time ? formData.time.split(':')[1]?.slice(0,5) : '';
                setFormData({ ...formData, date: date, time: date && time ? `${date}T${time}` : date ? `${date}T10:00` : '' });
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
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
              sx={{ width: '100%' }}
            >
              <MenuItem value="consulta_general">Consulta General</MenuItem>
              <MenuItem value="vacunacion">Vacunación</MenuItem>
              <MenuItem value="cirugia">Cirugía</MenuItem>
              <MenuItem value="urgencia">Urgencia</MenuItem>
              <MenuItem value="control">Control</MenuItem>
            </TextField>
            <TextField
              label="Motivo de la Consulta"
              multiline
              rows={2}
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              required
              sx={{ width: '100%' }}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
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
                <Typography variant="subtitle2" color="text.secondary">Dueño</Typography>
                <Typography fontWeight={500}>{(detailsAppointment.mascota?.usuario?.nombre || pets.find(p => p.id_mascota === detailsAppointment.id_mascota)?.usuario?.nombre || '') + ' ' + (detailsAppointment.mascota?.usuario?.apellido || pets.find(p => p.id_mascota === detailsAppointment.id_mascota)?.usuario?.apellido || '')}</Typography>
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