import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const AdminPets = () => {
  const { pets, setPets, users } = useApp();
  const [open, setOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    ownerId: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleOpen = (pet = null) => {
    if (pet) {
      setSelectedPet(pet);
      setFormData({
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        ownerId: pet.ownerId
      });
    } else {
      setSelectedPet(null);
      setFormData({
        name: '',
        species: '',
        breed: '',
        age: '',
        ownerId: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPet(null);
    setFormData({
      name: '',
      species: '',
      breed: '',
      age: '',
      ownerId: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedPet 
        ? `/api/pets/${selectedPet.id}`
        : '/api/pets';
      
      const method = selectedPet ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedPet = await response.json();
        if (selectedPet) {
          setPets(pets.map(p => p.id === updatedPet.id ? updatedPet : p));
        } else {
          setPets([...pets, updatedPet]);
        }
        setSnackbar({
          open: true,
          message: 'Mascota actualizada correctamente',
          severity: 'success'
        });
      }
      handleClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al procesar la mascota',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (petId) => {
    if (window.confirm('Are you sure you want to delete this pet?')) {
      try {
        const response = await fetch(`/api/pets/${petId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setPets(pets.filter(p => p.id !== petId));
          setSnackbar({
            open: true,
            message: 'Mascota eliminada correctamente',
            severity: 'success'
          });
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Error al eliminar la mascota',
          severity: 'error'
        });
      }
    }
  };

  const getOwnerName = (ownerId) => {
    const owner = users.find(u => u.id === ownerId);
    return owner ? owner.name : 'Unknown';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestión de Mascotas</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Nueva Mascota
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Especie</TableCell>
              <TableCell>Raza</TableCell>
              <TableCell>Edad</TableCell>
              <TableCell>Dueño</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pets.map((pet, idx) => (
              <TableRow key={pet.id || `${pet.name}-${pet.species}-${idx}`}>
                <TableCell>{pet.name}</TableCell>
                <TableCell>{pet.species}</TableCell>
                <TableCell>{pet.breed}</TableCell>
                <TableCell>{pet.age}</TableCell>
                <TableCell>{getOwnerName(pet.ownerId)}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(pet)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(pet.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedPet ? 'Editar Mascota' : 'Nueva Mascota'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nombre"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Especie"
              value={formData.species || ''}
              onChange={(e) => setFormData({ ...formData, species: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Raza"
              value={formData.breed || ''}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Edad"
              type="number"
              value={formData.age || ''}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Dueño</InputLabel>
              <Select
                value={formData.ownerId || ''}
                onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                label="Dueño"
              >
                {users.map((user, idx) => (
                  <MenuItem key={user.id || `${user.name}-${user.email}-${idx}`} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
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