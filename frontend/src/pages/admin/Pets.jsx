import React from 'react';
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
  CircularProgress
} from '@mui/material';

const AdminPets = () => {
  const { pets } = useApp();

  if (!Array.isArray(pets)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Mascotas
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Especie</TableCell>
              <TableCell>Raza</TableCell>
              <TableCell>Dueño</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pets.map((pet) => (
              <TableRow key={pet.id_mascota}>
                <TableCell>{pet.nombre}</TableCell>
                <TableCell>{pet.especie}</TableCell>
                <TableCell>{pet.raza}</TableCell>
                <TableCell>{pet.usuario?.nombre} {pet.usuario?.apellido}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminPets; 