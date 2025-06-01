import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// URL base para las peticiones a la API
const API_URL = 'https://vetcareclinica.com/api';

/**
 * Contexto de la aplicación para manejar el estado global
 */
const AppContext = createContext();

/**
 * Proveedor del contexto de la aplicación
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 */
const AppProvider = ({ children }) => {
  const { user, token } = useAuth();
  // Estados para manejar los datos de la aplicación
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos iniciales según el rol del usuario
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user || !token) {
          setLoading(false);
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };

        if (user.rol === 'admin') {
          const [petsRes, appointmentsRes, treatmentsRes, usersRes] = await Promise.all([
            fetch(`${API_URL}/mascotas`, { headers }),
            fetch(`${API_URL}/citas`, { headers }),
            fetch(`${API_URL}/tratamientos`, { headers }),
            fetch(`${API_URL}/usuarios`, { headers })
          ]);

          if (!petsRes.ok || !appointmentsRes.ok || !treatmentsRes.ok || !usersRes.ok) {
            throw new Error('Error al obtener datos del administrador');
          }

          const petsData = await petsRes.json();
          const appointmentsData = await appointmentsRes.json();
          const treatmentsData = await treatmentsRes.json();
          const usersData = await usersRes.json();

          setPets(Array.isArray(petsData) ? petsData : (petsData.data || []));
          setAppointments(Array.isArray(appointmentsData) ? appointmentsData : (appointmentsData.data || []));
          setTreatments(Array.isArray(treatmentsData) ? treatmentsData : (treatmentsData.data || []));
          setUsers(Array.isArray(usersData) ? usersData : (usersData.data || []));
        } else if (user.rol === 'veterinario') {
          const [petsRes, appointmentsRes, treatmentsRes] = await Promise.all([
            fetch(`${API_URL}/mascotas`, { headers }),
            fetch(`${API_URL}/citas`, { headers }),
            fetch(`${API_URL}/tratamientos`, { headers })
          ]);

          if (!petsRes.ok || !appointmentsRes.ok || !treatmentsRes.ok) {
            throw new Error('Error al obtener datos del veterinario');
          }

          const petsData = await petsRes.json();
          const appointmentsData = await appointmentsRes.json();
          const treatmentsData = await treatmentsRes.json();

          const petsArray = Array.isArray(petsData) ? petsData : (petsData.data || []);
          const appointmentsArray = Array.isArray(appointmentsData) ? appointmentsData : (appointmentsData.data || []);
          const treatmentsArray = Array.isArray(treatmentsData) ? treatmentsData : (treatmentsData.data || []);

          setPets(petsArray);
          setAppointments(appointmentsArray);
          setTreatments(treatmentsArray);
        } else {
          const [petsRes, appointmentsRes, treatmentsRes] = await Promise.all([
            fetch(`${API_URL}/mascotas`, { headers }),
            fetch(`${API_URL}/citas`, { headers }),
            fetch(`${API_URL}/tratamientos`, { headers })
          ]);

          if (!petsRes.ok || !appointmentsRes.ok || !treatmentsRes.ok) {
            throw new Error('Error al obtener datos del cliente');
          }

          const petsData = await petsRes.json();
          const appointmentsData = await appointmentsRes.json();
          const treatmentsData = await treatmentsRes.json();

          const petsArray = Array.isArray(petsData) ? petsData : (petsData.data || []);
          const userPets = petsArray.filter(pet => pet.usuario?.id_usuario === user.id_usuario);
          setPets(userPets);

          const appointmentsArray = Array.isArray(appointmentsData) ? appointmentsData : (appointmentsData.data || []);
          const userAppointments = appointmentsArray.filter(appointment => 
            userPets.some(pet => pet.id_mascota === appointment.mascota?.id_mascota)
          );
          setAppointments(userAppointments);

          const treatmentsArray = Array.isArray(treatmentsData) ? treatmentsData : (treatmentsData.data || []);
          const userTreatments = treatmentsArray.filter(treatment =>
            userAppointments.some(app => app.id_cita === treatment.cita?.id_cita)
          );
          setTreatments(userTreatments);
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token]);

  // Valor del contexto que se proporciona a los componentes hijos
  const value = {
    pets,
    setPets,
    appointments,
    setAppointments,
    treatments,
    setTreatments,
    users,
    setUsers,
    loading,
    error,
    token
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Hook personalizado para acceder al contexto de la aplicación
 * @returns {Object} Contexto de la aplicación
 * @throws {Error} Si se usa fuera del AppProvider
 */
const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};

export { AppProvider, useApp }; 