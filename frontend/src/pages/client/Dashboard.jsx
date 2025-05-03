import React from 'react';
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
  Divider
} from '@mui/material';
import {
  Pets as PetsIcon,
  Event as EventIcon,
  LocalHospital as TreatmentIcon
} from '@mui/icons-material';

const ClientDashboard = () => {
  const { pets, appointments, treatments } = useApp();
  const { user } = useAuth();

  const upcomingAppointments = appointments
    .filter(a => new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  const activeTreatments = treatments
    .filter(t => t.status === 'active')
    .slice(0, 3);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Here's an overview of your pets and appointments
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Pets
              </Typography>
              <List>
                {pets.map((pet) => (
                  <React.Fragment key={pet.id}>
                    <ListItem>
                      <ListItemIcon>
                        <PetsIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={pet.name}
                        secondary={`${pet.species} - ${pet.breed}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Appointments
              </Typography>
              <List>
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <React.Fragment key={appointment.id}>
                      <ListItem>
                        <ListItemIcon>
                          <EventIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={new Date(appointment.date).toLocaleDateString()}
                          secondary={`${appointment.time} - ${appointment.type}`}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No upcoming appointments" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
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
                          secondary={treatment.description}
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
      </Grid>
    </Box>
  );
};

export default ClientDashboard; 