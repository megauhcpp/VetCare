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
  AccordionDetails
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

  // Mover hooks antes del return temprano
  const treatmentsData = useMemo(() => {
    console.log('Raw treatments:', treatments);
    return Array.isArray(treatments) ? treatments : (treatments?.data || []);
  }, [treatments]);
  
  // Filtrar mascotas del usuario actual
  const userPets = useMemo(() => {
    console.log('Raw pets:', pets);
    return pets.filter(pet => pet.id_usuario === user?.id_usuario);
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tratamientos de Mis Mascotas
      </Typography>

      {Object.values(treatmentsByPet).map(({ pet, treatments }) => (
        <Accordion key={pet.id_mascota} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <PetsIcon sx={{ mr: 2 }} />
              <Typography variant="h6">
                {pet.nombre} - {pet.especie} ({pet.raza})
              </Typography>
              <Chip 
                label={`${treatments.length} tratamiento${treatments.length !== 1 ? 's' : ''}`}
                color="primary"
                size="small"
                sx={{ ml: 2 }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {treatments.length > 0 ? (
              <List>
                {treatments.map((treatment) => (
                  <React.Fragment key={treatment.id_tratamiento}>
                    <ListItem>
                      <ListItemIcon>
                        <TreatmentIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="medium">
                            {treatment.nombre}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography component="div" variant="body2" sx={{ mt: 1 }}>
                              <strong>Descripción:</strong> {treatment.descripcion}
                            </Typography>
                            <Typography component="div" variant="body2">
                              <strong>Fecha de inicio:</strong> {formatDate(treatment.fecha_inicio)}
                            </Typography>
                            {treatment.fecha_fin && (
                              <Typography component="div" variant="body2">
                                <strong>Fecha de fin:</strong> {formatDate(treatment.fecha_fin)}
                              </Typography>
                            )}
                            <Typography component="div" variant="body2">
                              <strong>Veterinario:</strong> {treatment.cita?.veterinario?.nombre} {treatment.cita?.veterinario?.apellido}
                            </Typography>
                          </>
                        }
                      />
                      <Chip
                        label={treatment.estado}
                        color={getStatusColor(treatment.estado)}
                        size="small"
                        sx={{ ml: 2 }}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No hay tratamientos registrados para esta mascota.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

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