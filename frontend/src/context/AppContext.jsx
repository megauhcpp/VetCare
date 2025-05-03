import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data based on user role
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          if (user.role === 'admin') {
            // Fetch all data for admin
            const [petsRes, appointmentsRes, treatmentsRes, usersRes] = await Promise.all([
              fetch('/api/pets'),
              fetch('/api/appointments'),
              fetch('/api/treatments'),
              fetch('/api/users')
            ]);
            
            setPets(await petsRes.json());
            setAppointments(await appointmentsRes.json());
            setTreatments(await treatmentsRes.json());
            setUsers(await usersRes.json());
          } else {
            // Fetch only user-specific data for clients
            const [petsRes, appointmentsRes, treatmentsRes] = await Promise.all([
              fetch(`/api/pets?userId=${user.id}`),
              fetch(`/api/appointments?userId=${user.id}`),
              fetch(`/api/treatments?userId=${user.id}`)
            ]);
            
            setPets(await petsRes.json());
            setAppointments(await appointmentsRes.json());
            setTreatments(await treatmentsRes.json());
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const value = {
    pets,
    setPets,
    appointments,
    setAppointments,
    treatments,
    setTreatments,
    users,
    setUsers,
    loading
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