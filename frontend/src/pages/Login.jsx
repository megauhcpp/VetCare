import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';
import vetcareLogo from '../vetcarelogonobg.png';

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
                // Redirigir según el rol del usuario
                if (user.rol === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            console.error('Error en login:', err);
            setError(err.message || 'Error al iniciar sesión');
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-left">
                    <img src={vetcareLogo} alt="VetCare Logo" style={{ height: 400, width: 'auto', margin: '0 auto', display: 'block' }} />
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