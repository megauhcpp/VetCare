import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Chip,
  InputAdornment,
  TableSortLabel,
  Avatar,
  Divider,
  TablePagination
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Pets as PetsIcon
} from '@mui/icons-material';
import '../client/client-table.css';

const AdminUsers = () => {
  const { users, setUsers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'cliente'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('nombre');
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [detailsUser, setDetailsUser] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Extraer los usuarios del objeto de respuesta
  const usersData = useMemo(() => {
    console.log('Raw users:', users);
    return Array.isArray(users) ? users : (users?.data || []);
  }, [users]);

  if (!Array.isArray(users)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const handleOpenDialog = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        password: '', // No mostramos la contraseña actual
        rol: user.rol
      });
    } else {
      setSelectedUser(null);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        rol: 'cliente'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleOpenDeleteDialog = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://vetcareclinica.com';
      const url = selectedUser
        ? `${apiUrl}/api/admin/users/${selectedUser.id_usuario}`
        : `${apiUrl}/api/admin/users`;
      
      const method = selectedUser ? 'PUT' : 'POST';
      
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({
          open: true,
          message: 'No hay token de autenticación',
          severity: 'error'
        });
        return;
      }

      // Si es una actualización y no se proporcionó contraseña, no la enviamos
      const dataToSend = selectedUser && !formData.password
        ? {
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email,
            rol: formData.rol
          }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar el usuario');
      }

      setSnackbar({
        open: true,
        message: `Usuario ${selectedUser ? 'actualizado' : 'creado'} exitosamente`,
        severity: 'success'
      });
      await refreshUsers();
      handleCloseDialog();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Error al guardar el usuario',
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${selectedUser.id_usuario}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar el usuario');
      }

      setSnackbar({
        open: true,
        message: 'Usuario eliminado exitosamente',
        severity: 'success'
      });
      await refreshUsers();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Error al eliminar el usuario',
        severity: 'error'
      });
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'veterinario':
        return 'primary';
      case 'cliente':
        return 'success';
      default:
        return 'default';
    }
  };

  const filteredUsers = usersData.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.nombre?.toLowerCase().includes(searchLower) ||
      user.apellido?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.rol?.toLowerCase().includes(searchLower)
    );
  });

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (orderBy === 'nombre') {
      const aName = (a.nombre || '') + ' ' + (a.apellido || '');
      const bName = (b.nombre || '') + ' ' + (b.apellido || '');
      if (order === 'asc') {
        return aName.localeCompare(bName);
      } else {
        return bName.localeCompare(aName);
      }
    } else if (orderBy === 'email') {
      if (order === 'asc') {
        return (a.email || '').localeCompare(b.email || '');
      } else {
        return (b.email || '').localeCompare(a.email || '');
      }
    } else if (orderBy === 'rol') {
      if (order === 'asc') {
        return (a.rol || '').localeCompare(b.rol || '');
      } else {
        return (b.rol || '').localeCompare(a.rol || '');
      }
    }
    return 0;
  });

  // Función para refrescar la lista de usuarios
  const refreshUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (e) { /* opcional: manejar error */ }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#111' }}>
          Gestión de Usuarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <Box sx={{ mb: 2, width: '100%' }}>
        <input
          className="client-search-bar"
          placeholder="Buscar por nombre, email o rol..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#222', width: '100%' }}
        />
      </Box>

      <div className="table-container">
        <TableContainer component={Paper} sx={{ 
          borderRadius: '12px',
          boxShadow: '0 1px 6px rgba(60,60,60,0.07)',
          width: '100%'
        }}>
          <Table className="client-table">
            <TableHead>
              <TableRow>
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
                    active={orderBy === 'email'}
                    direction={orderBy === 'email' ? order : 'asc'}
                    onClick={() => handleRequestSort('email')}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'rol'}
                    direction={orderBy === 'rol' ? order : 'asc'}
                    onClick={() => handleRequestSort('rol')}
                  >
                    Rol
                  </TableSortLabel>
                </TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length > 0 ? (
                sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                  <TableRow key={user.id_usuario}>
                    <TableCell>{user.nombre} {user.apellido}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.rol}
                        color={getRoleColor(user.rol)}
                        size="small"
                        sx={{ minWidth: 110, maxWidth: 110, justifyContent: 'center', fontWeight: 600, textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Ver detalles">
                          <IconButton size="small" onClick={() => { setDetailsUser(user); setOpenDetailsDialog(true); }}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleOpenDialog(user)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" onClick={() => handleOpenDeleteDialog(user)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No hay usuarios registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={sortedUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`}
            sx={{
              background: '#fff',
              borderTop: 'none',
              borderRadius: '0 0 12px 12px',
              boxShadow: '0 1px 6px rgba(60,60,60,0.07)',
              padding: 0,
              '.MuiTablePagination-toolbar': { minHeight: 40, paddingLeft: 2, paddingRight: 2 },
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: 15 },
              '.MuiTablePagination-actions': { marginRight: 1 }
            }}
          />
        </TableContainer>
      </div>

      {/* Modal para crear/editar usuario */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        className="client-modal"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(33,150,243,0.10)'
          }
        }}
      >
        <DialogTitle className="client-modal-title">
          {selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent className="client-modal-content">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              name="nombre"
              label="Nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="apellido"
              label="Apellido"
              value={formData.apellido}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="password"
              label={selectedUser ? "Nueva Contraseña (dejar en blanco para mantener la actual)" : "Contraseña"}
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                name="rol"
                value={formData.rol}
                onChange={handleInputChange}
                label="Rol"
              >
                <MenuItem value="veterinario">Veterinario</MenuItem>
                <MenuItem value="cliente">Cliente</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions className="client-modal-actions">
          <Button onClick={handleCloseDialog} className="client-create-btn" style={{ background: '#f5f5f5', color: '#1769aa' }}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="client-create-btn" variant="contained">
            {selectedUser ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación para eliminar */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(244,67,54,0.13)',
          p: 2,
          minWidth: 350,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #fff 60%, #ffebee 100%)'
        }
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, pb: 0, pt: 2 }}>
          <DeleteIcon sx={{ color: '#f44336', fontSize: 48, mb: 1 }} />
          <Typography variant="h6" fontWeight={700} color="error.main">Confirmar Eliminación</Typography>
        </Box>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>¿Estás seguro de que deseas eliminar al usuario {selectedUser?.nombre} {selectedUser?.apellido}?</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
          <Button onClick={handleCloseDeleteDialog} sx={{ bgcolor: '#f5f5f5', color: '#1769aa', borderRadius: 2 }}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained" sx={{ borderRadius: 2 }}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de detalles de usuario */}
      <Dialog 
        open={openDetailsDialog} 
        onClose={() => setOpenDetailsDialog(false)}
        maxWidth="sm"
        fullWidth
        className="client-modal"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(33,150,243,0.13)',
            background: 'linear-gradient(135deg, #f8fafc 60%, #e3f2fd 100%)'
          }
        }}
      >
        <DialogTitle className="client-modal-title" sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 0 }}>
          <Avatar sx={{ bgcolor: '#1976d2', width: 48, height: 48 }}>
            {detailsUser?.nombre ? detailsUser.nombre.charAt(0).toUpperCase() : <PetsIcon sx={{ fontSize: 32 }} />}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ letterSpacing: 1 }}>{detailsUser?.nombre} {detailsUser?.apellido}</Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontStyle: 'italic' }}>{detailsUser?.rol}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent className="client-modal-content" sx={{ pt: 0 }}>
          {detailsUser && (
            <Box sx={{
              display: 'flex', flexDirection: 'column', gap: 2, mt: 1,
              bgcolor: 'rgba(255,255,255,0.85)', borderRadius: 2, p: 2, boxShadow: '0 2px 8px rgba(33,150,243,0.04)'
            }}>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography fontWeight={500}>{detailsUser.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Rol</Typography>
                <Typography fontWeight={500}>{detailsUser.rol}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions className="client-modal-actions">
          <Button onClick={() => setOpenDetailsDialog(false)} className="client-create-btn" style={{ background: '#f5f5f5', color: '#1769aa' }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminUsers; 