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

const AdminTreatments = () => {
  const { treatments } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Extraer los tratamientos del objeto de respuesta
  const treatmentsData = useMemo(() => {
    console.log('Raw treatments:', treatments);
    return Array.isArray(treatments) ? treatments : (treatments?.data || []);
  }, [treatments]);

  if (!treatmentsData) {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredTreatments = treatmentsData.filter(treatment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      treatment.nombre?.toLowerCase().includes(searchLower) ||
      treatment.descripcion?.toLowerCase().includes(searchLower) ||
      treatment.cita?.mascota?.nombre?.toLowerCase().includes(searchLower) ||
      treatment.cita?.veterinario?.nombre?.toLowerCase().includes(searchLower) ||
      treatment.cita?.veterinario?.apellido?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Tratamientos
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar tratamientos..."
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
              <TableCell>Nombre</TableCell>
              <TableCell>Mascota</TableCell>
              <TableCell>Dueño</TableCell>
              <TableCell>Veterinario</TableCell>
              <TableCell>Fecha Inicio</TableCell>
              <TableCell>Fecha Fin</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTreatments.length > 0 ? (
              filteredTreatments.map((treatment) => (
                <TableRow key={treatment.id_tratamiento}>
                  <TableCell>{treatment.nombre}</TableCell>
                  <TableCell>{treatment.cita?.mascota?.nombre}</TableCell>
                  <TableCell>
                    {treatment.cita?.mascota?.usuario?.nombre} {treatment.cita?.mascota?.usuario?.apellido}
                  </TableCell>
                  <TableCell>
                    {treatment.cita?.veterinario?.nombre} {treatment.cita?.veterinario?.apellido}
                  </TableCell>
                  <TableCell>{formatDate(treatment.fecha_inicio)}</TableCell>
                  <TableCell>{treatment.fecha_fin ? formatDate(treatment.fecha_fin) : '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={treatment.estado}
                      color={getStatusColor(treatment.estado)}
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
                  No hay tratamientos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminTreatments; 