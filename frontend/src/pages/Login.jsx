import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';
import vetcareLogo from '../vetcarelogonobg.png';
import { Visibility, VisibilityOff } from '@mui/icons-material';

/**
 * Página de inicio de sesión
 * Permite a los usuarios iniciar sesión con su correo y contraseña
 */
const Login = () => {
    // Estado para los datos del formulario
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    // Estado para controlar la visibilidad de la contraseña
    const [showPassword, setShowPassword] = useState(false);

    /**
     * Maneja los cambios en los campos del formulario
     * @param {Event} e - Evento del cambio en el input
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /**
     * Maneja el envío del formulario de inicio de sesión
     * @param {Event} e - Evento del submit del formulario
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Realizar la petición de inicio de sesión
            const response = await fetch('https://vetcareclinica.com/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            // Intentar iniciar sesión con las credenciales
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
            console.error('Error en inicio de sesión:', err);
            setError(err.message || 'Error al iniciar sesión');
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Sección izquierda con el logo */}
                <div className="login-left">
                    <img src={vetcareLogo} alt="VetCare Logo" style={{ height: 400, width: 'auto', margin: '0 auto', display: 'block' }} />
                </div>
                
                {/* Sección derecha con el formulario */}
                <div className="login-right">
                    <div className="login-form-container">
                        <h2>Bienvenido de nuevo</h2>
                        <p className="login-subtitle">Inicia sesión para continuar</p>
                        {error && <div className="error-message">{error}</div>}
                        
                        {/* Formulario de inicio de sesión */}
                        <form onSubmit={handleSubmit} className="login-form">
                            {/* Campo de correo electrónico */}
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
                            
                            {/* Campo de contraseña con toggle de visibilidad */}
                            <div className="form-group" style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Contraseña"
                                    required
                                />
                                <span
                                    className="password-toggle"
                                    onClick={() => setShowPassword((v) => !v)}
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </span>
                            </div>
                            
                            {/* Botón de inicio de sesión */}
                            <button type="submit" className="login-button">
                                Iniciar Sesión
                            </button>
                        </form>
                        
                        {/* Enlace para registro */}
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