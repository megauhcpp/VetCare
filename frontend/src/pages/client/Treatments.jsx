import React from 'react';
import { useApp } from '../../context/AppContext';
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
  Chip
} from '@mui/material';
import { LocalHospital as TreatmentIcon } from '@mui/icons-material';

const Treatments = () => {
  const { treatments } = useApp();
  
  // Asegurarse de que treatments.data existe y es un array
  const treatmentsData = treatments?.data || [];

  const activeTreatments = treatmentsData.filter(t => t.estado === 'pendiente' || t.estado === 'en_progreso');
  const completedTreatments = treatmentsData.filter(t => t.estado === 'completado');
  const cancelledTreatments = treatmentsData.filter(t => t.estado === 'cancelado');

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tratamientos
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tratamientos Activos
              </Typography>
              <List>
                {activeTreatments.length > 0 ? (
                  activeTreatments.map((treatment) => (
                    <React.Fragment key={treatment.id_tratamiento}>
                      <ListItem>
                        <ListItemIcon>
                          <TreatmentIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={treatment.nombre}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                {treatment.cita.mascota.nombre}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="text.secondary">
                                {treatment.descripcion}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="text.secondary">
                                Inicio: {new Date(treatment.fecha_inicio).toLocaleDateString()}
                              </Typography>
                            </>
                          }
                        />
                        <Chip
                          label={treatment.estado === 'pendiente' ? 'Pendiente' : 'En Progreso'}
                          color={treatment.estado === 'pendiente' ? 'warning' : 'primary'}
                          size="small"
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No hay tratamientos activos" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tratamientos Completados
              </Typography>
              <List>
                {completedTreatments.length > 0 ? (
                  completedTreatments.map((treatment) => (
                    <React.Fragment key={treatment.id_tratamiento}>
                      <ListItem>
                        <ListItemIcon>
                          <TreatmentIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={treatment.nombre}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                {treatment.cita.mascota.nombre}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="text.secondary">
                                {treatment.descripcion}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="text.secondary">
                                Completado: {new Date(treatment.fecha_fin).toLocaleDateString()}
                              </Typography>
                            </>
                          }
                        />
                        <Chip
                          label="Completado"
                          color="success"
                          size="small"
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No hay tratamientos completados" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tratamientos Cancelados
              </Typography>
              <List>
                {cancelledTreatments.length > 0 ? (
                  cancelledTreatments.map((treatment) => (
                    <React.Fragment key={treatment.id_tratamiento}>
                      <ListItem>
                        <ListItemIcon>
                          <TreatmentIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={treatment.nombre}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                {treatment.cita.mascota.nombre}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="text.secondary">
                                {treatment.descripcion}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="text.secondary">
                                Cancelado: {new Date(treatment.fecha_fin).toLocaleDateString()}
                              </Typography>
                            </>
                          }
                        />
                        <Chip
                          label="Cancelado"
                          color="error"
                          size="small"
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No hay tratamientos cancelados" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Treatments; 