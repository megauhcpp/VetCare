import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
  IconButton
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const Pets = () => {
  const { pets, setPets } = useApp();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    especie: '',
    raza: '',
    fecha_nacimiento: '',
    sexo: '',
    notas: ''
  });

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
      const url = selectedPet 
        ? `/api/mascotas/${selectedPet.id_mascota}`
        : '/api/mascotas';
      
      const method = selectedPet ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedPet = await response.json();
        if (selectedPet) {
          setPets(pets.map(p => p.id_mascota === updatedPet.id_mascota ? updatedPet : p));
        } else {
          setPets([...pets, updatedPet]);
        }
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error saving pet:', error);
    }
  };

  const handleDelete = async (petId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta mascota?')) {
      try {
        const response = await fetch(`/api/mascotas/${petId}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          setPets(pets.filter(p => p.id_mascota !== petId));
        }
      } catch (error) {
        console.error('Error deleting pet:', error);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
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

      {pets.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
          No tienes mascotas registradas. ¡Agrega una nueva mascota!
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {pets.map((pet) => (
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

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedPet ? 'Editar Mascota' : 'Agregar Mascota'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            fullWidth
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Especie"
            fullWidth
            value={formData.especie}
            onChange={(e) => setFormData({ ...formData, especie: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Raza"
            fullWidth
            value={formData.raza}
            onChange={(e) => setFormData({ ...formData, raza: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Fecha de Nacimiento"
            type="date"
            fullWidth
            value={formData.fecha_nacimiento}
            onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="Sexo"
            fullWidth
            value={formData.sexo}
            onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Notas"
            fullWidth
            multiline
            rows={3}
            value={formData.notas}
            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} color="primary">
            {selectedPet ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Pets; 