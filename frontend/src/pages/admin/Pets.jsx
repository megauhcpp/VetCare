import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
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
  TablePagination,
  IconButton
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import PetsIcon from '@mui/icons-material/Pets';
import { useApp } from '../../context/AppContext';
import { especies, categoriasEspecies } from '../../data/petSpecies';
import '../client/client-table.css';

/**
 * Página de gestión de mascotas para el administrador
 * Permite ver, crear, editar y eliminar mascotas del sistema
 */
const AdminPets = () => {
  const { pets, setPets, users } = useApp();
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estados para la ordenación de la tabla
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('nombre');
  // Estado para controlar la apertura del diálogo de creación/edición
  const [openDialog, setOpenDialog] = useState(false);
  // Estado para almacenar la mascota seleccionada
  const [selectedPet, setSelectedPet] = useState(null);
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    especie: '',
    raza: '',
    fecha_nacimiento: '',
    sexo: '',
    notas: '',
    id_usuario: ''
  });
  // Estado para las notificaciones
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  // Estado para la lista de clientes
  const [clientes, setClientes] = useState([]);
  // Referencia para el input de fecha
  const dateInputRef = useRef(null);
  // Estado para el diálogo de detalles
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [detailsPet, setDetailsPet] = useState(null);
  // Estados para la paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  // Estado para el diálogo de eliminación
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);

  // Cargar la lista de clientes al montar el componente
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://vetcareclinica.com/api/clientes', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setClientes(data.data || data || []);
        }
      } catch (error) {
        console.error('Error fetching clientes:', error);
      }
    };
    fetchClientes();
  }, []);

  // Mostrar un indicador de carga mientras se obtienen los datos
  if (!Array.isArray(pets)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  /**
   * Abre el diálogo de creación/edición de mascota
   * @param {Object} pet - Mascota a editar (opcional)
   */
  const handleOpenDialog = (pet = null) => {
    if (pet) {
      setSelectedPet(pet);
      setFormData({
        nombre: pet.nombre,
        especie: pet.especie,
        raza: pet.raza,
        fecha_nacimiento: pet.fecha_nacimiento ? pet.fecha_nacimiento.split('T')[0] : '',
        sexo: pet.sexo?.toLowerCase() || '',
        notas: pet.notas || '',
        id_usuario: pet.usuario?.id_usuario || ''
      });
    } else {
      setSelectedPet(null);
      setFormData({
        nombre: '',
        especie: '',
        raza: '',
        fecha_nacimiento: '',
        sexo: '',
        notas: '',
        id_usuario: ''
      });
    }
    setOpenDialog(true);
  };

  /**
   * Cierra el diálogo de creación/edición
   */
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPet(null);
  };

  /**
   * Actualiza la lista de mascotas desde el servidor
   */
  const refreshPets = async () => {
    try {
      const response = await fetch('https://vetcareclinica.com/api/pets', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const petsArray = Array.isArray(data) ? data : (data.data || []);
        setPets(petsArray);
      } else {
        throw new Error('Error al obtener las mascotas');
      }
    } catch (error) {
      console.error('Error al refrescar mascotas:', error);
      setSnackbar({
        open: true,
        message: 'Error al actualizar la lista de mascotas',
        severity: 'error'
      });
    }
  };

  /**
   * Maneja el envío del formulario para crear/actualizar una mascota
   */
  const handleSubmit = async () => {
    try {
      if (!formData.id_usuario) {
        setSnackbar({
          open: true,
          message: 'Debes seleccionar un dueño para la mascota',
          severity: 'error'
        });
        return;
      }

      const url = selectedPet
        ? `https://vetcareclinica.com/api/mascotas/${selectedPet.id_mascota}`
        : 'https://vetcareclinica.com/api/mascotas';

      const method = selectedPet ? 'PUT' : 'POST';

      // Validar que id_usuario sea un número válido
      const idUsuario = parseInt(formData.id_usuario);
      if (isNaN(idUsuario)) {
        setSnackbar({
          open: true,
          message: 'El ID del dueño no es válido',
          severity: 'error'
        });
        return;
      }

      // Preparar los datos para enviar
      const dataToSend = {
        nombre: formData.nombre,
        especie: formData.especie,
        raza: formData.raza,
        fecha_nacimiento: formData.fecha_nacimiento,
        sexo: formData.sexo.charAt(0).toUpperCase() + formData.sexo.slice(1),
        notas: formData.notas || '',
        id_usuario: idUsuario
      };

      console.log('Enviando datos:', dataToSend);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error response:', data);
        throw new Error(data.message || 'Error al guardar la mascota');
      }

      setSnackbar({
        open: true,
        message: `Mascota ${selectedPet ? 'actualizada' : 'creada'} exitosamente`,
        severity: 'success'
      });

      await refreshPets();
      handleCloseDialog();
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  /**
   * Maneja la eliminación de una mascota
   * @param {number} petId - ID de la mascota a eliminar
   */
  const handleDelete = async (petId) => {
    try {
      const response = await fetch(`https://vetcareclinica.com/api/pets/${petId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar la mascota');
      }
      setSnackbar({
        open: true,
        message: 'Mascota eliminada exitosamente',
        severity: 'success'
      });
      await refreshPets();
    } catch (error) {
      console.error('Error al eliminar mascota:', error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedPets = [...pets.filter(pet => {
    const searchLower = searchTerm.toLowerCase();
    return (
      pet.nombre?.toLowerCase().includes(searchLower) ||
      pet.especie?.toLowerCase().includes(searchLower) ||
      pet.raza?.toLowerCase().includes(searchLower) ||
      pet.usuario?.nombre?.toLowerCase().includes(searchLower) ||
      pet.usuario?.apellido?.toLowerCase().includes(searchLower)
    );
  })].sort((a, b) => {
    if (orderBy === 'nombre') {
      if (order === 'asc') {
        return (a.nombre || '').localeCompare(b.nombre || '');
      } else {
        return (b.nombre || '').localeCompare(a.nombre || '');
      }
    } else if (orderBy === 'fecha_nacimiento') {
      if (order === 'asc') {
        return new Date(a.fecha_nacimiento) - new Date(b.fecha_nacimiento);
      } else {
        return new Date(b.fecha_nacimiento) - new Date(a.fecha_nacimiento);
      }
    } else if (orderBy === 'dueno') {
      const aName = (a.usuario?.nombre || '') + ' ' + (a.usuario?.apellido || '');
      const bName = (b.usuario?.nombre || '') + ' ' + (b.usuario?.apellido || '');
      if (order === 'asc') {
        return aName.localeCompare(bName);
      } else {
        return bName.localeCompare(aName);
      }
    }
    return 0;
  });

  const handleOpenDeleteDialog = (petId) => {
    setPetToDelete(petId);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setPetToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!petToDelete) return;
    await handleDelete(petToDelete);
    setOpenDeleteDialog(false);
    setPetToDelete(null);
  };

  return (
    <Box sx={{ p: 3 }} className="MuiBox-root css-19kzrtu">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#111' }}>
          Gestión de Mascotas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Mascota
        </Button>
      </Box>

      <Box sx={{ mb: 2, width: '100%' }}>
        <input
          className="client-search-bar"
          placeholder="Buscar por nombre, especie, raza o dueño..."
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
                  active={orderBy === 'nombre'}
                  direction={orderBy === 'nombre' ? order : 'asc'}
                  onClick={() => handleRequestSort('nombre')}
                >
                  Nombre
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'especie'}
                  direction={orderBy === 'especie' ? order : 'asc'}
                  onClick={() => handleRequestSort('especie')}
                >
                  Especie
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'raza'}
                  direction={orderBy === 'raza' ? order : 'asc'}
                  onClick={() => handleRequestSort('raza')}
                >
                  Raza
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'fecha_nacimiento'}
                  direction={orderBy === 'fecha_nacimiento' ? order : 'asc'}
                  onClick={() => handleRequestSort('fecha_nacimiento')}
                >
                  Fecha de Nacimiento
                </TableSortLabel>
              </TableCell>
              <TableCell>Sexo</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'dueno'}
                  direction={orderBy === 'dueno' ? order : 'asc'}
                  onClick={() => handleRequestSort('dueno')}
                >
                  Dueño
                </TableSortLabel>
              </TableCell>
              <TableCell>Notas</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedPets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length > 0 ? (
              sortedPets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((pet) => (
                <TableRow key={pet.id_mascota}>
                  <TableCell>{pet.nombre}</TableCell>
                  <TableCell>{pet.especie}</TableCell>
                  <TableCell>{pet.raza}</TableCell>
                  <TableCell>{new Date(pet.fecha_nacimiento).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {pet.sexo ? (
                      <Chip
                        label={pet.sexo.charAt(0).toUpperCase() + pet.sexo.slice(1)}
                        color={pet.sexo.toLowerCase() === 'macho' ? 'primary' : pet.sexo.toLowerCase() === 'hembra' ? 'secondary' : 'default'}
                        size="small"
                        sx={{ minWidth: 90, maxWidth: 90, justifyContent: 'center' }}
                      />
                    ) : ''}
                  </TableCell>
                  <TableCell>{pet.usuario?.nombre} {pet.usuario?.apellido}</TableCell>
                  <TableCell>
                    {pet.notas ? (
                      <Tooltip title={pet.notas}>
                        <Typography noWrap sx={{ maxWidth: 200, fontSize: 'inherit' }}>{pet.notas}</Typography>
                      </Tooltip>
                    ) : (
                      <Typography color="text.secondary">Sin notas</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Ver detalles">
                      <IconButton size="small" onClick={() => { setDetailsPet(pet); setOpenDetailsDialog(true); }}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <IconButton onClick={() => handleOpenDialog(pet)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleOpenDeleteDialog(pet.id_mascota)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No hay mascotas registradas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sortedPets.length}
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
          {selectedPet ? 'Editar Mascota' : 'Nueva Mascota'}
        </DialogTitle>
        <DialogContent className="client-modal-content">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nombre"
              fullWidth
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <TextField
              select
              label="Especie"
              fullWidth
              value={formData.especie}
              onChange={(e) => setFormData({ ...formData, especie: e.target.value, raza: '' })}
              required
              InputProps={{ sx: { borderRadius: 2 } }}
            >
              {Object.entries(categoriasEspecies).flatMap(([categoria, especiesList]) => [
                <MenuItem key={`cat-${categoria}`} disabled sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                  {categoria}
                </MenuItem>,
                ...especiesList.map(especie => (
                  <MenuItem key={especie} value={especie} sx={{ pl: 4 }}>
                    {especie.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </MenuItem>
                ))
              ])}
            </TextField>
            <TextField
              select
              label="Raza"
              fullWidth
              value={formData.raza}
              onChange={(e) => setFormData({ ...formData, raza: e.target.value })}
              required
              disabled={!formData.especie}
              InputProps={{ sx: { borderRadius: 2 } }}
            >
              {formData.especie ? (
                especies[formData.especie]?.map((raza) => (
                  <MenuItem key={raza} value={raza}>
                    {raza}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">
                  Seleccione una especie primero
                </MenuItem>
              )}
            </TextField>
            <TextField
              name="fecha_nacimiento"
              label="Fecha de Nacimiento"
              type="date"
              value={formData.fecha_nacimiento}
              onChange={e => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputRef={dateInputRef}
              inputProps={{
                max: new Date().toISOString().split('T')[0],
                onFocus: (e) => { if (e.target.showPicker) e.target.showPicker(); },
                onClick: (e) => { if (e.target.showPicker) e.target.showPicker(); }
              }}
              required
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <TextField
              select
              label="Sexo"
              fullWidth
              value={formData.sexo}
              onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
              required
              InputProps={{ sx: { borderRadius: 2 } }}
            >
              <MenuItem value="macho">Macho</MenuItem>
              <MenuItem value="hembra">Hembra</MenuItem>
            </TextField>
            <TextField
              label="Notas"
              fullWidth
              multiline
              rows={3}
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <TextField
              select
              label="Dueño"
              value={formData.id_usuario || ''}
              onChange={(e) => {
                console.log('Dueño seleccionado:', e.target.value);
                setFormData({ ...formData, id_usuario: e.target.value });
              }}
              required
              fullWidth
              sx={{ mb: 2 }}
            >
              {clientes.map((cliente) => (
                <MenuItem key={cliente.id_usuario} value={cliente.id_usuario}>
                  {`${cliente.nombre} ${cliente.apellido} (${cliente.email})`}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions className="client-modal-actions">
          <Button onClick={handleCloseDialog} className="client-create-btn" style={{ background: '#f5f5f5', color: '#1769aa' }}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="client-create-btn" variant="contained">
            {selectedPet ? 'Actualizar' : 'Crear'}
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

      {/* Modal de detalles de mascota */}
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
            {detailsPet?.nombre ? detailsPet.nombre.charAt(0).toUpperCase() : <PetsIcon sx={{ fontSize: 32 }} />}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ letterSpacing: 1 }}>{detailsPet?.nombre}</Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontStyle: 'italic' }}>{detailsPet?.especie}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent className="client-modal-content" sx={{ pt: 0 }}>
          {detailsPet && (
            <Box sx={{
              display: 'flex', flexDirection: 'column', gap: 2, mt: 1,
              bgcolor: 'rgba(255,255,255,0.85)', borderRadius: 2, p: 2, boxShadow: '0 2px 8px rgba(33,150,243,0.04)'
            }}>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Raza</Typography>
                <Typography fontWeight={500}>{detailsPet.raza}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Fecha de Nacimiento</Typography>
                <Typography fontWeight={500}>{new Date(detailsPet.fecha_nacimiento).toLocaleDateString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Sexo</Typography>
                <Typography fontWeight={500}>{detailsPet.sexo ? detailsPet.sexo.charAt(0).toUpperCase() + detailsPet.sexo.slice(1) : ''}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">Notas</Typography>
                <Typography sx={{ minHeight: 40, fontStyle: detailsPet.notas ? 'normal' : 'italic', color: detailsPet.notas ? 'text.primary' : 'text.secondary', fontWeight: 400, fontSize: 15, textAlign: 'right' }}>{detailsPet.notas || 'Sin notas'}</Typography>
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
          <Typography sx={{ mb: 2 }}>¿Estás seguro de que deseas eliminar esta mascota?</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
          <Button onClick={handleCloseDeleteDialog} sx={{ bgcolor: '#f5f5f5', color: '#1769aa', borderRadius: 2 }}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" sx={{ borderRadius: 2 }}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPets; 