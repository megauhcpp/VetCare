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

const AdminTreatments = () => {
  const { treatments } = useApp();

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
        Gestión de Tratamientos
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Descripción</TableCell>
              <TableCell>Mascota</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha Inicio</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {treatments.map((treatment) => (
              <TableRow key={treatment.id_tratamiento}>
                <TableCell>{treatment.descripcion}</TableCell>
                <TableCell>{treatment.cita?.mascota?.nombre}</TableCell>
                <TableCell>{treatment.estado}</TableCell>
                <TableCell>{treatment.fecha_inicio}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminTreatments; 