import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            verifyToken();
        } else {
            setLoading(false);
        }
    }, []);

    const verifyToken = async () => {
        try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
            setError(null);
        } catch (err) {
            console.error('Error al verificar token:', err);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const response = await authService.login(email, password);
            const { token, usuario } = response;
            if (token) {
                localStorage.setItem('token', token);
                setUser(usuario);
                return usuario;
            } else {
                throw new Error('No se recibió token del servidor');
            }
        } catch (err) {
            console.error('Error en login:', err);
            setError(err.message || 'Error al iniciar sesión');
            throw err;
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const response = await authService.register(userData);
            const { token, usuario } = response;
            if (token) {
                localStorage.setItem('token', token);
                setUser(usuario);
                return usuario;
            } else {
                throw new Error('No se recibió token del servidor');
            }
        } catch (err) {
            console.error('Error en registro:', err);
            setError(err.message || 'Error al registrar');
            throw err;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (err) {
            console.error('Error en logout:', err);
        } finally {
            localStorage.removeItem('token');
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