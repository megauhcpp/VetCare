import React, { useState, useRef } from 'react';
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
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  Tooltip,
  Paper,
  Avatar,
  TablePagination
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Check as CheckIcon, Close as CloseIcon, SwapHoriz as SwapHorizIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import PetsIcon from '@mui/icons-material/Pets';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import '../client/client-table.css';

/**
 * Página de gestión de tratamientos para veterinarios
 * Permite ver, crear, editar y gestionar el estado de los tratamientos asignados al veterinario
 */
const Treatments = () => {
  const { treatments, pets, setTreatments, appointments } = useApp();
  const { user } = useAuth();
  // Estado para controlar la apertura del diálogo de creación/edición
  const [openDialog, setOpenDialog] = useState(false);
  // Estado para almacenar el tratamiento seleccionado para edición
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  // Estado para almacenar los datos del formulario
  const [formData, setFormData] = useState({
    id_cita: '',
    nombre: '',
    precio: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'activo'
  });
  // Estado para almacenar una cita extra si no se encuentra en la lista de citas
  const [extraCita, setExtraCita] = useState(null);
  // Estado para controlar las notificaciones
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  // Estado para controlar el cambio de estado de un tratamiento
  const [changingStateId, setChangingStateId] = useState(null);
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para el ordenamiento de la tabla
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('fecha');
  // Referencias para los inputs de fecha
  const dateInicioRef = useRef(null);
  const dateFinRef = useRef(null);
  // Estado para controlar el diálogo de detalles
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [detailsTreatment, setDetailsTreatment] = useState(null);
  // Estado para la paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  // Estado para controlar el diálogo de eliminación
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [treatmentToDelete, setTreatmentToDelete] = useState(null);

  // Mostrar un indicador de carga mientras se obtienen los datos
  if (!Array.isArray(treatments) || !Array.isArray(pets)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  /**
   * Abre el diálogo para crear o editar un tratamiento
   * @param {Object} treatment - El tratamiento a editar (opcional)
   */
  const handleOpenDialog = (treatment = null) => {
    if (treatment) {
      let cita = appointments.find(c => String(c.id_cita) === String(treatment.id_cita));
      // Si no está, crea una opción temporal
      if (!cita && treatment.cita) {
        cita = {
          id_cita: String(treatment.cita.id_cita),
          mascota: treatment.cita.mascota,
          motivo_consulta: treatment.cita.motivo_consulta
        };
        setExtraCita(cita);
      } else {
        setExtraCita(null);
      }
      setSelectedTreatment(treatment);
      setFormData({
        id_cita: cita ? String(cita.id_cita) : '',
        nombre: treatment.nombre || '',
        precio: treatment.precio || '',
        descripcion: treatment.descripcion,
        fecha_inicio: treatment.fecha_inicio.split('T')[0],
        fecha_fin: treatment.fecha_fin ? treatment.fecha_fin.split('T')[0] : '',
        estado: treatment.estado
      });
    } else {
      setSelectedTreatment(null);
      setFormData({
        id_cita: '',
        nombre: '',
        precio: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        estado: 'activo'
      });
      setExtraCita(null);
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
   * Maneja el envío del formulario para crear o actualizar un tratamiento
   */
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      const url = selectedTreatment 
        ? `/api/tratamientos/${selectedTreatment.id_tratamiento}`
        : '/api/tratamientos';
      
      const method = selectedTreatment ? 'PUT' : 'POST';
      
      const treatmentData = {
        ...formData,
        id_veterinario: user.id_usuario,
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
        const updatedTreatment = await response.json();
        if (selectedTreatment) {
          setTreatments(treatments.map(t => t.id_tratamiento === updatedTreatment.id_tratamiento ? updatedTreatment : t));
        } else {
          setTreatments([...treatments, updatedTreatment]);
        }
        handleCloseDialog();
        setSnackbar({ open: true, message: 'Tratamiento guardado correctamente', severity: 'success' });
      } else {
        const errorData = await response.json();
        console.error('Error al guardar el tratamiento:', errorData);
        setSnackbar({ open: true, message: 'Error al guardar el tratamiento', severity: 'error' });
      }
    } catch (error) {
      console.error('Error saving treatment:', error);
      setSnackbar({ open: true, message: 'Error al guardar el tratamiento', severity: 'error' });
    }
  };

  /**
   * Maneja la eliminación de un tratamiento
   * @param {number} treatmentId - ID del tratamiento a eliminar
   */
  const handleDelete = async (treatmentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      const response = await fetch(`/api/tratamientos/${treatmentId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setTreatments(treatments.filter(t => t.id_tratamiento !== treatmentId));
        setSnackbar({ open: true, message: 'Tratamiento eliminado correctamente', severity: 'success' });
      } else {
        console.error('Error al eliminar el tratamiento:', await response.text());
        setSnackbar({ open: true, message: 'Error al eliminar el tratamiento', severity: 'error' });
      }
    } catch (error) {
      console.error('Error deleting treatment:', error);
      setSnackbar({ open: true, message: 'Error al eliminar el tratamiento', severity: 'error' });
    }
  };

  /**
   * Maneja el cambio de estado de un tratamiento
   * @param {Object} treatment - El tratamiento a actualizar
   * @param {string} newState - El nuevo estado del tratamiento
   */
  const handleChangeState = async (treatment, newState) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({ open: true, message: 'No hay token de autenticación', severity: 'error' });
        return;
      }

      const url = `/api/tratamientos/${treatment.id_tratamiento}/estado`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: newState })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el estado del tratamiento');
      }

      const updatedTreatment = await response.json();
      setTreatments(treatments.map(t => t.id_tratamiento === updatedTreatment.data.id_tratamiento ? updatedTreatment.data : t));
      setSnackbar({
        open: true,
        message: `Tratamiento marcado como ${newState}`,
        severity: 'success'
      });
      setChangingStateId(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Error al cambiar el estado',
        severity: 'error'
      });
    }
  };

  /**
   * Obtiene el color correspondiente al estado del tratamiento
   * @param {string} status - El estado del tratamiento
   * @returns {string} El color correspondiente al estado
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

  const filteredTreatments = treatments.filter(treatment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      treatment.nombre?.toLowerCase().includes(searchLower) ||
      pets.find(p => p.id_mascota === treatment.id_mascota)?.nombre?.toLowerCase().includes(searchLower) ||
      treatment.estado?.toLowerCase().includes(searchLower) ||
      (appointments.find(a => a.id_cita === treatment.id_cita)?.veterinario?.nombre || '').toLowerCase().includes(searchLower) ||
      (appointments.find(a => a.id_cita === treatment.id_cita)?.veterinario?.apellido || '').toLowerCase().includes(searchLower) ||
      (pets.find(p => p.id_mascota === treatment.id_mascota)?.usuario?.nombre || '').toLowerCase().includes(searchLower) ||
      (pets.find(p => p.id_mascota === treatment.id_mascota)?.usuario?.apellido || '').toLowerCase().includes(searchLower)
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
      const aName = (pets.find(p => p.id_mascota === a.id_mascota)?.usuario?.nombre || '') + ' ' + (pets.find(p => p.id_mascota === a.id_mascota)?.usuario?.apellido || '');
      const bName = (pets.find(p => p.id_mascota === b.id_mascota)?.usuario?.nombre || '') + ' ' + (pets.find(p => p.id_mascota === b.id_mascota)?.usuario?.apellido || '');
      if (order === 'asc') {
        return aName.localeCompare(bName);
      } else {
        return bName.localeCompare(aName);
      }
    } else if (orderBy === 'veterinario') {
      const aVet = (appointments.find(aApp => aApp.id_cita === a.id_cita)?.veterinario?.nombre || '') + ' ' + (appointments.find(aApp => aApp.id_cita === a.id_cita)?.veterinario?.apellido || '');
      const bVet = (appointments.find(bApp => bApp.id_cita === b.id_cita)?.veterinario?.nombre || '') + ' ' + (appointments.find(bApp => bApp.id_cita === b.id_cita)?.veterinario?.apellido || '');
      if (order === 'asc') {
        return aVet.localeCompare(bVet);
      } else {
        return bVet.localeCompare(aVet);
      }
    }
    return 0;
  });

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleOpenDeleteDialog = (treatmentId) => {
    setTreatmentToDelete(treatmentId);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setTreatmentToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!treatmentToDelete) return;
    await handleDelete(treatmentToDelete);
    setOpenDeleteDialog(false);
    setTreatmentToDelete(null);
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
          placeholder="Buscar por nombre, mascota o estado..."
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
                  Fecha de Inicio
                </TableSortLabel>
              </TableCell>
              <TableCell>Fecha de Fin</TableCell>
              <TableCell>Precio</TableCell>
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
                  <TableCell>{treatment.nombre}</TableCell>
                  <TableCell>{treatment.cita?.veterinario?.nombre} {treatment.cita?.veterinario?.apellido}</TableCell>
                  <TableCell>{new Date(treatment.fecha_inicio).toLocaleDateString()}</TableCell>
                  <TableCell>{treatment.fecha_fin ? new Date(treatment.fecha_fin).toLocaleDateString() : '-'}</TableCell>
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
                      <IconButton onClick={() => setChangingStateId(changingStateId === treatment.id_tratamiento ? null : treatment.id_tratamiento)}>
                        <SwapHorizIcon />
                      </IconButton>
                      {changingStateId === treatment.id_tratamiento && (
                        <>
                          <IconButton onClick={() => handleChangeState(treatment, 'completado')} color="success">
                            <CheckIcon />
                          </IconButton>
                          <IconButton onClick={() => handleChangeState(treatment, 'cancelado')} color="error">
                            <CloseIcon />
                          </IconButton>
                        </>
                      )}
                      <Tooltip title="Ver detalles">
                        <IconButton size="small" onClick={() => { setDetailsTreatment(treatment); setOpenDetailsDialog(true); }}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <IconButton onClick={() => handleOpenDialog(treatment)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleOpenDeleteDialog(treatment.id_tratamiento)}>
                        <DeleteIcon />
                      </IconButton>
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
                <MenuItem key={cita.id_cita} value={String(cita.id_cita)}>
                  {(cita.mascota?.nombre || pets.find(p => p.id_mascota === cita.id_mascota)?.nombre || 'Mascota')}
                  {cita.motivo_consulta ? ` - ${cita.motivo_consulta}` : ''}
                </MenuItem>
              ))}
              {extraCita && (
                <MenuItem key={extraCita.id_cita} value={String(extraCita.id_cita)}>
                  {(extraCita.mascota?.nombre || 'Mascota')}
                  {extraCita.motivo_consulta ? ` - ${extraCita.motivo_consulta}` : ''}
                  {' (No disponible)'}
                </MenuItem>
              )}
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
              rows={2}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              required
            />
            <TextField
              label="Fecha de Inicio"
              type="date"
              fullWidth
              value={formData.fecha_inicio}
              onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
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
              fullWidth
              value={formData.fecha_fin}
              onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
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
          <Typography sx={{ mb: 2 }}>¿Estás seguro de que deseas eliminar este tratamiento?</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
          <Button onClick={handleCloseDeleteDialog} sx={{ bgcolor: '#f5f5f5', color: '#1769aa', borderRadius: 2 }}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" sx={{ borderRadius: 2 }}>Eliminar</Button>
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

export default Treatments; 