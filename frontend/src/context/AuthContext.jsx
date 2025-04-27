import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Configurar axios por defecto
    axios.defaults.baseURL = 'http://localhost:8000/api';
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.withCredentials = true;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            verifyToken();
        } else {
            setLoading(false);
        }
    }, []);

    const verifyToken = async () => {
        try {
            const response = await axios.get('/user');
            setUser(response.data);
            setError(null);
        } catch (err) {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post('/login', {
                email,
                password
            }, {
                withCredentials: true
            });
            const { token, usuario } = response.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(usuario);
            setError(null);
            return usuario;
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
            throw err;
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('/register', userData, {
                withCredentials: true
            });
            const { token, usuario } = response.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(usuario);
            setError(null);
            return usuario;
        } catch (err) {
            setError(err.response?.data?.message || 'Error al registrar');
            throw err;
        }
    };

    const logout = async () => {
        try {
            await axios.post('/logout', {}, {
                withCredentials: true
            });
        } catch (err) {
            console.error('Error al cerrar sesión:', err);
        } finally {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            login,
            register,
            logout,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
}; 