import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';
import { useState } from 'react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Credenciales incorrectas');
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
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Correo Electrónico"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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