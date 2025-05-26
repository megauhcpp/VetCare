import React, { useState } from 'react';
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
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Check as CheckIcon, Close as CloseIcon, SwapHoriz as SwapHorizIcon } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const Treatments = () => {
  const { treatments, pets, setTreatments } = useApp();
  const { user } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [formData, setFormData] = useState({
    petId: '',
    tipo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'activo',
    medicamentos: '',
    instrucciones: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [changingStateId, setChangingStateId] = useState(null);

  if (!Array.isArray(treatments) || !Array.isArray(pets)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const handleOpenDialog = (treatment = null) => {
    if (treatment) {
      setSelectedTreatment(treatment);
      setFormData({
        petId: treatment.id_mascota,
        tipo: treatment.tipo,
        descripcion: treatment.descripcion,
        fecha_inicio: treatment.fecha_inicio.split('T')[0],
        fecha_fin: treatment.fecha_fin ? treatment.fecha_fin.split('T')[0] : '',
        estado: treatment.estado,
        medicamentos: treatment.medicamentos || '',
        instrucciones: treatment.instrucciones || ''
      });
    } else {
      setSelectedTreatment(null);
      setFormData({
        petId: '',
        tipo: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        estado: 'activo',
        medicamentos: '',
        instrucciones: ''
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
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      const url = selectedTreatment 
        ? `/api/tratamientos/${selectedTreatment.id_tratamiento}`
        : '/api/tratamientos';
      
      const method = selectedTreatment ? 'PUT' : 'POST';
      
      const treatmentData = {
        ...formData,
        id_veterinario: user.id_usuario
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(treatmentData),
      });

      if (response.ok) {
        const updatedTreatment = await response.json();
        if (selectedTreatment) {
          setTreatments(treatments.map(t => t.id_tratamiento === updatedTreatment.id_tratamiento ? updatedTreatment : t));
        } else {
          setTreatments([...treatments, updatedTreatment]);
        }
        handleCloseDialog();
        setSnackbar({ open: true, message: 'Tratamiento guardado correctamente', severity: 'success' });
      } else {
        const errorData = await response.json();
        console.error('Error al guardar el tratamiento:', errorData);
        setSnackbar({ open: true, message: 'Error al guardar el tratamiento', severity: 'error' });
      }
    } catch (error) {
      console.error('Error saving treatment:', error);
      setSnackbar({ open: true, message: 'Error al guardar el tratamiento', severity: 'error' });
    }
  };

  const handleDelete = async (treatmentId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este tratamiento?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No hay token de autenticación');
          return;
        }

        const response = await fetch(`/api/tratamientos/${treatmentId}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setTreatments(treatments.filter(t => t.id_tratamiento !== treatmentId));
          setSnackbar({ open: true, message: 'Tratamiento eliminado correctamente', severity: 'success' });
        } else {
          console.error('Error al eliminar el tratamiento:', await response.text());
          setSnackbar({ open: true, message: 'Error al eliminar el tratamiento', severity: 'error' });
        }
      } catch (error) {
        console.error('Error deleting treatment:', error);
        setSnackbar({ open: true, message: 'Error al eliminar el tratamiento', severity: 'error' });
      }
    }
  };

  const handleChangeState = async (treatment, newState) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tratamientos/${treatment.id_tratamiento}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...treatment, estado: newState }),
      });
      if (response.ok) {
        const updatedTreatment = await response.json();
        setTreatments(treatments.map(t => t.id_tratamiento === updatedTreatment.id_tratamiento ? updatedTreatment : t));
        setSnackbar({ open: true, message: `Tratamiento marcado como ${newState}`, severity: 'success' });
        setChangingStateId(null);
      } else {
        setSnackbar({ open: true, message: 'Error al cambiar el estado', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error al cambiar el estado', severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'activo':
        return 'success';
      case 'completado':
        return 'info';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestión de Tratamientos</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Tratamiento
        </Button>
      </Box>

      {treatments.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
          No hay tratamientos registrados
        </Typography>
      ) : (
        <List>
          {treatments.map((treatment) => (
            <ListItem
              key={treatment.id_tratamiento}
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
                      {pets.find(p => p.id_mascota === treatment.id_mascota)?.nombre}
                    </Typography>
                    <Chip
                      label={treatment.estado}
                      color={getStatusColor(treatment.estado)}
                      size="small"
                    />
                  </Stack>
                }
                secondary={
                  <Typography component="div" variant="body2">
                    <Typography component="div" sx={{ mb: 0.5 }}>
                      Tipo: {treatment.tipo}
                    </Typography>
                    <Typography component="div" sx={{ mb: 0.5 }}>
                      Descripción: {treatment.descripcion}
                    </Typography>
                    <Typography component="div" sx={{ mb: 0.5 }}>
                      Fecha Inicio: {new Date(treatment.fecha_inicio).toLocaleDateString()}
                    </Typography>
                    {treatment.fecha_fin && (
                      <Typography component="div" sx={{ mb: 0.5 }}>
                        Fecha Fin: {new Date(treatment.fecha_fin).toLocaleDateString()}
                      </Typography>
                    )}
                    {treatment.medicamentos && (
                      <Typography component="div" sx={{ mb: 0.5 }}>
                        Medicamentos: {treatment.medicamentos}
                      </Typography>
                    )}
                    {treatment.instrucciones && (
                      <Typography component="div">
                        Instrucciones: {treatment.instrucciones}
                      </Typography>
                    )}
                  </Typography>
                }
              />
              <ListItemSecondaryAction>
                <IconButton onClick={() => setChangingStateId(changingStateId === treatment.id_tratamiento ? null : treatment.id_tratamiento)}>
                  <SwapHorizIcon />
                </IconButton>
                {changingStateId === treatment.id_tratamiento && (
                  <>
                    <IconButton onClick={() => handleChangeState(treatment, 'completado')} color="success">
                      <CheckIcon />
                    </IconButton>
                    <IconButton onClick={() => handleChangeState(treatment, 'cancelado')} color="error">
                      <CloseIcon />
                    </IconButton>
                  </>
                )}
                <IconButton onClick={() => handleOpenDialog(treatment)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(treatment.id_tratamiento)}>
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
          {selectedTreatment ? 'Editar Tratamiento' : 'Nuevo Tratamiento'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              select
              label="Mascota"
              fullWidth
              value={formData.petId}
              onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
              required
            >
              {pets.map((pet) => (
                <MenuItem key={pet.id_mascota} value={pet.id_mascota}>
                  {pet.nombre}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Tipo de Tratamiento"
              fullWidth
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              required
            >
              <MenuItem value="medicacion">Medicación</MenuItem>
              <MenuItem value="terapia">Terapia</MenuItem>
              <MenuItem value="cirugia">Cirugía</MenuItem>
              <MenuItem value="control">Control</MenuItem>
              <MenuItem value="otro">Otro</MenuItem>
            </TextField>
            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={2}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              required
            />
            <TextField
              label="Fecha de Inicio"
              type="date"
              fullWidth
              value={formData.fecha_inicio}
              onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Fecha de Fin"
              type="date"
              fullWidth
              value={formData.fecha_fin}
              onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              label="Estado"
              fullWidth
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              required
            >
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="completado">Completado</MenuItem>
              <MenuItem value="cancelado">Cancelado</MenuItem>
            </TextField>
            <TextField
              label="Medicamentos"
              fullWidth
              multiline
              rows={2}
              value={formData.medicamentos}
              onChange={(e) => setFormData({ ...formData, medicamentos: e.target.value })}
            />
            <TextField
              label="Instrucciones"
              fullWidth
              multiline
              rows={3}
              value={formData.instrucciones}
              onChange={(e) => setFormData({ ...formData, instrucciones: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
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
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Treatments; 