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
        Treatments
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Treatments
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
                                Started: {new Date(treatment.startDate).toLocaleDateString()}
                              </Typography>
                            </>
                          }
                        />
                        <Chip
                          label="Active"
                          color="primary"
                          size="small"
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No active treatments" />
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
                Completed Treatments
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
                                Completed: {new Date(treatment.endDate).toLocaleDateString()}
                              </Typography>
                            </>
                          }
                        />
                        <Chip
                          label="Completed"
                          color="success"
                          size="small"
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No completed treatments" />
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
                Cancelled Treatments
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
                                Cancelled: {new Date(treatment.endDate).toLocaleDateString()}
                              </Typography>
                            </>
                          }
                        />
                        <Chip
                          label="Cancelled"
                          color="error"
                          size="small"
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No cancelled treatments" />
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