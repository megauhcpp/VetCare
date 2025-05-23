import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon
} from '@mui/icons-material';

const AdminAppointments = () => {
  const { appointments, pets, users } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    id_mascota: '',
    id_usuario: '',
    fecha_hora: '',
    tipo_consulta: '',
    motivo_consulta: '',
    estado: 'pendiente'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Extraer las citas del objeto de respuesta
  const appointmentsData = useMemo(() => {
    console.log('Raw appointments:', appointments);
    return Array.isArray(appointments) ? appointments : (appointments?.data || []);
  }, [appointments]);

  if (!appointmentsData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'warning';
      case 'confirmada':
        return 'primary';
      case 'completada':
        return 'success';
      case 'cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleOpenDialog = (appointment = null) => {
    if (appointment) {
      const date = new Date(appointment.fecha_hora);
      setFormData({
        id_mascota: appointment.id_mascota,
        id_usuario: appointment.id_usuario,
        fecha_hora: date.toISOString().slice(0, 16),
        tipo_consulta: appointment.tipo_consulta,
        motivo_consulta: appointment.motivo_consulta,
        estado: appointment.estado
      });
      setSelectedAppointment(appointment);
    } else {
      setFormData({
        id_mascota: '',
        id_usuario: '',
        fecha_hora: '',
        tipo_consulta: '',
        motivo_consulta: '',
        estado: 'pendiente'
      });
      setSelectedAppointment(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAppointment(null);
  };

  const handleOpenDeleteDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedAppointment(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const url = selectedAppointment
        ? `/api/appointments/${selectedAppointment.id_cita}`
        : '/api/appointments';
      
      const method = selectedAppointment ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al guardar la cita');

      setSnackbar({
        open: true,
        message: `Cita ${selectedAppointment ? 'actualizada' : 'creada'} exitosamente`,
        severity: 'success'
      });
      
      handleCloseDialog();
      // Aquí deberías actualizar la lista de citas
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/appointments/${selectedAppointment.id_cita}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar la cita');

      setSnackbar({
        open: true,
        message: 'Cita eliminada exitosamente',
        severity: 'success'
      });
      
      handleCloseDeleteDialog();
      // Aquí deberías actualizar la lista de citas
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  const filteredAppointments = appointmentsData.filter(appointment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.motivo_consulta?.toLowerCase().includes(searchLower) ||
      appointment.mascota?.nombre?.toLowerCase().includes(searchLower) ||
      appointment.mascota?.usuario?.nombre?.toLowerCase().includes(searchLower) ||
      appointment.mascota?.usuario?.apellido?.toLowerCase().includes(searchLower) ||
      appointment.veterinario?.nombre?.toLowerCase().includes(searchLower) ||
      appointment.veterinario?.apellido?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Citas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Cita
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar citas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha y Hora</TableCell>
              <TableCell>Mascota</TableCell>
              <TableCell>Dueño</TableCell>
              <TableCell>Veterinario</TableCell>
              <TableCell>Tipo de Consulta</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id_cita}>
                  <TableCell>{formatDateTime(appointment.fecha_hora)}</TableCell>
                  <TableCell>{appointment.mascota?.nombre}</TableCell>
                  <TableCell>
                    {appointment.mascota?.usuario?.nombre} {appointment.mascota?.usuario?.apellido}
                  </TableCell>
                  <TableCell>
                    {appointment.veterinario?.nombre} {appointment.veterinario?.apellido}
                  </TableCell>
                  <TableCell>{appointment.tipo_consulta}</TableCell>
                  <TableCell>{appointment.motivo_consulta}</TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.estado}
                      color={getStatusColor(appointment.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Ver detalles">
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenDialog(appointment)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" onClick={() => handleOpenDeleteDialog(appointment)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No hay citas registradas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para crear/editar cita */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAppointment ? 'Editar Cita' : 'Nueva Cita'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Mascota</InputLabel>
              <Select
                name="id_mascota"
                value={formData.id_mascota}
                onChange={handleInputChange}
                label="Mascota"
              >
                {pets?.map((pet) => (
                  <MenuItem key={pet.id_mascota} value={pet.id_mascota}>
                    {pet.nombre} - {pet.usuario?.nombre} {pet.usuario?.apellido}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Veterinario</InputLabel>
              <Select
                name="id_usuario"
                value={formData.id_usuario}
                onChange={handleInputChange}
                label="Veterinario"
              >
                {users?.filter(user => user.rol === 'veterinario').map((vet) => (
                  <MenuItem key={vet.id_usuario} value={vet.id_usuario}>
                    {vet.nombre} {vet.apellido}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="fecha_hora"
              label="Fecha y Hora"
              type="datetime-local"
              value={formData.fecha_hora}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Tipo de Consulta</InputLabel>
              <Select
                name="tipo_consulta"
                value={formData.tipo_consulta}
                onChange={handleInputChange}
                label="Tipo de Consulta"
              >
                <MenuItem value="consulta_general">Consulta General</MenuItem>
                <MenuItem value="vacunacion">Vacunación</MenuItem>
                <MenuItem value="cirugia">Cirugía</MenuItem>
                <MenuItem value="urgencia">Urgencia</MenuItem>
              </Select>
            </FormControl>
            <TextField
              name="motivo_consulta"
              label="Motivo de la Consulta"
              value={formData.motivo_consulta}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
            />
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                label="Estado"
              >
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="confirmada">Confirmada</MenuItem>
                <MenuItem value="completada">Completada</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedAppointment ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación para eliminar */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar la cita programada para {selectedAppointment?.mascota?.nombre}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
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

export default AdminAppointments; 