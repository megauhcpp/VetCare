import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

const AdminTreatments = () => {
  const { treatments, addTreatment, updateTreatment, deleteTreatment } = useApp();
  const [open, setOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    duracion: '',
    costo: '',
    estado: 'activo'
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  if (!treatments) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const handleOpen = (treatment = null) => {
    if (treatment) {
      setSelectedTreatment(treatment);
      setFormData({
        nombre: treatment.nombre,
        descripcion: treatment.descripcion,
        duracion: treatment.duracion,
        costo: treatment.costo,
        estado: treatment.estado
      });
    } else {
      setSelectedTreatment(null);
      setFormData({
        nombre: '',
        descripcion: '',
        duracion: '',
        costo: '',
        estado: 'activo'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTreatment(null);
    setFormData({
      nombre: '',
      descripcion: '',
      duracion: '',
      costo: '',
      estado: 'activo'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTreatment) {
        await updateTreatment(selectedTreatment.id, formData);
        setSnackbar({
          open: true,
          message: 'Tratamiento actualizado exitosamente',
          severity: 'success'
        });
      } else {
        await addTreatment(formData);
        setSnackbar({
          open: true,
          message: 'Tratamiento creado exitosamente',
          severity: 'success'
        });
      }
      handleClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Error al procesar el tratamiento',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTreatment(id);
      setSnackbar({
        open: true,
        message: 'Tratamiento eliminado exitosamente',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Error al eliminar el tratamiento',
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <h2>Gestión de Tratamientos</h2>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Nuevo Tratamiento
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Duración</TableCell>
              <TableCell>Costo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(treatments) && treatments.map((treatment) => (
              <TableRow key={treatment.id}>
                <TableCell>{treatment.nombre}</TableCell>
                <TableCell>{treatment.descripcion}</TableCell>
                <TableCell>{treatment.duracion}</TableCell>
                <TableCell>${treatment.costo}</TableCell>
                <TableCell>{treatment.estado}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(treatment)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(treatment.id)} color="error">
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
          {selectedTreatment ? 'Editar Tratamiento' : 'Nuevo Tratamiento'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Descripción"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              margin="normal"
              multiline
              rows={3}
              required
            />
            <TextField
              fullWidth
              label="Duración"
              value={formData.duracion}
              onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Costo"
              type="number"
              value={formData.costo}
              onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                label="Estado"
                required
              >
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="inactivo">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedTreatment ? 'Actualizar' : 'Crear'}
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

export default AdminTreatments; 