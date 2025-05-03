import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const user = await login({
                email: formData.email,
                password: formData.password
            });
            
            if (user) {
                if (user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            console.error('Error en login:', err);
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-left">
                    <div className="login-content">
                        <h1>VetCare</h1>
                        <p className="subtitle">Gestión de Citas Veterinarias</p>
                        <div className="features">
                            <div className="feature">
                                <i className="fas fa-calendar-check"></i>
                                <span>Gestiona tus citas</span>
                            </div>
                            <div className="feature">
                                <i className="fas fa-paw"></i>
                                <span>Historial de mascotas</span>
                            </div>
                            <div className="feature">
                                <i className="fas fa-bell"></i>
                                <span>Recordatorios automáticos</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="login-right">
                    <div className="login-form-container">
                        <h2>Bienvenido de nuevo</h2>
                        <p className="login-subtitle">Inicia sesión para continuar</p>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="form-group">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Correo Electrónico"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Contraseña"
                                    required
                                />
                            </div>
                            <button type="submit" className="login-button">
                                Iniciar Sesión
                            </button>
                        </form>
                        <p className="register-link">
                            ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;