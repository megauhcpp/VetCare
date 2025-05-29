import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Chip,
  InputAdornment,
  TableSortLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { especies, categoriasEspecies, sexos } from '../../data/petSpecies';
import '../client/client-table.css';

const AdminPets = () => {
  const { pets, setPets, users } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('nombre');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    especie: '',
    raza: '',
    fecha_nacimiento: '',
    sexo: '',
    id_usuario: '',
    notas: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [clientes, setClientes] = useState([]);
  const dateInputRef = useRef(null);

  // Extraer las mascotas del objeto de respuesta
  const petsData = useMemo(() => {
    console.log('Raw pets:', pets);
    return Array.isArray(pets) ? pets : (pets?.data || []);
  }, [pets]);

  useEffect(() => {
    // Fetch clientes (usuarios con rol cliente)
    const fetchClientes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/clientes', {
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

  if (!Array.isArray(pets)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const handleOpenDialog = (pet = null) => {
    if (pet) {
      setSelectedPet(pet);
      setFormData({
        nombre: pet.nombre,
        especie: pet.especie,
        raza: pet.raza,
        fecha_nacimiento: pet.fecha_nacimiento.split('T')[0],
        sexo: pet.sexo?.toLowerCase() || '',
        id_usuario: pet.usuario?.id_usuario || pet.id_usuario || '',
        notas: pet.notas || ''
      });
    } else {
      setSelectedPet(null);
      setFormData({
        nombre: '',
        especie: '',
        raza: '',
        fecha_nacimiento: '',
        sexo: '',
        id_usuario: '',
        notas: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPet(null);
  };

  const handleOpenDeleteDialog = (pet) => {
    setSelectedPet(pet);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedPet(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEspecieChange = (e) => {
    const nuevaEspecie = e.target.value;
    setFormData({
      ...formData,
      especie: nuevaEspecie,
      raza: '' // Resetear la raza cuando cambia la especie
    });
  };

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
        ? `/api/admin/pets/${selectedPet.id_mascota}`
        : '/api/admin/pets';
      
      const method = selectedPet ? 'PUT' : 'POST';
      
      // Cambiar id_usuario a usuario_id para el backend y capitalizar sexo
      const dataToSend = {
        ...formData,
        usuario_id: formData.id_usuario,
        sexo: formData.sexo.charAt(0).toUpperCase() + formData.sexo.slice(1)
      };
      delete dataToSend.id_usuario;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (!response.ok) {
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

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/pets/${selectedPet.id_mascota}`, {
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
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error al eliminar mascota:', error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  const filteredPets = petsData.filter(pet => {
    const searchLower = searchTerm.toLowerCase();
    return (
      pet.nombre?.toLowerCase().includes(searchLower) ||
      pet.especie?.toLowerCase().includes(searchLower) ||
      pet.raza?.toLowerCase().includes(searchLower) ||
      pet.usuario?.nombre?.toLowerCase().includes(searchLower) ||
      pet.usuario?.apellido?.toLowerCase().includes(searchLower)
    );
  });

  const sortedPets = [...filteredPets].sort((a, b) => {
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

  // Función para refrescar la lista de mascotas
  const refreshPets = async () => {
    try {
      const response = await fetch('/api/pets', {
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

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
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

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <input
          className="client-search-bar"
          placeholder="Buscar por nombre, especie, raza o dueño..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </Box>

      <TableContainer component={Paper}>
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
              <TableCell>Especie</TableCell>
              <TableCell>Raza</TableCell>
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
                  active={orderBy === 'fecha_nacimiento'}
                  direction={orderBy === 'fecha_nacimiento' ? order : 'asc'}
                  onClick={() => handleRequestSort('fecha_nacimiento')}
                >
                  Fecha de Nacimiento
                </TableSortLabel>
              </TableCell>
              <TableCell>Sexo</TableCell>
              <TableCell>Notas</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedPets.length > 0 ? (
              sortedPets.map((pet) => (
                <TableRow key={pet.id_mascota}>
                  <TableCell>{pet.nombre}</TableCell>
                  <TableCell>{pet.especie}</TableCell>
                  <TableCell>{pet.raza}</TableCell>
                  <TableCell>
                    {pet.usuario?.nombre} {pet.usuario?.apellido}
                  </TableCell>
                  <TableCell>
                    {new Date(pet.fecha_nacimiento).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={pet.sexo ? pet.sexo.charAt(0).toUpperCase() + pet.sexo.slice(1) : ''}
                      color={pet.sexo === 'macho' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {pet.notas ? (
                      <Tooltip title={pet.notas}>
                        <Typography noWrap sx={{ maxWidth: 200 }}>
                          {pet.notas}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography color="text.secondary">Sin notas</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenDialog(pet)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" onClick={() => handleOpenDeleteDialog(pet)}>
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
                  No hay mascotas registradas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para crear/editar mascota */}
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
              name="nombre"
              label="Nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              fullWidth
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <FormControl fullWidth>
              <InputLabel>Especie</InputLabel>
              <Select
                name="especie"
                value={formData.especie}
                onChange={handleEspecieChange}
                label="Especie"
              >
                {Object.entries(categoriasEspecies).map(([categoria, especiesList]) => [
                  <MenuItem key={categoria} disabled sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                    {categoria}
                  </MenuItem>,
                  ...especiesList.map(especie => (
                    <MenuItem key={especie} value={especie} sx={{ pl: 4 }}>
                      {especie.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </MenuItem>
                  ))
                ])}
              </Select>
            </FormControl>
            <TextField
              select
              label="Raza"
              fullWidth
              value={formData.raza}
              onChange={(e) => setFormData({ ...formData, raza: e.target.value })}
              required
              disabled={!formData.especie}
            >
              {formData.especie && especies[formData.especie]?.length > 0 ? (
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
            <FormControl fullWidth>
              <InputLabel>Dueño</InputLabel>
              <Select
                name="id_usuario"
                value={formData.id_usuario}
                onChange={handleInputChange}
                label="Dueño"
              >
                {clientes.length > 0 ? (
                  clientes.map((cliente) => (
                    <MenuItem key={cliente.id_usuario} value={cliente.id_usuario}>
                      {cliente.nombre} {cliente.apellido} ({cliente.email})
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">
                    Sin clientes disponibles
                  </MenuItem>
                )}
              </Select>
            </FormControl>
            <TextField
              name="fecha_nacimiento"
              label="Fecha de Nacimiento"
              type="date"
              value={formData.fecha_nacimiento}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputRef={dateInputRef}
              inputProps={{
                max: new Date().toISOString().split('T')[0],
                onFocus: (e) => { if (e.target.showPicker) e.target.showPicker(); },
                onClick: (e) => { if (e.target.showPicker) e.target.showPicker(); }
              }}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Sexo</InputLabel>
              <Select
                name="sexo"
                value={formData.sexo}
                onChange={handleInputChange}
                label="Sexo"
              >
                {sexos.map((sexo) => (
                  <MenuItem key={sexo} value={sexo}>
                    {sexo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="notas"
              label="Notas"
              value={formData.notas}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
            />
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

      {/* Modal de confirmación para eliminar */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar la mascota {selectedPet?.nombre}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
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

export default AdminPets; 