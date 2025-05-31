import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configuración global de axios
axios.defaults.baseURL = 'https://vetcareclinica.com';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.withCredentials = true; // Importante para CORS

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await axios.get('/api/user');
            if (response.data) {
                setUser(response.data);
                setIsAuthenticated(true);
                // Guardar el ID del usuario en localStorage para uso posterior
                localStorage.setItem('userId', response.data.id_usuario);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            delete axios.defaults.headers.common['Authorization'];
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            console.log('Enviando credenciales:', credentials);
            
            const response = await axios.post('/api/login', credentials);
            console.log('Respuesta del servidor:', response.data);

            if (response.data && response.data.token) {
                const { token, usuario } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('userId', usuario.id_usuario);
                setToken(token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUser(usuario);
                setIsAuthenticated(true);
                return usuario;
            }
            throw new Error('Respuesta inválida del servidor');
        } catch (error) {
            console.error('Error completo:', error);
            throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('/api/register', userData);

            if (response.data && response.data.token) {
                const { token, usuario } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('userId', usuario.id_usuario);
                setToken(token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUser(usuario);
                setIsAuthenticated(true);
                return usuario;
            }
            throw new Error('Respuesta inválida del servidor');
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error en el registro');
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            delete axios.defaults.headers.common['Authorization'];
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const updateUser = async (userData) => {
        try {
            const response = await axios.post('/api/user', userData);
            setUser(response.data);
            return response.data;
        } catch (error) {
            console.error('Update user error:', error);
            throw error;
        }
    };

    const changePassword = async (passwordData) => {
        try {
            const response = await axios.post('/api/user/change-password', passwordData);
            return response.data;
        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        changePassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 