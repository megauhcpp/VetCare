import React, { useState, useMemo } from 'react';
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
  CircularProgress
} from '@mui/material';
import { LocalHospital as TreatmentIcon, Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const Treatments = () => {
  const { treatments, addTreatment, updateTreatment, deleteTreatment } = useApp();
  const [open, setOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    duracion: '',
    costo: '',
    estado: 'activo'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Mover hooks antes del return temprano
  const treatmentsData = useMemo(() => treatments?.data || [], [treatments]);
  const activeTreatments = useMemo(() =>
    Array.isArray(treatmentsData)
      ? treatmentsData.filter(t => t.estado === 'pendiente' || t.estado === 'en_progreso')
      : []
  , [treatmentsData]);
  const completedTreatments = useMemo(() =>
    Array.isArray(treatmentsData)
      ? treatmentsData.filter(t => t.estado === 'completado')
      : []
  , [treatmentsData]);
  const cancelledTreatments = useMemo(() =>
    Array.isArray(treatmentsData)
      ? treatmentsData.filter(t => t.estado === 'cancelado')
      : []
  , [treatmentsData]);

  if (!Array.isArray(treatments)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

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