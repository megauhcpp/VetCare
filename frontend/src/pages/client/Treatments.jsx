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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tratamientos de Mis Mascotas
      </Typography>

      {Object.keys(treatmentsByPet).length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
          No hay tratamientos registrados para tus mascotas
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {Object.values(treatmentsByPet).map(({ pet, treatments }) => (
            <Grid item xs={12} key={pet.id_mascota}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.main',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PetsIcon />
                    <Typography variant="h6">
                      {pet.nombre} - {pet.especie}
                    </Typography>
                    <Chip
                      label={`${treatments.length} tratamientos`}
                      color="primary"
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {treatments.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No hay tratamientos registrados para esta mascota
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
                          <ListItemIcon>
                            <TreatmentIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h6">
                                  {treatment.nombre}
                                </Typography>
                                <Chip
                                  label={treatment.estado}
                                  color={getStatusColor(treatment.estado)}
                                  size="small"
                                />
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {treatment.descripcion}
                                </Typography>
                                <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                                  <Typography variant="body2">
                                    Fecha de inicio: {formatDate(treatment.fecha_inicio)}
                                  </Typography>
                                  {treatment.fecha_fin && (
                                    <Typography variant="body2">
                                      Fecha de fin: {formatDate(treatment.fecha_fin)}
                                    </Typography>
                                  )}
                                </Box>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  Precio: ${treatment.precio}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      )}

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