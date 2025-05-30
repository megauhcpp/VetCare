import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  Collapse,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Lock as LockIcon } from '@mui/icons-material';

const Profile = () => {
  const { user, updateUser, changePassword } = useAuth();
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false
  });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateEmail = (email) => /.+@.+\..+/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateEmail(formData.email)) {
      setError('Correo electrónico no válido.');
      return;
    }
    try {
      await updateUser(formData);
      setSuccess('Perfil actualizado correctamente');
      setError('');
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordSuccess('');
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      setPasswordMsg('Completa todos los campos de contraseña.');
      return;
    }
    if (passwordData.new.length < 8) {
      setPasswordMsg('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      setPasswordMsg('Las contraseñas nuevas no coinciden.');
      return;
    }
    try {
      await changePassword({
        current: passwordData.current,
        new: passwordData.new,
        confirm: passwordData.confirm
      });
      setPasswordSuccess('Contraseña cambiada correctamente.');
      setPasswordMsg('');
      setPasswordData({
        current: '',
        new: '',
        confirm: '',
        showCurrent: false,
        showNew: false,
        showConfirm: false
      });
      setShowPasswordForm(false);
    } catch (error) {
      setPasswordMsg(error.response?.data?.error || 'Error al cambiar la contraseña');
    }
  };

  const getInitials = () => {
    const n = formData.nombre?.trim() || '';
    const a = formData.apellido?.trim() || '';
    return (n[0] || '').toUpperCase() + (a[0] || '').toUpperCase();
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  useEffect(() => {
    if (passwordMsg || passwordSuccess) {
      const timer = setTimeout(() => {
        setPasswordMsg('');
        setPasswordSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [passwordMsg, passwordSuccess]);

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#111' }}>
        Perfil
      </Typography>
      {(error || success) && (
        <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          {error && (
            <Alert severity="error" sx={{ width: '100%', maxWidth: 500 }}>
              {error === 'Network Error' ? 'Error de red. Intenta de nuevo.' : error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ width: '100%', maxWidth: 500 }}>
              {success}
            </Alert>
          )}
        </Grid>
      )}
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  margin: '0 auto 16px',
                  bgcolor: '#e2e8f0',
                  color: '#7b61ff',
                  fontWeight: 700,
                  fontSize: 40
                }}
              >
                {getInitials()}
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {formData.nombre} {formData.apellido}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formData.email}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Button
                variant={showPasswordForm ? 'outlined' : 'contained'}
                color="primary"
                startIcon={<LockIcon />}
                onClick={() => setShowPasswordForm(v => !v)}
                fullWidth
                sx={{ mb: 1 }}
              >
                {showPasswordForm ? 'Cancelar cambio de contraseña' : 'Cambiar contraseña'}
              </Button>
              <Collapse in={showPasswordForm}>
                <Box component="form" onSubmit={handlePasswordChange} sx={{ mt: 2 }}>
                  {passwordMsg && <Alert severity="error" sx={{ mb: 1 }}>{passwordMsg}</Alert>}
                  {passwordSuccess && <Alert severity="success" sx={{ mb: 1 }}>{passwordSuccess}</Alert>}
                  <TextField
                    fullWidth
                    label="Contraseña actual"
                    type={passwordData.showCurrent ? 'text' : 'password'}
                    value={passwordData.current}
                    onChange={e => setPasswordData(d => ({ ...d, current: e.target.value }))}
                    margin="dense"
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={() => setPasswordData(d => ({ ...d, showCurrent: !d.showCurrent }))} edge="end" size="small">
                          {passwordData.showCurrent ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      )
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Nueva contraseña"
                    type={passwordData.showNew ? 'text' : 'password'}
                    value={passwordData.new}
                    onChange={e => setPasswordData(d => ({ ...d, new: e.target.value }))}
                    margin="dense"
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={() => setPasswordData(d => ({ ...d, showNew: !d.showNew }))} edge="end" size="small">
                          {passwordData.showNew ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      )
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Confirmar nueva contraseña"
                    type={passwordData.showConfirm ? 'text' : 'password'}
                    value={passwordData.confirm}
                    onChange={e => setPasswordData(d => ({ ...d, confirm: e.target.value }))}
                    margin="dense"
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={() => setPasswordData(d => ({ ...d, showConfirm: !d.showConfirm }))} edge="end" size="small">
                          {passwordData.showConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      )
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Guardar nueva contraseña
                  </Button>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent sx={{ height: 252.52, overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Editar Perfil
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Apellido"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Correo electrónico"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                    >
                      Actualizar Perfil
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile; 