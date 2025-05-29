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
  Divider
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

const AdminTreatments = () => {
  const { treatments, pets, appointments, setTreatments } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('fecha');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [formData, setFormData] = useState({
    id_cita: '',
    nombre: '',
    precio: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [changingStateId, setChangingStateId] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [detailsTreatment, setDetailsTreatment] = useState(null);

  const dateInicioRef = useRef(null);
  const dateFinRef = useRef(null);

  // Extraer los tratamientos del objeto de respuesta
  const treatmentsData = useMemo(() => {
    console.log('Raw treatments:', treatments);
    return Array.isArray(treatments) ? treatments : (treatments?.data || []);
  }, [treatments]);

  if (!treatmentsData) {
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
      case 'en_progreso':
        return 'primary';
      case 'completado':
        return 'success';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTreatment(null);
  };

  const handleOpenDeleteDialog = (treatment) => {
    setSelectedTreatment(treatment);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedTreatment(null);
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

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/tratamientos/${selectedTreatment.id_tratamiento}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error al eliminar el tratamiento');

      setSnackbar({
        open: true,
        message: 'Tratamiento eliminado exitosamente',
        severity: 'success'
      });
      await refreshTreatments();
      handleCloseDeleteDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

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

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const url = `${apiUrl}/api/tratamientos/${treatment.id_tratamiento}/estado`;

      console.log('Updating treatment state:', {
        url,
        treatmentId: treatment.id_tratamiento,
        newState,
        token: token.substring(0, 10) + '...' // Solo mostramos parte del token por seguridad
      });

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ estado: newState })
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar el estado');
      }

      setSnackbar({
        open: true,
        message: `Tratamiento marcado como ${newState}`,
        severity: 'success'
      });
      setChangingStateId(null);
      
      // Actualizar la lista de tratamientos
      const updatedTreatments = treatmentsData.map(t => 
        t.id_tratamiento === treatment.id_tratamiento 
          ? { ...t, estado: newState }
          : t
      );
      setTreatments(updatedTreatments);

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
        setTreatments(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (e) { /* opcional: manejar error */ }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
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

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <input
          className="client-search-bar"
          placeholder="Buscar por tratamiento, mascota, estado, veterinario..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </Box>

      <TableContainer component={Paper}>
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
            {sortedTreatments.length > 0 ? (
              sortedTreatments.map((treatment) => (
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
                <TableCell colSpan={8} align="center">
                  No hay tratamientos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el tratamiento "{selectedTreatment?.nombre}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
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