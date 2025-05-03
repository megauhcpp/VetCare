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
    name: '',
    species: '',
    breed: '',
    age: '',
    weight: '',
    medicalHistory: ''
  });

  const handleOpenDialog = (pet = null) => {
    if (pet) {
      setSelectedPet(pet);
      setFormData({
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        weight: pet.weight,
        medicalHistory: pet.medicalHistory
      });
    } else {
      setSelectedPet(null);
      setFormData({
        name: '',
        species: '',
        breed: '',
        age: '',
        weight: '',
        medicalHistory: ''
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
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error saving pet:', error);
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
        }
      } catch (error) {
        console.error('Error deleting pet:', error);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">My Pets</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add New Pet
        </Button>
      </Box>

      <Grid container spacing={3}>
        {pets.map((pet) => (
          <Grid item xs={12} sm={6} md={4} key={pet.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">{pet.name}</Typography>
                  <Box>
                    <IconButton onClick={() => handleOpenDialog(pet)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(pet.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography color="text.secondary" gutterBottom>
                  {pet.species} - {pet.breed}
                </Typography>
                <Typography variant="body2">
                  Age: {pet.age} years
                </Typography>
                <Typography variant="body2">
                  Weight: {pet.weight} kg
                </Typography>
                {pet.medicalHistory && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Medical History: {pet.medicalHistory}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  View Medical Records
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedPet ? 'Edit Pet' : 'Add New Pet'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Species"
            fullWidth
            value={formData.species}
            onChange={(e) => setFormData({ ...formData, species: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Breed"
            fullWidth
            value={formData.breed}
            onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Age"
            type="number"
            fullWidth
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Weight (kg)"
            type="number"
            fullWidth
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Medical History"
            fullWidth
            multiline
            rows={3}
            value={formData.medicalHistory}
            onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            {selectedPet ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Pets; 