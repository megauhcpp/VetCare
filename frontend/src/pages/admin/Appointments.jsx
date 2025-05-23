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
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

const AdminAppointments = () => {
  const { appointments } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

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
      <Typography variant="h4" gutterBottom>
        Gestión de Citas
      </Typography>

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
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small">
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
    </Box>
  );
};

export default AdminAppointments; 