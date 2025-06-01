import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';

/**
 * Página de configuración del sistema para el administrador
 * Permite gestionar la información de la clínica, horarios, duración de citas y notificaciones
 */
const Settings = () => {
  // Estado para almacenar la configuración del sistema
  const [settings, setSettings] = useState({
    clinicName: '',
    address: '',
    phone: '',
    email: '',
    workingHours: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
      saturday: { start: '09:00', end: '13:00' },
      sunday: { start: '', end: '' }
    },
    appointmentDuration: 30,
    enableEmailNotifications: true,
    enableSMSNotifications: false
  });

  // Cargar la configuración al montar el componente
  useEffect(() => {
    // Obtener la configuración desde la API
    const fetchSettings = async () => {
      try {
        const response = await fetch('https://vetcareclinica.com/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  /**
   * Maneja los cambios en los campos de texto
   * @param {string} field - Campo a modificar
   * @param {string} value - Nuevo valor
   */
  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Maneja los cambios en los horarios de trabajo
   * @param {string} day - Día de la semana
   * @param {string} field - Campo a modificar (start/end)
   * @param {string} value - Nuevo valor
   */
  const handleWorkingHoursChange = (day, field, value) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value
        }
      }
    }));
  };

  /**
   * Maneja el envío del formulario para guardar la configuración
   */
  const handleSubmit = async () => {
    try {
      const response = await fetch('https://vetcareclinica.com/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        // Mostrar mensaje de éxito
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Clinic Settings
      </Typography>

      {/* Sección de información de la clínica */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Clinic Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Clinic Name"
              value={settings.clinicName}
              onChange={(e) => handleChange('clinicName', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={settings.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={settings.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={settings.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Sección de horarios de trabajo */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Working Hours
        </Typography>
        {Object.entries(settings.workingHours).map(([day, hours]) => (
          <Grid container spacing={2} key={day} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                {day}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={hours.start}
                onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={day === 'sunday'}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={hours.end}
                onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={day === 'sunday'}
              />
            </Grid>
          </Grid>
        ))}
      </Paper>

      {/* Sección de configuración de citas */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Appointment Settings
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Appointment Duration (minutes)"
              type="number"
              value={settings.appointmentDuration}
              onChange={(e) => handleChange('appointmentDuration', parseInt(e.target.value))}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Sección de configuración de notificaciones */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Notification Settings
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableEmailNotifications}
                  onChange={(e) => handleChange('enableEmailNotifications', e.target.checked)}
                />
              }
              label="Enable Email Notifications"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableSMSNotifications}
                  onChange={(e) => handleChange('enableSMSNotifications', e.target.checked)}
                />
              }
              label="Enable SMS Notifications"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Botón para guardar la configuración */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default Settings; 