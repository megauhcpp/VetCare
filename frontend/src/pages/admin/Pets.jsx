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
  Select
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const Pets = () => {
  const { pets, setPets, users } = useApp();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    ownerId: ''
  });

  const handleOpenDialog = (pet = null) => {
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

  const getOwnerName = (ownerId) => {
    const owner = users.find(u => u.id === ownerId);
    return owner ? owner.name : 'Unknown';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Pets Management</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add New Pet
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Species</TableCell>
              <TableCell>Breed</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pets.map((pet) => (
              <TableRow key={pet.id}>
                <TableCell>{pet.name}</TableCell>
                <TableCell>{pet.species}</TableCell>
                <TableCell>{pet.breed}</TableCell>
                <TableCell>{pet.age}</TableCell>
                <TableCell>{getOwnerName(pet.ownerId)}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(pet)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(pet.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
          <FormControl fullWidth margin="dense">
            <InputLabel>Owner</InputLabel>
            <Select
              value={formData.ownerId}
              onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
              label="Owner"
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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