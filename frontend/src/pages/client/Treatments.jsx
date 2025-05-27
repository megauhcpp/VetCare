import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
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
  Snackbar,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  TableSortLabel,
  Tooltip
} from '@mui/material';
import { 
  LocalHospital as TreatmentIcon, 
  ExpandMore as ExpandMoreIcon,
  Pets as PetsIcon
} from '@mui/icons-material';

const Treatments = () => {
  const { treatments, pets } = useApp();
  const { user } = useAuth();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('fecha'); // 'fecha', 'estado', 'dueno', 'veterinario'

  // Mover hooks antes del return temprano
  const treatmentsData = useMemo(() => {
    console.log('Raw treatments:', treatments);
    return Array.isArray(treatments) ? treatments : (treatments?.data || []);
  }, [treatments]);
  
  // Filtrar mascotas del usuario actual
  const userPets = useMemo(() => {
    console.log('Raw pets:', pets);
    return pets.filter(pet => pet.usuario?.id_usuario === user?.id_usuario);
  }, [pets, user]);

  // Organizar tratamientos por mascota
  const treatmentsByPet = useMemo(() => {
    console.log('Treatments data:', treatmentsData);
    console.log('User pets:', userPets);
    
    const organized = {};
    userPets.forEach(pet => {
      organized[pet.id_mascota] = {
        pet,
        treatments: treatmentsData.filter(t => t.cita?.mascota?.id_mascota === pet.id_mascota)
      };
    });
    console.log('Organized treatments:', organized);
    return organized;
  }, [userPets, treatmentsData]);

  if (!Array.isArray(treatments) || !Array.isArray(pets)) {
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

  const allTreatments = Object.values(treatmentsByPet).flatMap(obj => obj.treatments);
  const filteredTreatments = allTreatments.filter(treatment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      treatment.nombre?.toLowerCase().includes(searchLower) ||
      treatment.cita?.mascota?.nombre?.toLowerCase().includes(searchLower) ||
      treatment.cita?.veterinario?.nombre?.toLowerCase().includes(searchLower) ||
      treatment.cita?.veterinario?.apellido?.toLowerCase().includes(searchLower) ||
      treatment.estado?.toLowerCase().includes(searchLower)
    );
  });
  const sortedTreatments = [...filteredTreatments].sort((a, b) => {
    if (orderBy === 'fecha') {
      if (order === 'asc') {
        return new Date(a.fecha_inicio) - new Date(b.fecha_inicio);
      } else {
        return new Date(b.fecha_inicio) - new Date(a.fecha_inicio);
      }
    } else if (orderBy === 'estado') {
      if (order === 'asc') {
        return (a.estado || '').localeCompare(b.estado || '');
      } else {
        return (b.estado || '').localeCompare(a.estado || '');
      }
    } else if (orderBy === 'dueno') {
      const aName = (a.cita?.mascota?.usuario?.nombre || '') + ' ' + (a.cita?.mascota?.usuario?.apellido || '');
      const bName = (b.cita?.mascota?.usuario?.nombre || '') + ' ' + (b.cita?.mascota?.usuario?.apellido || '');
      if (order === 'asc') {
        return aName.localeCompare(bName);
      } else {
        return bName.localeCompare(aName);
      }
    } else if (orderBy === 'veterinario') {
      const aVet = (a.cita?.veterinario?.nombre || '') + ' ' + (a.cita?.veterinario?.apellido || '');
      const bVet = (b.cita?.veterinario?.nombre || '') + ' ' + (b.cita?.veterinario?.apellido || '');
      if (order === 'asc') {
        return aVet.localeCompare(bVet);
      } else {
        return bVet.localeCompare(aVet);
      }
    }
    return 0;
  });

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tratamientos de Mis Mascotas
      </Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Buscar"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
          fullWidth
          sx={{ mb: 2 }}
        />
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'mascota'}
                  direction={orderBy === 'mascota' ? order : 'asc'}
                  onClick={() => handleRequestSort('mascota')}
                >
                  Mascota
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'nombre'}
                  direction={orderBy === 'nombre' ? order : 'asc'}
                  onClick={() => handleRequestSort('nombre')}
                >
                  Nombre
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'veterinario'}
                  direction={orderBy === 'veterinario' ? order : 'asc'}
                  onClick={() => handleRequestSort('veterinario')}
                >
                  Veterinario
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'fecha'}
                  direction={orderBy === 'fecha' ? order : 'asc'}
                  onClick={() => handleRequestSort('fecha')}
                >
                  Fecha de Inicio
                </TableSortLabel>
              </TableCell>
              <TableCell>Fecha de Fin</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'estado'}
                  direction={orderBy === 'estado' ? order : 'asc'}
                  onClick={() => handleRequestSort('estado')}
                >
                  Estado
                </TableSortLabel>
              </TableCell>
              <TableCell>Precio</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTreatments.length > 0 ? (
              sortedTreatments.map((treatment) => (
                <TableRow key={treatment.id_tratamiento}>
                  <TableCell>{treatment.cita?.mascota?.nombre}</TableCell>
                  <TableCell>{treatment.nombre}</TableCell>
                  <TableCell>{treatment.cita?.veterinario?.nombre} {treatment.cita?.veterinario?.apellido}</TableCell>
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
                    {treatment.precio ? `$${treatment.precio}` : '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay tratamientos registrados para tus mascotas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
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

export default Treatments; 