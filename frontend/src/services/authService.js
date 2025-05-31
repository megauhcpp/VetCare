import axios from 'axios';

const API_URL = 'https://vetcareclinica.com/api';

// Configurar axios por defecto
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

const authService = {
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
            console.error('Error en login:', error.response?.data);
            throw error.response?.data || { message: 'Error al iniciar sesión' };
        }
    },

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
            console.error('Error en logout:', error.response?.data);
            throw error.response?.data || { message: 'Error al cerrar sesión' };
        }
    },

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