import React, { useState, useEffect } from 'react';
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
  Select
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import PetsIcon from '@mui/icons-material/Pets';
import { especies, categoriasEspecies, sexos } from '../../data/petSpecies';

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
        sexo: pet.sexo,
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

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Mis Mascotas</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Agregar Mascota
        </Button>
      </Box>

      {userPets.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
          No tienes mascotas registradas. ¡Agrega una nueva mascota!
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {userPets.map((pet) => (
            <Grid item xs={12} sm={6} md={4} key={pet.id_mascota}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{pet.nombre}</Typography>
                    <Box>
                      <IconButton onClick={() => handleOpenDialog(pet)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(pet.id_mascota)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography color="text.secondary" gutterBottom>
                    {pet.especie} - {pet.raza}
                  </Typography>
                  <Typography variant="body2">
                    Fecha de Nacimiento: {new Date(pet.fecha_nacimiento).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    Sexo: {pet.sexo}
                  </Typography>
                  {pet.notas && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Notas: {pet.notas}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">
                    Ver Historial Médico
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          py: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <PetsIcon />
          {selectedPet ? 'Editar Mascota' : 'Agregar Mascota'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              autoFocus
              label="Nombre"
              fullWidth
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 2 }
              }}
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
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
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
                    {sexo}
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
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedPet ? 'Actualizar' : 'Guardar'}
          </Button>
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