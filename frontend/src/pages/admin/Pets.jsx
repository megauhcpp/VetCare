import React, { useState, useMemo, useEffect } from 'react';
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
  InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { especies, categoriasEspecies, sexos } from '../../data/petSpecies';

const AdminPets = () => {
  const { pets, users } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    especie: '',
    raza: '',
    fecha_nacimiento: '',
    sexo: '',
    id_usuario: '',
    notas: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [clientes, setClientes] = useState([]);

  // Extraer las mascotas del objeto de respuesta
  const petsData = useMemo(() => {
    console.log('Raw pets:', pets);
    return Array.isArray(pets) ? pets : (pets?.data || []);
  }, [pets]);

  useEffect(() => {
    // Fetch clientes (usuarios con rol cliente)
    const fetchClientes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/clientes', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setClientes(data.data || data || []);
        }
      } catch (error) {
        console.error('Error fetching clientes:', error);
      }
    };
    fetchClientes();
  }, []);

  if (!Array.isArray(pets)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const handleOpenDialog = (pet = null) => {
    if (pet) {
      setSelectedPet(pet);
      setFormData({
        nombre: pet.nombre,
        especie: pet.especie,
        raza: pet.raza,
        fecha_nacimiento: pet.fecha_nacimiento.split('T')[0],
        sexo: pet.sexo,
        id_usuario: pet.id_usuario,
        notas: pet.notas || ''
      });
    } else {
      setSelectedPet(null);
      setFormData({
        nombre: '',
        especie: '',
        raza: '',
        fecha_nacimiento: '',
        sexo: '',
        id_usuario: '',
        notas: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPet(null);
  };

  const handleOpenDeleteDialog = (pet) => {
    setSelectedPet(pet);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedPet(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEspecieChange = (e) => {
    const nuevaEspecie = e.target.value;
    setFormData({
      ...formData,
      especie: nuevaEspecie,
      raza: '' // Resetear la raza cuando cambia la especie
    });
  };

  const handleSubmit = async () => {
    try {
      const url = selectedPet
        ? `/api/pets/${selectedPet.id_mascota}`
        : '/api/pets';
      
      const method = selectedPet ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al guardar la mascota');

      setSnackbar({
        open: true,
        message: `Mascota ${selectedPet ? 'actualizada' : 'creada'} exitosamente`,
        severity: 'success'
      });
      
      handleCloseDialog();
      // Aquí deberías actualizar la lista de mascotas
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
      const response = await fetch(`/api/pets/${selectedPet.id_mascota}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar la mascota');

      setSnackbar({
        open: true,
        message: 'Mascota eliminada exitosamente',
        severity: 'success'
      });
      
      handleCloseDeleteDialog();
      // Aquí deberías actualizar la lista de mascotas
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  const filteredPets = petsData.filter(pet => {
    const searchLower = searchTerm.toLowerCase();
    return (
      pet.nombre?.toLowerCase().includes(searchLower) ||
      pet.especie?.toLowerCase().includes(searchLower) ||
      pet.raza?.toLowerCase().includes(searchLower) ||
      pet.usuario?.nombre?.toLowerCase().includes(searchLower) ||
      pet.usuario?.apellido?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Mascotas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Mascota
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar mascotas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Especie</TableCell>
              <TableCell>Raza</TableCell>
              <TableCell>Dueño</TableCell>
              <TableCell>Fecha de Nacimiento</TableCell>
              <TableCell>Sexo</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPets.length > 0 ? (
              filteredPets.map((pet) => (
                <TableRow key={pet.id_mascota}>
                  <TableCell>{pet.nombre}</TableCell>
                  <TableCell>{pet.especie}</TableCell>
                  <TableCell>{pet.raza}</TableCell>
                  <TableCell>
                    {pet.usuario?.nombre} {pet.usuario?.apellido}
                  </TableCell>
                  <TableCell>
                    {new Date(pet.fecha_nacimiento).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={pet.sexo}
                      color={pet.sexo === 'Macho' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenDialog(pet)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" onClick={() => handleOpenDeleteDialog(pet)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay mascotas registradas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para crear/editar mascota */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedPet ? 'Editar Mascota' : 'Nueva Mascota'}
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
            <FormControl fullWidth>
              <InputLabel>Especie</InputLabel>
              <Select
                name="especie"
                value={formData.especie}
                onChange={handleEspecieChange}
                label="Especie"
              >
                {Object.entries(categoriasEspecies).map(([categoria, especiesList]) => [
                  <MenuItem key={categoria} disabled sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                    {categoria}
                  </MenuItem>,
                  ...especiesList.map(especie => (
                    <MenuItem key={especie} value={especie} sx={{ pl: 4 }}>
                      {especie.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </MenuItem>
                  ))
                ])}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Raza</InputLabel>
              <Select
                name="raza"
                value={formData.raza}
                onChange={handleInputChange}
                label="Raza"
                disabled={!formData.especie}
              >
                {formData.especie && especies[formData.especie].map((raza) => (
                  <MenuItem key={raza} value={raza}>
                    {raza}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Dueño</InputLabel>
              <Select
                name="id_usuario"
                value={formData.id_usuario}
                onChange={handleInputChange}
                label="Dueño"
              >
                {clientes.map((cliente) => (
                  <MenuItem key={cliente.id_usuario} value={cliente.id_usuario}>
                    {cliente.nombre} {cliente.apellido} ({cliente.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="fecha_nacimiento"
              label="Fecha de Nacimiento"
              type="date"
              value={formData.fecha_nacimiento}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Sexo</InputLabel>
              <Select
                name="sexo"
                value={formData.sexo}
                onChange={handleInputChange}
                label="Sexo"
              >
                {sexos.map((sexo) => (
                  <MenuItem key={sexo} value={sexo}>
                    {sexo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="notas"
              label="Notas"
              value={formData.notas}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedPet ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación para eliminar */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar la mascota {selectedPet?.nombre}?
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

export default AdminPets; 