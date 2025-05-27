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
  TableSortLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const AdminUsers = () => {
  const { users, setUsers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos');
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
  const [filters, setFilters] = useState({ nombre: '', email: '', rol: '' });
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('nombre');

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
      const url = selectedUser
        ? `/api/admin/users/${selectedUser.id_usuario}`
        : '/api/admin/users';
      
      const method = selectedUser ? 'PUT' : 'POST';
      
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al guardar el usuario');

      setSnackbar({
        open: true,
        message: `Usuario ${selectedUser ? 'actualizado' : 'creado'} exitosamente`,
        severity: 'success'
      });
      await refreshUsers();
      handleCloseDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
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
    const nombreMatch = user.nombre?.toLowerCase().includes(filters.nombre.toLowerCase()) || user.apellido?.toLowerCase().includes(filters.nombre.toLowerCase());
    const emailMatch = user.email?.toLowerCase().includes(filters.email.toLowerCase());
    const rolMatch = !filters.rol || user.rol === filters.rol;
    return nombreMatch && emailMatch && rolMatch;
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
        <Typography variant="h4" gutterBottom>
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

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Buscar por nombre"
          value={filters.nombre}
          onChange={e => setFilters(f => ({ ...f, nombre: e.target.value }))}
          variant="outlined"
          size="small"
          fullWidth
        />
        <TextField
          label="Buscar por email"
          value={filters.email}
          onChange={e => setFilters(f => ({ ...f, email: e.target.value }))}
          variant="outlined"
          size="small"
          fullWidth
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filtrar por rol</InputLabel>
          <Select
            value={filters.rol}
            onChange={e => setFilters(f => ({ ...f, rol: e.target.value }))}
            label="Filtrar por rol"
            size="small"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="admin">Administrador</MenuItem>
            <MenuItem value="veterinario">Veterinario</MenuItem>
            <MenuItem value="cliente">Cliente</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
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
            {sortedUsers.length > 0 ? (
              sortedUsers.map((user) => (
                <TableRow key={user.id_usuario}>
                  <TableCell>{user.nombre} {user.apellido}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.rol}
                      color={getRoleColor(user.rol)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
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
      </TableContainer>

      {/* Modal para crear/editar usuario */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
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
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedUser ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación para eliminar */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar al usuario {selectedUser?.nombre} {selectedUser?.apellido}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
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