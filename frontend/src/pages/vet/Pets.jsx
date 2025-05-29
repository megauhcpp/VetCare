import React, { useState, useEffect, useRef } from 'react';
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
  Paper
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { especies, categoriasEspecies } from '../../data/petSpecies';
import '../client/client-table.css';

const Pets = () => {
  const { pets, setPets } = useApp();
  const { user } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    especie: '',
    raza: '',
    fecha_nacimiento: '',
    sexo: '',
    notas: '',
    id_usuario: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('nombre');
  const dateInputRef = useRef(null);

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

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPet(null);
  };

  // Función para refrescar la lista de mascotas
  const refreshPets = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('/api/mascotas', {
        headers: {
          'Authorization': `Bearer ${token}`,
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

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const url = selectedPet 
        ? `/api/mascotas/${selectedPet.id_mascota}`
        : '/api/mascotas';
      
      const method = selectedPet ? 'PUT' : 'POST';
      
      const petData = { ...formData };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(petData),
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
      console.error('Error al guardar mascota:', error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  const handleDelete = async (petId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`/api/mascotas/${petId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
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
      <Box sx={{ mb: 2 }}>
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
            {sortedPets.length > 0 ? (
              sortedPets.map((pet) => (
                <TableRow key={pet.id_mascota}>
                  <TableCell>{pet.nombre}</TableCell>
                  <TableCell>{pet.especie}</TableCell>
                  <TableCell>{pet.raza}</TableCell>
                  <TableCell>{new Date(pet.fecha_nacimiento).toLocaleDateString()}</TableCell>
                  <TableCell>{pet.sexo}</TableCell>
                  <TableCell>{pet.usuario?.nombre} {pet.usuario?.apellido}</TableCell>
                  <TableCell>
                    {pet.notas ? (
                      <Tooltip title={pet.notas}>
                        <Typography noWrap sx={{ maxWidth: 200 }}>{pet.notas}</Typography>
                      </Tooltip>
                    ) : (
                      <Typography color="text.secondary">Sin notas</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(pet)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(pet.id_mascota)}>
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
              label="Fecha de Nacimiento"
              type="date"
              value={formData.fecha_nacimiento}
              onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
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
              name="id_usuario"
              fullWidth
              value={formData.id_usuario}
              onChange={e => setFormData(prev => ({ ...prev, id_usuario: e.target.value }))}
              required
              sx={{ mb: 2 }}
              InputProps={{ sx: { borderRadius: 2 } }}
            >
              {clientes.length === 0 ? (
                <MenuItem disabled value="">
                  No hay clientes disponibles
                </MenuItem>
              ) : (
                clientes.map((cliente) => (
                  <MenuItem key={cliente.id_usuario} value={cliente.id_usuario}>
                    {cliente.nombre} {cliente.apellido} ({cliente.email})
                  </MenuItem>
                ))
              )}
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
    </Box>
  );
};

export default Pets; 