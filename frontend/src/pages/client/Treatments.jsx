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
  const { treatments, pets } = useApp();

  const getPetName = (petId) => {
    const pet = pets.find(p => p.id === petId);
    return pet ? pet.name : 'Unknown';
  };

  const activeTreatments = treatments.filter(t => t.status === 'active');
  const completedTreatments = treatments.filter(t => t.status === 'completed');
  const cancelledTreatments = treatments.filter(t => t.status === 'cancelled');

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
                    <React.Fragment key={treatment.id}>
                      <ListItem>
                        <ListItemIcon>
                          <TreatmentIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={treatment.name}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                {getPetName(treatment.petId)}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="text.secondary">
                                {treatment.description}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="text.secondary">
                                Inicio: {new Date(treatment.startDate).toLocaleDateString()}
                              </Typography>
                            </>
                          }
                        />
                        <Chip
                          label="Activo"
                          color="primary"
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
                    <React.Fragment key={treatment.id}>
                      <ListItem>
                        <ListItemIcon>
                          <TreatmentIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={treatment.name}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                {getPetName(treatment.petId)}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="text.secondary">
                                {treatment.description}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="text.secondary">
                                Completado: {new Date(treatment.endDate).toLocaleDateString()}
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
                    <React.Fragment key={treatment.id}>
                      <ListItem>
                        <ListItemIcon>
                          <TreatmentIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={treatment.name}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                {getPetName(treatment.petId)}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="text.secondary">
                                {treatment.description}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="text.secondary">
                                Cancelado: {new Date(treatment.endDate).toLocaleDateString()}
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