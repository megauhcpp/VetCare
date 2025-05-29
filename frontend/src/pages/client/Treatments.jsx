import React, { useState, useMemo, useEffect } from 'react';
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
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  TableSortLabel,
  Tooltip,
  Avatar,
  TablePagination
} from '@mui/material';
import { 
  LocalHospital as TreatmentIcon, 
  ExpandMore as ExpandMoreIcon,
  Pets as PetsIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import './client-table.css';

const Treatments = () => {
  const { treatments, pets } = useApp();
  const { user } = useAuth();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('fecha'); // 'fecha', 'estado', 'dueno', 'veterinario'
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [detailsTreatment, setDetailsTreatment] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Mover hooks antes del return temprano
  const treatmentsData = useMemo(() => {
    console.log('Raw treatments:', treatments);
    return Array.isArray(treatments) ? treatments : (treatments?.data || []);
  }, [treatments]);
  
  // Filtrar mascotas del usuario actual
  const userPets = useMemo(() => {
    console.log('Raw pets:', pets);
    return pets.filter(pet => pet.usuario?.id_usuario === user?.id_usuario);
  }, [pets, user]);

  // Organizar tratamientos por mascota
  const treatmentsByPet = useMemo(() => {
    console.log('Treatments data:', treatmentsData);
    console.log('User pets:', userPets);
    
    const organized = {};
    userPets.forEach(pet => {
      organized[pet.id_mascota] = {
        pet,
        treatments: treatmentsData.filter(t => t.cita?.mascota?.id_mascota === pet.id_mascota)
      };
    });
    console.log('Organized treatments:', organized);
    return organized;
  }, [userPets, treatmentsData]);

  if (!Array.isArray(treatments) || !Array.isArray(pets)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completado':
        return 'success';
      case 'activo':
        return 'primary';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const allTreatments = Object.values(treatmentsByPet).flatMap(obj => obj.treatments);
  const filteredTreatments = allTreatments.filter(treatment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      treatment.nombre?.toLowerCase().includes(searchLower) ||
      treatment.cita?.mascota?.nombre?.toLowerCase().includes(searchLower) ||
      treatment.cita?.veterinario?.nombre?.toLowerCase().includes(searchLower) ||
      treatment.cita?.veterinario?.apellido?.toLowerCase().includes(searchLower) ||
      treatment.estado?.toLowerCase().includes(searchLower)
    );
  });
  const sortedTreatments = [...filteredTreatments].sort((a, b) => {
    if (orderBy === 'fecha') {
      if (order === 'asc') {
        return new Date(a.fecha_inicio) - new Date(b.fecha_inicio);
      } else {
        return new Date(b.fecha_inicio) - new Date(a.fecha_inicio);
      }
    } else if (orderBy === 'estado') {
      if (order === 'asc') {
        return (a.estado || '').localeCompare(b.estado || '');
      } else {
        return (b.estado || '').localeCompare(a.estado || '');
      }
    } else if (orderBy === 'dueno') {
      const aName = (a.cita?.mascota?.usuario?.nombre || '') + ' ' + (a.cita?.mascota?.usuario?.apellido || '');
      const bName = (b.cita?.mascota?.usuario?.nombre || '') + ' ' + (b.cita?.mascota?.usuario?.apellido || '');
      if (order === 'asc') {
        return aName.localeCompare(bName);
      } else {
        return bName.localeCompare(aName);
      }
    } else if (orderBy === 'veterinario') {
      const aVet = (a.cita?.veterinario?.nombre || '') + ' ' + (a.cita?.veterinario?.apellido || '');
      const bVet = (b.cita?.veterinario?.nombre || '') + ' ' + (b.cita?.veterinario?.apellido || '');
      if (order === 'asc') {
        return aVet.localeCompare(bVet);
      } else {
        return bVet.localeCompare(aVet);
      }
    }
    return 0;
  });

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#111', textAlign: 'left' }}>
          Tratamientos de Mis Mascotas
        </Typography>
      </Box>
      <input
        className="client-search-bar"
        placeholder="Buscar tratamiento, mascota, veterinario..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#222' }}
      />
      <TableContainer component={Paper} sx={{ 
        borderRadius: '12px',
        boxShadow: '0 1px 6px rgba(60,60,60,0.07)'
      }}>
        <Table className="client-table">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'mascota'}
                  direction={orderBy === 'mascota' ? order : 'asc'}
                  onClick={() => handleRequestSort('mascota')}
                >
                  Mascota
                </TableSortLabel>
              </TableCell>
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
                  active={orderBy === 'veterinario'}
                  direction={orderBy === 'veterinario' ? order : 'asc'}
                  onClick={() => handleRequestSort('veterinario')}
                >
                  Veterinario
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'fecha'}
                  direction={orderBy === 'fecha' ? order : 'asc'}
                  onClick={() => handleRequestSort('fecha')}
                >
                  Fecha de Inicio
                </TableSortLabel>
              </TableCell>
              <TableCell>Fecha de Fin</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'estado'}
                  direction={orderBy === 'estado' ? order : 'asc'}
                  onClick={() => handleRequestSort('estado')}
                >
                  Estado
                </TableSortLabel>
              </TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTreatments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length > 0 ? (
              sortedTreatments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((treatment) => (
                <TableRow key={treatment.id_tratamiento}>
                  <TableCell>{treatment.cita?.mascota?.nombre}</TableCell>
                  <TableCell>{treatment.nombre}</TableCell>
                  <TableCell>{treatment.cita?.veterinario?.nombre} {treatment.cita?.veterinario?.apellido}</TableCell>
                  <TableCell>{formatDate(treatment.fecha_inicio)}</TableCell>
                  <TableCell>{treatment.fecha_fin ? formatDate(treatment.fecha_fin) : '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={treatment.estado}
                      color={getStatusColor(treatment.estado)}
                      size="small"
                      sx={{ minWidth: 110, maxWidth: 110, justifyContent: 'center', fontWeight: 600, color: 'white', textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    {typeof treatment.precio === 'number' || !isNaN(Number(treatment.precio))
                      ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(treatment.precio))
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Ver detalles">
                      <IconButton size="small" onClick={() => { setDetailsTreatment(treatment); setOpenDetailsDialog(true); }}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No hay tratamientos registrados para tus mascotas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sortedTreatments.length}
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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* Modal de detalles de tratamiento */}
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
            <PetsIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ letterSpacing: 1 }}>Tratamiento</Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontStyle: 'italic' }}>{detailsTreatment?.cita?.mascota?.nombre}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent className="client-modal-content" sx={{ pt: 0 }}>
          {detailsTreatment && (
            <Box sx={{
              display: 'flex', flexDirection: 'column', gap: 2, mt: 1,
              bgcolor: 'rgba(255,255,255,0.85)', borderRadius: 2, p: 2, boxShadow: '0 2px 8px rgba(33,150,243,0.04)'
            }}>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Nombre</Typography>
                <Typography fontWeight={500}>{detailsTreatment.nombre}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Veterinario</Typography>
                <Typography fontWeight={500}>{detailsTreatment.cita?.veterinario?.nombre} {detailsTreatment.cita?.veterinario?.apellido}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Fecha de Inicio</Typography>
                <Typography fontWeight={500}>{detailsTreatment.fecha_inicio ? new Date(detailsTreatment.fecha_inicio).toLocaleDateString() : '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Fecha de Fin</Typography>
                <Typography fontWeight={500}>{detailsTreatment.fecha_fin ? new Date(detailsTreatment.fecha_fin).toLocaleDateString() : '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Precio</Typography>
                <Typography fontWeight={500}>{typeof detailsTreatment.precio === 'number' || !isNaN(Number(detailsTreatment.precio)) ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(detailsTreatment.precio)) : '-'}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">Descripción</Typography>
                <Typography sx={{ minHeight: 40, fontStyle: detailsTreatment.descripcion ? 'normal' : 'italic', color: detailsTreatment.descripcion ? 'text.primary' : 'text.secondary', fontWeight: 400, fontSize: 15, textAlign: 'right' }}>{detailsTreatment.descripcion || 'Sin descripción'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Estado</Typography>
                <Typography fontWeight={500}>{detailsTreatment.estado}</Typography>
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
    </Box>
  );
};

export default Treatments; 