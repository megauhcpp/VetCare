import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configuración global de axios para las peticiones HTTP
axios.defaults.baseURL = 'https://vetcareclinica.com';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.withCredentials = true; // Necesario para el manejo de CORS

/**
 * Contexto de autenticación para manejar el estado y las operaciones de autenticación
 */
const AuthContext = createContext();

/**
 * Hook personalizado para acceder al contexto de autenticación
 * @returns {Object} Contexto de autenticación
 * @throws {Error} Si se usa fuera del AuthProvider
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

/**
 * Proveedor del contexto de autenticación
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 */
export const AuthProvider = ({ children }) => {
    // Estados para manejar la autenticación
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Efecto para cargar el usuario cuando hay un token
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    /**
     * Obtiene la información del usuario autenticado
     */
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
            console.error('Error al obtener usuario:', error);
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

    /**
     * Inicia sesión con las credenciales proporcionadas
     * @param {Object} credentials - Credenciales de inicio de sesión
     * @returns {Object} Datos del usuario
     */
    const login = async (credentials) => {
        try {
            const response = await axios.post('/api/login', credentials);

            if (response.data && response.data.token) {
                const { token, usuario } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('userId', usuario.id_usuario);
                setToken(token);
                setUser(usuario);
                setIsAuthenticated(true);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    };

    /**
     * Registra un nuevo usuario
     * @param {Object} userData - Datos del usuario a registrar
     * @returns {Object} Datos del usuario registrado
     */
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

    /**
     * Cierra la sesión del usuario actual
     */
    const logout = async () => {
        try {
            await axios.post('/api/logout');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            delete axios.defaults.headers.common['Authorization'];
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    /**
     * Actualiza los datos del usuario
     * @param {Object} userData - Nuevos datos del usuario
     * @returns {Object} Datos actualizados del usuario
     */
    const updateUser = async (userData) => {
        try {
            const response = await axios.post('/api/user', userData);
            setUser(response.data);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            throw error;
        }
    };

    /**
     * Cambia la contraseña del usuario
     * @param {Object} passwordData - Datos para el cambio de contraseña
     * @returns {Object} Resultado de la operación
     */
    const changePassword = async (passwordData) => {
        try {
            const response = await axios.post('/api/user/change-password', passwordData);
            return response.data;
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            throw error;
        }
    };

    // Valor del contexto que se proporciona a los componentes hijos
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