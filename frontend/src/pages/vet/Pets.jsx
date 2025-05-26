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
  Divider
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { especies, categoriasEspecies } from '../../data/petSpecies';

const Pets = () => {
  const { pets, setPets } = useApp();
  const { user } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    especie: '',
    raza: '',
    edad: '',
    peso: '',
    sexo: '',
    observaciones: '',
    id_usuario: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [clientes, setClientes] = useState([]);

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
        edad: pet.edad,
        peso: pet.peso,
        sexo: pet.sexo,
        observaciones: pet.observaciones || '',
        id_usuario: pet.id_usuario || ''
      });
    } else {
      setSelectedPet(null);
      setFormData({
        nombre: '',
        especie: '',
        raza: '',
        edad: '',
        peso: '',
        sexo: '',
        observaciones: '',
        id_usuario: ''
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
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      const url = selectedPet 
        ? `/api/mascotas/${selectedPet.id_mascota}`
        : '/api/mascotas';
      
      const method = selectedPet ? 'PUT' : 'POST';
      
      const petData = {
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
        body: JSON.stringify(petData),
      });

      if (response.ok) {
        const updatedPet = await response.json();
        if (selectedPet) {
          setPets(pets.map(p => p.id_mascota === updatedPet.id_mascota ? updatedPet : p));
        } else {
          setPets([...pets, updatedPet]);
        }
        handleCloseDialog();
        setSnackbar({ open: true, message: 'Mascota guardada correctamente', severity: 'success' });
      } else {
        const errorData = await response.json();
        console.error('Error al guardar la mascota:', errorData);
        setSnackbar({ open: true, message: 'Error al guardar la mascota', severity: 'error' });
      }
    } catch (error) {
      console.error('Error saving pet:', error);
      setSnackbar({ open: true, message: 'Error al guardar la mascota', severity: 'error' });
    }
  };

  const handleDelete = async (petId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta mascota?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No hay token de autenticación');
          return;
        }

        const response = await fetch(`/api/mascotas/${petId}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setPets(pets.filter(p => p.id_mascota !== petId));
          setSnackbar({ open: true, message: 'Mascota eliminada correctamente', severity: 'success' });
        } else {
          console.error('Error al eliminar la mascota:', await response.text());
          setSnackbar({ open: true, message: 'Error al eliminar la mascota', severity: 'error' });
        }
      } catch (error) {
        console.error('Error deleting pet:', error);
        setSnackbar({ open: true, message: 'Error al eliminar la mascota', severity: 'error' });
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestión de Mascotas</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Mascota
        </Button>
      </Box>

      {pets.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
          No hay mascotas registradas
        </Typography>
      ) : (
        <List>
          {pets.map((pet) => (
            <ListItem
              key={pet.id_mascota}
              sx={{
                mb: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1
              }}
            >
              <ListItemText
                primary={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h6">
                      {pet.nombre}
                    </Typography>
                    <Chip
                      label={pet.especie}
                      color="primary"
                      size="small"
                    />
                  </Stack>
                }
                secondary={
                  <Typography component="div" variant="body2">
                    <Typography component="div" sx={{ mb: 0.5 }}>
                      Raza: {pet.raza}
                    </Typography>
                    <Typography component="div" sx={{ mb: 0.5 }}>
                      Edad: {pet.edad} años
                    </Typography>
                    <Typography component="div" sx={{ mb: 0.5 }}>
                      Peso: {pet.peso} kg
                    </Typography>
                    <Typography component="div" sx={{ mb: 0.5 }}>
                      Sexo: {pet.sexo}
                    </Typography>
                    {pet.observaciones && (
                      <Typography component="div">
                        Observaciones: {pet.observaciones}
                      </Typography>
                    )}
                  </Typography>
                }
              />
              <ListItemSecondaryAction>
                <IconButton onClick={() => handleOpenDialog(pet)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(pet.id_mascota)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedPet ? 'Editar Mascota' : 'Nueva Mascota'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Nombre"
              fullWidth
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
            <TextField
              select
              label="Especie"
              fullWidth
              value={formData.especie}
              onChange={(e) => setFormData({ ...formData, especie: e.target.value, raza: '' })}
              required
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
            </TextField>
            <TextField
              select
              label="Raza"
              fullWidth
              value={formData.raza}
              onChange={(e) => setFormData({ ...formData, raza: e.target.value })}
              required
              disabled={!formData.especie}
            >
              {formData.especie && especies[formData.especie]?.map((raza) => (
                <MenuItem key={raza} value={raza}>
                  {raza}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Edad"
              type="number"
              fullWidth
              value={formData.edad}
              onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
              required
            />
            <TextField
              label="Peso (kg)"
              type="number"
              fullWidth
              value={formData.peso}
              onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
              required
            />
            <TextField
              select
              label="Sexo"
              fullWidth
              value={formData.sexo}
              onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
              required
            >
              <MenuItem value="macho">Macho</MenuItem>
              <MenuItem value="hembra">Hembra</MenuItem>
            </TextField>
            <TextField
              label="Observaciones"
              fullWidth
              multiline
              rows={3}
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
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
            >
              {clientes.map((cliente) => (
                <MenuItem key={cliente.id_usuario} value={cliente.id_usuario}>
                  {cliente.nombre} {cliente.apellido} ({cliente.email})
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
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