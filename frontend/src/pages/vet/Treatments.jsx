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
  const { treatments, pets, setTreatments, appointments } = useApp();
  const { user } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [formData, setFormData] = useState({
    id_cita: '',
    nombre: '',
    precio: '',
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
        id_cita: treatment.id_cita || '',
        nombre: treatment.nombre || '',
        precio: treatment.precio || '',
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
        id_cita: '',
        nombre: '',
        precio: '',
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
        id_veterinario: user.id_usuario,
        estado: 'activo'
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
      if (!token) {
        setSnackbar({ open: true, message: 'No hay token de autenticación', severity: 'error' });
        return;
      }

      const url = `/api/tratamientos/${treatment.id_tratamiento}/estado`;

      console.log('Updating treatment state:', {
        url,
        treatmentId: treatment.id_tratamiento,
        newState,
        token: token.substring(0, 10) + '...' // Solo mostramos parte del token por seguridad
      });

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: newState })
      });

      console.log('Server response:', await response.clone().json());

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el estado del tratamiento');
      }

      const updatedTreatment = await response.json();
      setTreatments(treatments.map(t => t.id_tratamiento === updatedTreatment.data.id_tratamiento ? updatedTreatment.data : t));
      setSnackbar({ open: true, message: `Tratamiento marcado como ${newState}`, severity: 'success' });
      setChangingStateId(null);
    } catch (error) {
      console.error('Error updating treatment state:', error);
      setSnackbar({ open: true, message: error.message || 'Error al cambiar el estado', severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'warning';
      case 'en_progreso':
        return 'primary';
      case 'completado':
        return 'success';
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
              label="Cita"
              fullWidth
              value={formData.id_cita}
              onChange={e => setFormData({ ...formData, id_cita: e.target.value })}
              required
            >
              {appointments.map((cita) => (
                <MenuItem key={cita.id_cita} value={cita.id_cita}>
                  {(cita.mascota?.nombre || pets.find(p => p.id_mascota === cita.id_mascota)?.nombre || 'Mascota')}
                  {cita.motivo_consulta ? ` - ${cita.motivo_consulta}` : ''}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Nombre Tratamiento"
              fullWidth
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
            <TextField
              label="Precio"
              type="number"
              fullWidth
              value={formData.precio}
              onChange={e => setFormData({ ...formData, precio: e.target.value })}
              required
            />
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