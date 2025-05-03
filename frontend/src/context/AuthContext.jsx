import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configuración global de axios
axios.defaults.baseURL = 'http://localhost:8000';
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const response = await axios.get('/api/user');
            if (response.data) {
                setUser(response.data);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
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
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUser(usuario);
                return usuario;
            }
            throw new Error('Respuesta inválida del servidor: No se recibió token');
        } catch (error) {
            console.error('Error completo:', error);
            
            if (error.response) {
                console.error('Datos de error:', error.response.data);
                
                if (error.response.status === 422) {
                    throw new Error(error.response.data.message || 'Datos de entrada inválidos');
                } else if (error.response.status === 401) {
                    throw new Error('Credenciales inválidas');
                } else {
                    throw new Error(error.response.data.message || 'Error en el servidor');
                }
            } else if (error.request) {
                console.error('No se recibió respuesta:', error.request);
                throw new Error('No se recibió respuesta del servidor');
            } else {
                console.error('Error de configuración:', error.message);
                throw new Error('Error al configurar la solicitud: ' + error.message);
            }
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('/api/register', userData);

            if (response.data && response.data.token) {
                const { token, usuario } = response.data;
                localStorage.setItem('token', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUser(usuario);
                return usuario;
            }
            throw new Error('Respuesta inválida del servidor');
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Error en el registro');
            }
            throw error;
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
        }
    };

    const updateUser = async (userData) => {
        try {
            const response = await axios.put('/api/user', userData);
            setUser(response.data);
            return response.data;
        } catch (error) {
            console.error('Update user error:', error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 