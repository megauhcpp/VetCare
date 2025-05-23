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

const AdminAppointments = () => {
  const { appointments } = useApp();

  if (!Array.isArray(appointments)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Citas
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Hora</TableCell>
              <TableCell>Mascota</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id_cita}>
                <TableCell>{appointment.fecha}</TableCell>
                <TableCell>{appointment.hora}</TableCell>
                <TableCell>{appointment.mascota?.nombre}</TableCell>
                <TableCell>{appointment.motivo}</TableCell>
                <TableCell>{appointment.estado}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminAppointments; 