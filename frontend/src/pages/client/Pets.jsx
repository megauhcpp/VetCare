import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  TableSortLabel,
  Tooltip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import PetsIcon from '@mui/icons-material/Pets';
import { especies, categoriasEspecies, sexos } from '../../data/petSpecies';
import './client-table.css';

const Pets = () => {
  const { pets, setPets, addPet, updatePet, deletePet } = useApp();
  const { token, user } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    especie: '',
    raza: '',
    fecha_nacimiento: '',
    sexo: '',
    notas: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('nombre');
  const dateInputRef = useRef(null);

  if (!Array.isArray(pets)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Filtrar mascotas del usuario actual
  const userPets = pets.filter(pet => pet.usuario?.id_usuario === user?.id_usuario);

  const handleOpenDialog = (pet = null) => {
    if (pet) {
      setSelectedPet(pet);
      setFormData({
        nombre: pet.nombre,
        especie: pet.especie,
        raza: pet.raza,
        fecha_nacimiento: pet.fecha_nacimiento.split('T')[0],
        sexo: pet.sexo?.toLowerCase() || '',
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
        notas: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPet(null);
  };

  const handleSubmit = async () => {
    try {
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      if (!user) {
        setError('No hay usuario autenticado');
        return;
      }

      const url = selectedPet 
        ? `http://localhost:8000/api/mascotas/${selectedPet.id_mascota}`
        : 'http://localhost:8000/api/mascotas';
      
      const method = selectedPet ? 'PUT' : 'POST';
      
      const requestData = {
        ...formData,
        id_usuario: user.id_usuario
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
        credentials: 'include'
      });

      if (response.ok) {
        const updatedPet = await response.json();
        console.log('Pet created/updated:', updatedPet); // Debug log

        if (selectedPet) {
          setPets(pets.map(p => p.id_mascota === updatedPet.id_mascota ? updatedPet : p));
        } else {
          // Fetch de la mascota completa para asegurar estructura
          const petId = updatedPet.id_mascota || updatedPet.data?.id_mascota;
          if (petId) {
            try {
              const petResponse = await fetch(`http://localhost:8000/api/mascotas/${petId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'application/json'
                }
              });
              if (petResponse.ok) {
                const fullPet = await petResponse.json();
                setPets(prevPets => {
                  const filtered = prevPets.filter(p => p.id_mascota !== fullPet.id_mascota);
                  return [...filtered, fullPet];
                });
              } else {
                // Si falla, usa el objeto provisional
                const newPet = {
                  ...updatedPet,
                  usuario: {
                    id_usuario: user.id_usuario,
                    nombre: user.nombre,
                    apellido: user.apellido
                  }
                };
                setPets(prevPets => {
                  const filtered = prevPets.filter(p => p.id_mascota !== newPet.id_mascota);
                  return [...filtered, newPet];
                });
              }
            } catch (e) {
              // Si falla el fetch, usa el objeto provisional
              const newPet = {
                ...updatedPet,
                usuario: {
                  id_usuario: user.id_usuario,
                  nombre: user.nombre,
                  apellido: user.apellido
                }
              };
              setPets(prevPets => {
                const filtered = prevPets.filter(p => p.id_mascota !== newPet.id_mascota);
                return [...filtered, newPet];
              });
            }
          }
        }

        await refreshPets();
        handleCloseDialog();
        setError('');
        setSnackbar({ open: true, message: 'Mascota guardada correctamente', severity: 'success' });
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData); // Debug log
        setError(errorData.message || 'Error al guardar la mascota');
      }
    } catch (error) {
      console.error('Error saving pet:', error);
      setError('Error al guardar la mascota');
    }
  };

  const handleDelete = async (petId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta mascota?')) {
      try {
        if (!token) {
          setError('No hay token de autenticación');
          return;
        }

        const response = await fetch(`http://localhost:8000/api/mascotas/${petId}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });

        if (response.ok) {
          setPets(pets.filter(p => p.id_mascota !== petId));
          await refreshPets();
          setError('');
          setSnackbar({ open: true, message: 'Mascota eliminada correctamente', severity: 'success' });
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Error al eliminar la mascota');
        }
      } catch (error) {
        console.error('Error deleting pet:', error);
        setError('Error al eliminar la mascota');
      }
    }
  };

  // Manejar el cambio de especie
  const handleEspecieChange = (e) => {
    const nuevaEspecie = e.target.value;
    setFormData({
      ...formData,
      especie: nuevaEspecie,
      raza: '' // Resetear la raza cuando cambia la especie
    });
  };

  // Función para refrescar la lista de mascotas
  const refreshPets = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/mascotas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Si la respuesta tiene 'data', úsala; si no, asume que es un array
        setPets(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (e) { /* opcional: manejar error */ }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedPets = [...userPets.filter(pet => {
    const searchLower = searchTerm.toLowerCase();
    return (
      pet.nombre?.toLowerCase().includes(searchLower) ||
      pet.especie?.toLowerCase().includes(searchLower) ||
      pet.raza?.toLowerCase().includes(searchLower)
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
    }
    return 0;
  });

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Mis Mascotas</Typography>
        <button className="client-create-btn" onClick={() => handleOpenDialog()}>
          <AddIcon style={{ fontSize: 22 }} /> Agregar Mascota
        </button>
      </Box>
      <input
        className="client-search-bar"
        placeholder="Buscar mascota, especie o raza..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <TableContainer component={Paper} className="client-table-container">
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
                  <TableCell>
                    {pet.sexo ? pet.sexo.charAt(0).toUpperCase() + pet.sexo.slice(1) : ''}
                  </TableCell>
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
                <TableCell colSpan={7} align="center">
                  No tienes mascotas registradas. ¡Agrega una nueva mascota!
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
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle className="client-modal-title">
          <PetsIcon style={{ marginRight: 8, verticalAlign: 'middle' }} />
          {selectedPet ? 'Editar Mascota' : 'Agregar Mascota'}
        </DialogTitle>
        <DialogContent className="client-modal-content">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nombre"
              fullWidth
              variant="outlined"
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              InputProps={{ sx: { borderRadius: 2 } }}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Especie</InputLabel>
              <Select
                value={formData.especie}
                onChange={handleEspecieChange}
                label="Especie"
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                {Object.entries(categoriasEspecies).map(([categoria, especiesList]) => [
                  <MenuItem key={`cat-${categoria}`} disabled sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                    {categoria}
                  </MenuItem>,
                  ...especiesList.map(especie => (
                    <MenuItem key={`esp-${categoria}-${especie}`} value={especie} sx={{ pl: 4 }}>
                      {especie.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </MenuItem>
                  ))
                ])}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Raza</InputLabel>
              <Select
                value={formData.raza}
                onChange={(e) => setFormData({ ...formData, raza: e.target.value })}
                label="Raza"
                variant="outlined"
                sx={{ borderRadius: 2 }}
                disabled={!formData.especie}
              >
                {formData.especie && especies[formData.especie]?.map((raza) => (
                  <MenuItem key={raza} value={raza}>
                    {raza}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Fecha de Nacimiento"
              type="date"
              fullWidth
              value={formData.fecha_nacimiento}
              onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
              variant="outlined"
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
                value={formData.sexo}
                onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                label="Sexo"
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                {sexos.map((sexo) => (
                  <MenuItem key={sexo} value={sexo}>
                    {sexo.charAt(0).toUpperCase() + sexo.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Notas"
              fullWidth
              multiline
              rows={4}
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions className="client-modal-actions">
          <button onClick={handleCloseDialog} className="client-create-btn" style={{ background: '#f5f5f5', color: '#1769aa' }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} className="client-create-btn">
            {selectedPet ? 'Actualizar' : 'Guardar'}
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
    </Box>
  );
};

export default Pets; 