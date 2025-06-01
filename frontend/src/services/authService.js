import axios from 'axios';

// URL base para las peticiones a la API
const API_URL = 'https://vetcareclinica.com/api';

// Configuración global de axios para las peticiones HTTP
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

/**
 * Servicio de autenticación que maneja las operaciones relacionadas con la autenticación
 * @type {Object}
 */
const authService = {
    /**
     * Inicia sesión con las credenciales proporcionadas
     * @param {string} email - Correo electrónico del usuario
     * @param {string} password - Contraseña del usuario
     * @returns {Promise<Object>} Datos de la respuesta del servidor
     * @throws {Error} Si hay un error en el inicio de sesión
     */
    login: async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email,
                password
            }, {
                withCredentials: true,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error en inicio de sesión:', error.response?.data);
            throw error.response?.data || { message: 'Error al iniciar sesión' };
        }
    },

    /**
     * Registra un nuevo usuario
     * @param {Object} userData - Datos del usuario a registrar
     * @returns {Promise<Object>} Datos de la respuesta del servidor
     * @throws {Error} Si hay un error en el registro
     */
    register: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/register`, userData, {
                withCredentials: true,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error en registro:', error.response?.data);
            throw error.response?.data || { message: 'Error al registrar usuario' };
        }
    },

    /**
     * Cierra la sesión del usuario actual
     * @returns {Promise<void>}
     * @throws {Error} Si hay un error al cerrar sesión
     */
    logout: async () => {
        try {
            await axios.post(`${API_URL}/logout`, {}, {
                withCredentials: true,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error al cerrar sesión:', error.response?.data);
            throw error.response?.data || { message: 'Error al cerrar sesión' };
        }
    },

    /**
     * Obtiene la información del usuario actual
     * @returns {Promise<Object>} Datos del usuario actual
     * @throws {Error} Si hay un error al obtener el usuario
     */
    getCurrentUser: async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            const response = await axios.get(`${API_URL}/user`, {
                withCredentials: true,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener usuario:', error.response?.data);
            throw error.response?.data || { message: 'Error al obtener usuario' };
        }
    }
};

export default authService; 