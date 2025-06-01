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
          console.log('No hay usuario o token disponible');
          setLoading(false);
          return;
        }

        console.log('Obteniendo datos para el usuario:', user);
        console.log('Usando token:', token);

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };

        if (user.rol === 'admin') {
          // Obtener todos los datos para el administrador
          const [petsRes, appointmentsRes, treatmentsRes, usersRes] = await Promise.all([
            fetch(`${API_URL}/mascotas`, { headers }),
            fetch(`${API_URL}/citas`, { headers }),
            fetch(`${API_URL}/tratamientos`, { headers }),
            fetch(`${API_URL}/usuarios`, { headers })
          ]);
          
          if (!petsRes.ok) throw new Error('Error al obtener mascotas');
          if (!appointmentsRes.ok) throw new Error('Error al obtener citas');
          if (!treatmentsRes.ok) throw new Error('Error al obtener tratamientos');
          if (!usersRes.ok) throw new Error('Error al obtener usuarios');
          
          const petsData = await petsRes.json();
          const appointmentsData = await appointmentsRes.json();
          const treatmentsData = await treatmentsRes.json();
          const usersData = await usersRes.json();

          console.log('DATOS DEL ADMINISTRADOR:', { petsData, appointmentsData, treatmentsData, usersData });

          setPets(Array.isArray(petsData) ? petsData : (petsData.data || []));
          setAppointments(Array.isArray(appointmentsData) ? appointmentsData : (appointmentsData.data || []));
          setTreatments(Array.isArray(treatmentsData) ? treatmentsData : (treatmentsData.data || []));
          setUsers(Array.isArray(usersData) ? usersData : (usersData.data || []));
        } else if (user.rol === 'veterinario') {
          console.log('Obteniendo datos para el veterinario');
          // Obtener todos los datos para el veterinario
          const [petsRes, appointmentsRes, treatmentsRes] = await Promise.all([
            fetch(`${API_URL}/mascotas`, { headers }),
            fetch(`${API_URL}/citas`, { headers }),
            fetch(`${API_URL}/tratamientos`, { headers })
          ]);
          
          if (!petsRes.ok) {
            console.error('Error en la respuesta de mascotas:', await petsRes.text());
            throw new Error('Error al obtener mascotas');
          }
          if (!appointmentsRes.ok) {
            console.error('Error en la respuesta de citas:', await appointmentsRes.text());
            throw new Error('Error al obtener citas');
          }
          if (!treatmentsRes.ok) {
            console.error('Error en la respuesta de tratamientos:', await treatmentsRes.text());
            throw new Error('Error al obtener tratamientos');
          }
          
          const petsData = await petsRes.json();
          const appointmentsData = await appointmentsRes.json();
          const treatmentsData = await treatmentsRes.json();

          console.log('DATOS DEL VETERINARIO:', { petsData, appointmentsData, treatmentsData });

          // Los veterinarios pueden ver todas las mascotas, citas y tratamientos
          const petsArray = Array.isArray(petsData) ? petsData : (petsData.data || []);
          const appointmentsArray = Array.isArray(appointmentsData) ? appointmentsData : (appointmentsData.data || []);
          const treatmentsArray = Array.isArray(treatmentsData) ? treatmentsData : (treatmentsData.data || []);

          console.log('DATOS PROCESADOS DEL VETERINARIO:', {
            pets: petsArray,
            appointments: appointmentsArray,
            treatments: treatmentsArray
          });

          setPets(petsArray);
          setAppointments(appointmentsArray);
          setTreatments(treatmentsArray);
        } else {
          // Obtener solo datos específicos del usuario para clientes
          console.log('Obteniendo datos para el cliente');
          const [petsRes, appointmentsRes, treatmentsRes] = await Promise.all([
            fetch(`${API_URL}/mascotas`, { headers }),
            fetch(`${API_URL}/citas`, { headers }),
            fetch(`${API_URL}/tratamientos`, { headers })
          ]);
          
          if (!petsRes.ok) {
            console.error('Error en la respuesta de mascotas:', await petsRes.text());
            throw new Error('Error al obtener mascotas');
          }
          if (!appointmentsRes.ok) {
            console.error('Error en la respuesta de citas:', await appointmentsRes.text());
            throw new Error('Error al obtener citas');
          }
          if (!treatmentsRes.ok) {
            console.error('Error en la respuesta de tratamientos:', await treatmentsRes.text());
            throw new Error('Error al obtener tratamientos');
          }
          
          const petsData = await petsRes.json();
          const appointmentsData = await appointmentsRes.json();
          const treatmentsData = await treatmentsRes.json();

          console.log('DATOS CRUDOS DEL CLIENTE:', { petsData, appointmentsData, treatmentsData });

          // Procesar datos de mascotas
          const petsArray = Array.isArray(petsData) ? petsData : (petsData.data || []);
          console.log('Mascotas del cliente:', petsArray);
          console.log('ID del usuario:', user.id_usuario);
          
          const userPets = petsArray.filter(pet => {
            console.log('Verificando mascota:', pet);
            console.log('ID de usuario de la mascota:', pet.usuario?.id_usuario);
            console.log('ID del usuario:', user.id_usuario);
            console.log('¿Son iguales?', pet.usuario?.id_usuario === user.id_usuario);
            return pet.usuario?.id_usuario === user.id_usuario;
          });
          console.log('Mascotas del usuario:', userPets);
          setPets(userPets);

          // Procesar datos de citas
          const appointmentsArray = Array.isArray(appointmentsData) ? appointmentsData : (appointmentsData.data || []);
          console.log('Citas del cliente:', appointmentsArray);
          
          const userAppointments = appointmentsArray.filter(appointment => {
            console.log('Verificando cita:', appointment);
            console.log('ID de mascota de la cita:', appointment.mascota?.id_mascota);
            console.log('Mascotas del usuario:', userPets.map(pet => pet.id_mascota));
            return userPets.some(pet => pet.id_mascota === appointment.mascota?.id_mascota);
          });
          console.log('Citas del usuario:', userAppointments);
          setAppointments(userAppointments);

          // Procesar datos de tratamientos
          const treatmentsArray = Array.isArray(treatmentsData) ? treatmentsData : (treatmentsData.data || []);
          console.log('Tratamientos del cliente:', treatmentsArray);
          
          const userTreatments = treatmentsArray.filter(treatment => {
            console.log('Verificando tratamiento:', treatment);
            console.log('ID de cita del tratamiento:', treatment.cita?.id_cita);
            console.log('Citas del usuario:', userAppointments.map(app => app.id_cita));
            return userAppointments.some(appointment => appointment.id_cita === treatment.cita?.id_cita);
          });
          console.log('Tratamientos del usuario:', userTreatments);
          setTreatments(userTreatments);

          // Registrar estado final
          console.log('ESTADO FINAL DEL CLIENTE:', {
            pets: userPets,
            appointments: userAppointments,
            treatments: userTreatments
          });
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