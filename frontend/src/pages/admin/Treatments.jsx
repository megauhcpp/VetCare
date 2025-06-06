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

/**
 * Página de gestión de tratamientos para el administrador
 * Permite ver, crear, editar y eliminar tratamientos del sistema
 */
const AdminTreatments = () => {
  const { treatments, pets, appointments, setTreatments } = useApp();
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estados para la ordenación de la tabla
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('fecha');
  // Estado para controlar la apertura del diálogo de creación/edición
  const [openDialog, setOpenDialog] = useState(false);
  // Estado para controlar la apertura del diálogo de eliminación
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  // Estado para almacenar el tratamiento seleccionado
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    id_cita: '',
    nombre: '',
    precio: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: ''
  });
  // Estado para las notificaciones
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  // Estado para controlar el cambio de estado de un tratamiento
  const [changingStateId, setChangingStateId] = useState(null);
  // Estado para el diálogo de detalles
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [detailsTreatment, setDetailsTreatment] = useState(null);
  // Estados para la paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Referencias para los inputs de fecha
  const dateInicioRef = useRef(null);
  const dateFinRef = useRef(null);

  // Extraer los tratamientos del objeto de respuesta
  const treatmentsData = useMemo(() => {
    return Array.isArray(treatments) ? treatments : (treatments?.data || []);
  }, [treatments]);

  // Mostrar un indicador de carga mientras se obtienen los datos
  if (!treatmentsData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  /**
   * Obtiene el color correspondiente al estado del tratamiento
   * @param {string} status - Estado del tratamiento
   * @returns {string} Color del chip
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'completado':
        return 'success';
      case 'activo':
        return 'primary';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  /**
   * Formatea la fecha para mostrarla en la interfaz
   * @param {string} dateString - Fecha en formato ISO
   * @returns {string} Fecha formateada
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Abre el diálogo de creación/edición de tratamiento
   * @param {Object} treatment - Tratamiento a editar (opcional)
   */
  const handleOpenDialog = (treatment = null) => {
    if (treatment) {
      setFormData({
        id_cita: treatment.id_cita || treatment.cita?.id_cita || '',
        nombre: treatment.nombre || '',
        precio: treatment.precio || '',
        descripcion: treatment.descripcion,
        fecha_inicio: treatment.fecha_inicio ? treatment.fecha_inicio.split('T')[0] : (treatment.cita?.fecha_inicio ? treatment.cita.fecha_inicio.split('T')[0] : ''),
        fecha_fin: treatment.fecha_fin ? treatment.fecha_fin.split('T')[0] : (treatment.cita?.fecha_fin ? treatment.cita.fecha_fin.split('T')[0] : '')
      });
      setSelectedTreatment(treatment);
    } else {
      setFormData({
        id_cita: '',
        nombre: '',
        precio: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: ''
      });
      setSelectedTreatment(null);
    }
    setOpenDialog(true);
  };

  /**
   * Cierra el diálogo de creación/edición
   */
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTreatment(null);
  };

  /**
   * Abre el diálogo de confirmación de eliminación
   * @param {Object} treatment - Tratamiento a eliminar
   */
  const handleOpenDeleteDialog = (treatment) => {
    setSelectedTreatment(treatment);
    setOpenDeleteDialog(true);
  };

  /**
   * Cierra el diálogo de confirmación de eliminación
   */
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedTreatment(null);
  };

  /**
   * Maneja los cambios en los campos del formulario
   * @param {Event} e - Evento del cambio en el input
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Maneja el envío del formulario para crear/actualizar un tratamiento
   */
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({ open: true, message: 'No hay token de autenticación', severity: 'error' });
        return;
      }

      const url = selectedTreatment
        ? `/api/tratamientos/${selectedTreatment.id_tratamiento}`
        : '/api/tratamientos';
      
      const method = selectedTreatment ? 'PUT' : 'POST';
      
      const treatmentData = {
        ...formData,
        estado: 'activo'
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(treatmentData),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: `Tratamiento ${selectedTreatment ? 'actualizado' : 'creado'} exitosamente`,
          severity: 'success'
        });
        await refreshTreatments();
        handleCloseDialog();
      } else {
        const errorData = await response.json();
        setSnackbar({ open: true, message: errorData.message || 'Error al guardar el tratamiento', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  };

  /**
   * Maneja la eliminación de un tratamiento
   */
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://vetcareclinica.com/api/tratamientos/${selectedTreatment.id_tratamiento}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error al eliminar el tratamiento');

      // Actualizar la lista de tratamientos
      const refreshResponse = await fetch('https://vetcareclinica.com/api/tratamientos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        const treatmentsArray = Array.isArray(data) ? data : (data.data || []);
        setTreatments(treatmentsArray);
      }

      setSnackbar({
        open: true,
        message: 'Tratamiento eliminado exitosamente',
        severity: 'success'
      });
      handleCloseDeleteDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  /**
   * Maneja el cambio de estado de un tratamiento
   * @param {Object} treatment - Tratamiento a modificar
   * @param {string} newState - Nuevo estado del tratamiento
   */
  const handleChangeState = async (treatment, newState) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({
          open: true,
          message: 'No hay token de autenticación',
          severity: 'error'
        });
        return;
      }

      const response = await fetch(`https://vetcareclinica.com/api/tratamientos/${treatment.id_tratamiento}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ estado: newState })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar el estado');
      }

      // Actualizar la lista de tratamientos
      const refreshResponse = await fetch('https://vetcareclinica.com/api/tratamientos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        const treatmentsArray = Array.isArray(data) ? data : (data.data || []);
        setTreatments(treatmentsArray);
      }

      setSnackbar({
        open: true,
        message: `Tratamiento marcado como ${newState}`,
        severity: 'success'
      });
      setChangingStateId(null);

    } catch (error) {
      console.error('Error updating treatment state:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Error al cambiar el estado',
        severity: 'error'
      });
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const filteredTreatments = treatmentsData.filter(treatment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      treatment.nombre?.toLowerCase().includes(searchLower) ||
      treatment.descripcion?.toLowerCase().includes(searchLower) ||
      treatment.cita?.mascota?.nombre?.toLowerCase().includes(searchLower) ||
      treatment.cita?.veterinario?.nombre?.toLowerCase().includes(searchLower) ||
      treatment.cita?.veterinario?.apellido?.toLowerCase().includes(searchLower) ||
      treatment.estado?.toLowerCase().includes(searchLower)
    );
  });

  const sortedTreatments = [...filteredTreatments].sort((a, b) => {
    if (orderBy === 'fecha') {
      if (order === 'asc') {
        return new Date(a.fecha_inicio) - new Date(b.fecha_inicio);
      } else {
        return new Date(b.fecha_inicio) - new Date(a.fecha_inicio);
      }
    } else if (orderBy === 'estado') {
      if (order === 'asc') {
        return (a.estado || '').localeCompare(b.estado || '');
      } else {
        return (b.estado || '').localeCompare(a.estado || '');
      }
    } else if (orderBy === 'dueno') {
      const aName = (a.cita?.mascota?.usuario?.nombre || '') + ' ' + (a.cita?.mascota?.usuario?.apellido || '');
      const bName = (b.cita?.mascota?.usuario?.nombre || '') + ' ' + (b.cita?.mascota?.usuario?.apellido || '');
      if (order === 'asc') {
        return aName.localeCompare(bName);
      } else {
        return bName.localeCompare(aName);
      }
    } else if (orderBy === 'veterinario') {
      const aVet = (a.cita?.veterinario?.nombre || '') + ' ' + (a.cita?.veterinario?.apellido || '');
      const bVet = (b.cita?.veterinario?.nombre || '') + ' ' + (b.cita?.veterinario?.apellido || '');
      if (order === 'asc') {
        return aVet.localeCompare(bVet);
      } else {
        return bVet.localeCompare(aVet);
      }
    }
    return 0;
  });

  // Función para refrescar la lista de tratamientos
  const refreshTreatments = async () => {
    try {
      const response = await fetch('/api/treatments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const treatmentsArray = Array.isArray(data) ? data : (data.data || []);
        setTreatments(treatmentsArray);
      } else {
        throw new Error('Error al obtener los tratamientos');
      }
    } catch (e) { /* opcional: manejar error */ }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#111' }}>
          Gestión de Tratamientos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Tratamiento
        </Button>
      </Box>

      <Box sx={{ mb: 2, width: '100%' }}>
        <input
          className="client-search-bar"
          placeholder="Buscar por nombre, mascota o veterinario..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#222', width: '100%' }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ 
        borderRadius: '12px',
        boxShadow: '0 1px 6px rgba(60,60,60,0.07)',
        width: '100%'
      }}>
        <Table className="client-table">
          <TableHead>
            <TableRow>
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
                  active={orderBy === 'nombre'}
                  direction={orderBy === 'nombre' ? order : 'asc'}
                  onClick={() => handleRequestSort('nombre')}
                >
                  Nombre
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
                  active={orderBy === 'fecha'}
                  direction={orderBy === 'fecha' ? order : 'asc'}
                  onClick={() => handleRequestSort('fecha')}
                >
                  Fecha Inicio
                </TableSortLabel>
              </TableCell>
              <TableCell>Fecha Fin</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'precio'}
                  direction={orderBy === 'precio' ? order : 'asc'}
                  onClick={() => handleRequestSort('precio')}
                >
                  Precio
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
            {sortedTreatments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length > 0 ? (
              sortedTreatments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((treatment) => (
                <TableRow key={treatment.id_tratamiento}>
                  <TableCell>{treatment.cita?.mascota?.nombre}</TableCell>
                  <TableCell>
                    {treatment.cita?.mascota?.usuario?.nombre} {treatment.cita?.mascota?.usuario?.apellido}
                  </TableCell>
                  <TableCell>{treatment.nombre}</TableCell>
                  <TableCell>
                    {treatment.cita?.veterinario?.nombre} {treatment.cita?.veterinario?.apellido}
                  </TableCell>
                  <TableCell>{formatDate(treatment.fecha_inicio)}</TableCell>
                  <TableCell>{treatment.fecha_fin ? formatDate(treatment.fecha_fin) : '-'}</TableCell>
                  <TableCell>
                    {typeof treatment.precio === 'number' || !isNaN(Number(treatment.precio))
                      ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(treatment.precio))
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={treatment.estado}
                      color={getStatusColor(treatment.estado)}
                      size="small"
                      sx={{ minWidth: 110, maxWidth: 110, justifyContent: 'center', fontWeight: 600, color: 'white', textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Cambiar estado">
                        <IconButton size="small" onClick={() => setChangingStateId(changingStateId === treatment.id_tratamiento ? null : treatment.id_tratamiento)}>
                          <SwapHorizIcon />
                        </IconButton>
                      </Tooltip>
                      {changingStateId === treatment.id_tratamiento && (
                        <>
                          <Tooltip title="Marcar como completado">
                            <IconButton size="small" onClick={() => handleChangeState(treatment, 'completado')} color="success">
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Marcar como cancelado">
                            <IconButton size="small" onClick={() => handleChangeState(treatment, 'cancelado')} color="error">
                              <CloseIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title="Ver detalles">
                        <IconButton size="small" onClick={() => { setDetailsTreatment(treatment); setOpenDetailsDialog(true); }}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenDialog(treatment)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" onClick={() => handleOpenDeleteDialog(treatment)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No hay tratamientos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sortedTreatments.length}
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

      {/* Modal para crear/editar tratamiento */}
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
          {selectedTreatment ? 'Editar Tratamiento' : 'Nuevo Tratamiento'}
        </DialogTitle>
        <DialogContent className="client-modal-content">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Cita"
              fullWidth
              value={formData.id_cita}
              onChange={e => setFormData({ ...formData, id_cita: e.target.value })}
              required
            >
              {appointments.map((cita) => (
                <MenuItem key={cita.id_cita} value={cita.id_cita}>
                  {(cita.mascota?.nombre || pets.find(p => p.id_mascota === cita.id_mascota)?.nombre || 'Mascota')}
                  {cita.motivo_consulta ? ` - ${cita.motivo_consulta}` : ''}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Nombre Tratamiento"
              fullWidth
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
            <TextField
              label="Precio"
              type="number"
              fullWidth
              value={formData.precio}
              onChange={e => setFormData({ ...formData, precio: e.target.value })}
              required
            />
            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={3}
              value={formData.descripcion}
              onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
              required
            />
            <TextField
              label="Fecha de Inicio"
              type="date"
              value={formData.fecha_inicio}
              onChange={e => setFormData({ ...formData, fecha_inicio: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputRef={dateInicioRef}
              inputProps={{
                min: new Date().toISOString().split('T')[0],
                onFocus: (e) => { if (e.target.showPicker) e.target.showPicker(); },
                onClick: (e) => { if (e.target.showPicker) e.target.showPicker(); }
              }}
              required
            />
            <TextField
              label="Fecha de Fin"
              type="date"
              value={formData.fecha_fin}
              onChange={e => setFormData({ ...formData, fecha_fin: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputRef={dateFinRef}
              inputProps={{
                min: formData.fecha_inicio || new Date().toISOString().split('T')[0],
                onFocus: (e) => { if (e.target.showPicker) e.target.showPicker(); },
                onClick: (e) => { if (e.target.showPicker) e.target.showPicker(); }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions className="client-modal-actions">
          <Button onClick={handleCloseDialog} className="client-create-btn" style={{ background: '#f5f5f5', color: '#1769aa' }}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="client-create-btn" variant="contained">
            {selectedTreatment ? 'Actualizar' : 'Crear'}
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
          <Typography sx={{ mb: 2 }}>¿Estás seguro de que deseas eliminar el tratamiento "{selectedTreatment?.nombre}"?</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
          <Button onClick={handleCloseDeleteDialog} sx={{ bgcolor: '#f5f5f5', color: '#1769aa', borderRadius: 2 }}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained" sx={{ borderRadius: 2 }}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de detalles de tratamiento */}
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
            <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ letterSpacing: 1 }}>Tratamiento</Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontStyle: 'italic' }}>{detailsTreatment?.cita?.mascota?.nombre}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent className="client-modal-content" sx={{ pt: 0 }}>
          {detailsTreatment && (
            <Box sx={{
              display: 'flex', flexDirection: 'column', gap: 2, mt: 1,
              bgcolor: 'rgba(255,255,255,0.85)', borderRadius: 2, p: 2, boxShadow: '0 2px 8px rgba(33,150,243,0.04)'
            }}>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Nombre</Typography>
                <Typography fontWeight={500}>{detailsTreatment.nombre}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Veterinario</Typography>
                <Typography fontWeight={500}>{detailsTreatment.cita?.veterinario?.nombre} {detailsTreatment.cita?.veterinario?.apellido}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Fecha de Inicio</Typography>
                <Typography fontWeight={500}>{detailsTreatment.fecha_inicio ? new Date(detailsTreatment.fecha_inicio).toLocaleDateString() : '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Fecha de Fin</Typography>
                <Typography fontWeight={500}>{detailsTreatment.fecha_fin ? new Date(detailsTreatment.fecha_fin).toLocaleDateString() : '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Precio</Typography>
                <Typography fontWeight={500}>{typeof detailsTreatment.precio === 'number' || !isNaN(Number(detailsTreatment.precio)) ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(detailsTreatment.precio)) : '-'}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">Descripción</Typography>
                <Typography sx={{ minHeight: 40, fontStyle: detailsTreatment.descripcion ? 'normal' : 'italic', color: detailsTreatment.descripcion ? 'text.primary' : 'text.secondary', fontWeight: 400, fontSize: 15, textAlign: 'right' }}>{detailsTreatment.descripcion || 'Sin descripción'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Estado</Typography>
                <Typography fontWeight={500}>{detailsTreatment.estado}</Typography>
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

export default AdminTreatments; 