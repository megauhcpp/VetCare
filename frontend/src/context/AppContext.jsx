import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const API_URL = 'http://localhost:8000/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data based on user role
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user && token) {
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
            
            setPets(await petsRes.json());
            setAppointments(await appointmentsRes.json());
            setTreatments(await treatmentsRes.json());
            setUsers(await usersRes.json());
          } else {
            // Fetch only user-specific data for clients
            const [petsRes, appointmentsRes, treatmentsRes] = await Promise.all([
              fetch(`${API_URL}/mascotas`, { headers }),
              fetch(`${API_URL}/citas`, { headers }),
              fetch(`${API_URL}/tratamientos`, { headers })
            ]);
            
            if (!petsRes.ok) throw new Error('Error fetching pets');
            if (!appointmentsRes.ok) throw new Error('Error fetching appointments');
            if (!treatmentsRes.ok) throw new Error('Error fetching treatments');
            
            const petsData = await petsRes.json();
            const appointmentsData = await appointmentsRes.json();
            const treatmentsData = await treatmentsRes.json();

            // Filtrar mascotas por el usuario actual
            const userPets = petsData.filter(pet => pet.id_usuario === user.id_usuario);
            setPets(userPets);
            setAppointments(appointmentsData);
            setTreatments(treatmentsData);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
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
    token
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}; 