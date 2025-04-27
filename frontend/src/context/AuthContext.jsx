import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Aquí podrías hacer una petición para verificar el token
            // y obtener los datos del usuario
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:8000/api/login', {
                email,
                password
            });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            setError(null);
            return user;
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
            throw err;
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('http://localhost:8000/api/register', userData);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            setError(null);
            return user;
        } catch (err) {
            setError(err.response?.data?.message || 'Error al registrar');
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
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