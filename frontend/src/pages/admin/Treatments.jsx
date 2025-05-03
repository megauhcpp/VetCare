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

const Treatments = () => {
  const { treatments, setTreatments, pets } = useApp();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    petId: '',
    status: 'active',
    startDate: '',
    endDate: ''
  });

  const handleOpenDialog = (treatment = null) => {
    if (treatment) {
      setSelectedTreatment(treatment);
      setFormData({
        name: treatment.name,
        description: treatment.description,
        petId: treatment.petId,
        status: treatment.status,
        startDate: treatment.startDate,
        endDate: treatment.endDate
      });
    } else {
      setSelectedTreatment(null);
      setFormData({
        name: '',
        description: '',
        petId: '',
        status: 'active',
        startDate: '',
        endDate: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTreatment(null);
  };

  const handleSubmit = async () => {
    try {
      const url = selectedTreatment 
        ? `/api/treatments/${selectedTreatment.id}`
        : '/api/treatments';
      
      const method = selectedTreatment ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedTreatment = await response.json();
        if (selectedTreatment) {
          setTreatments(treatments.map(t => t.id === updatedTreatment.id ? updatedTreatment : t));
        } else {
          setTreatments([...treatments, updatedTreatment]);
        }
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error saving treatment:', error);
    }
  };

  const handleDelete = async (treatmentId) => {
    if (window.confirm('Are you sure you want to delete this treatment?')) {
      try {
        const response = await fetch(`/api/treatments/${treatmentId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setTreatments(treatments.filter(t => t.id !== treatmentId));
        }
      } catch (error) {
        console.error('Error deleting treatment:', error);
      }
    }
  };

  const getPetName = (petId) => {
    const pet = pets.find(p => p.id === petId);
    return pet ? pet.name : 'Unknown';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Treatments Management</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add New Treatment
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Pet</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {treatments.map((treatment) => (
              <TableRow key={treatment.id}>
                <TableCell>{treatment.name}</TableCell>
                <TableCell>{treatment.description}</TableCell>
                <TableCell>{getPetName(treatment.petId)}</TableCell>
                <TableCell>{treatment.status}</TableCell>
                <TableCell>{new Date(treatment.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{treatment.endDate ? new Date(treatment.endDate).toLocaleDateString() : 'Ongoing'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(treatment)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(treatment.id)}>
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
          {selectedTreatment ? 'Edit Treatment' : 'Add New Treatment'}
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
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Pet</InputLabel>
            <Select
              value={formData.petId}
              onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
              label="Pet"
            >
              {pets.map((pet) => (
                <MenuItem key={pet.id} value={pet.id}>
                  {pet.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              label="Status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Start Date"
            type="date"
            fullWidth
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            fullWidth
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            {selectedTreatment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Treatments; 