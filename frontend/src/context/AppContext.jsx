import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const API_URL = 'https://vetcareclinica.com/api';

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data based on user role
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user || !token) {
          console.log('No user or token available');
          setLoading(false);
          return;
        }

        console.log('Fetching data for user:', user);
        console.log('Using token:', token);

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };

        if (user.rol === 'admin') {
          // Fetch all data for admin
          const [petsRes, appointmentsRes, treatmentsRes, usersRes] = await Promise.all([
            fetch(`${API_URL}/mascotas`, { headers }),
            fetch(`${API_URL}/citas`, { headers }),
            fetch(`${API_URL}/tratamientos`, { headers }),
            fetch(`${API_URL}/usuarios`, { headers })
          ]);
          
          if (!petsRes.ok) throw new Error('Error fetching pets');
          if (!appointmentsRes.ok) throw new Error('Error fetching appointments');
          if (!treatmentsRes.ok) throw new Error('Error fetching treatments');
          if (!usersRes.ok) throw new Error('Error fetching users');
          
          const petsData = await petsRes.json();
          const appointmentsData = await appointmentsRes.json();
          const treatmentsData = await treatmentsRes.json();
          const usersData = await usersRes.json();

          console.log('ADMIN DATA:', { petsData, appointmentsData, treatmentsData, usersData });

          setPets(Array.isArray(petsData) ? petsData : (petsData.data || []));
          setAppointments(Array.isArray(appointmentsData) ? appointmentsData : (appointmentsData.data || []));
          setTreatments(Array.isArray(treatmentsData) ? treatmentsData : (treatmentsData.data || []));
          setUsers(Array.isArray(usersData) ? usersData : (usersData.data || []));
        } else if (user.rol === 'veterinario') {
          console.log('Fetching data for veterinarian');
          // Fetch all data for veterinarian
          const [petsRes, appointmentsRes, treatmentsRes] = await Promise.all([
            fetch(`${API_URL}/mascotas`, { headers }),
            fetch(`${API_URL}/citas`, { headers }),
            fetch(`${API_URL}/tratamientos`, { headers })
          ]);
          
          if (!petsRes.ok) {
            console.error('Error response from pets:', await petsRes.text());
            throw new Error('Error fetching pets');
          }
          if (!appointmentsRes.ok) {
            console.error('Error response from appointments:', await appointmentsRes.text());
            throw new Error('Error fetching appointments');
          }
          if (!treatmentsRes.ok) {
            console.error('Error response from treatments:', await treatmentsRes.text());
            throw new Error('Error fetching treatments');
          }
          
          const petsData = await petsRes.json();
          const appointmentsData = await appointmentsRes.json();
          const treatmentsData = await treatmentsRes.json();

          console.log('VETERINARIO DATA:', { petsData, appointmentsData, treatmentsData });

          // Veterinarians can see all pets, appointments, and treatments
          const petsArray = Array.isArray(petsData) ? petsData : (petsData.data || []);
          const appointmentsArray = Array.isArray(appointmentsData) ? appointmentsData : (appointmentsData.data || []);
          const treatmentsArray = Array.isArray(treatmentsData) ? treatmentsData : (treatmentsData.data || []);

          console.log('VETERINARIO PROCESSED DATA:', {
            pets: petsArray,
            appointments: appointmentsArray,
            treatments: treatmentsArray
          });

          setPets(petsArray);
          setAppointments(appointmentsArray);
          setTreatments(treatmentsArray);
        } else {
          // Fetch only user-specific data for clients
          console.log('Fetching data for client');
          const [petsRes, appointmentsRes, treatmentsRes] = await Promise.all([
            fetch(`${API_URL}/mascotas`, { headers }),
            fetch(`${API_URL}/citas`, { headers }),
            fetch(`${API_URL}/tratamientos`, { headers })
          ]);
          
          if (!petsRes.ok) {
            console.error('Error response from pets:', await petsRes.text());
            throw new Error('Error fetching pets');
          }
          if (!appointmentsRes.ok) {
            console.error('Error response from appointments:', await appointmentsRes.text());
            throw new Error('Error fetching appointments');
          }
          if (!treatmentsRes.ok) {
            console.error('Error response from treatments:', await treatmentsRes.text());
            throw new Error('Error fetching treatments');
          }
          
          const petsData = await petsRes.json();
          const appointmentsData = await appointmentsRes.json();
          const treatmentsData = await treatmentsRes.json();

          console.log('CLIENTE DATA RAW:', { petsData, appointmentsData, treatmentsData });

          // Process pets data
          const petsArray = Array.isArray(petsData) ? petsData : (petsData.data || []);
          console.log('CLIENTE petsArray:', petsArray);
          console.log('CLIENTE user.id_usuario:', user.id_usuario);
          
          const userPets = petsArray.filter(pet => {
            console.log('Checking pet:', pet);
            console.log('Pet id_usuario:', pet.usuario?.id_usuario);
            console.log('User id_usuario:', user.id_usuario);
            console.log('Are they equal?', pet.usuario?.id_usuario === user.id_usuario);
            return pet.usuario?.id_usuario === user.id_usuario;
          });
          console.log('CLIENTE userPets:', userPets);
          setPets(userPets);

          // Process appointments data
          const appointmentsArray = Array.isArray(appointmentsData) ? appointmentsData : (appointmentsData.data || []);
          console.log('CLIENTE appointmentsArray:', appointmentsArray);
          
          const userAppointments = appointmentsArray.filter(appointment => {
            console.log('Checking appointment:', appointment);
            console.log('Appointment id_mascota:', appointment.mascota?.id_mascota);
            console.log('User pets:', userPets.map(pet => pet.id_mascota));
            return userPets.some(pet => pet.id_mascota === appointment.mascota?.id_mascota);
          });
          console.log('CLIENTE userAppointments:', userAppointments);
          setAppointments(userAppointments);

          // Process treatments data
          const treatmentsArray = Array.isArray(treatmentsData) ? treatmentsData : (treatmentsData.data || []);
          console.log('CLIENTE treatmentsArray:', treatmentsArray);
          
          const userTreatments = treatmentsArray.filter(treatment => {
            console.log('Checking treatment:', treatment);
            console.log('Treatment id_cita:', treatment.cita?.id_cita);
            console.log('User appointments:', userAppointments.map(app => app.id_cita));
            return userAppointments.some(appointment => appointment.id_cita === treatment.cita?.id_cita);
          });
          console.log('CLIENTE userTreatments:', userTreatments);
          setTreatments(userTreatments);

          // Log final state
          console.log('CLIENTE FINAL STATE:', {
            pets: userPets,
            appointments: userAppointments,
            treatments: userTreatments
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token]);

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

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export { AppProvider, useApp }; 