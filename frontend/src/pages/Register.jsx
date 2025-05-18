import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Register.css';
import { CalendarCheck, PawPrint, Bell } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        password_confirmation: '',
        rol: 'cliente'
    });
    const [errors, setErrors] = useState({});
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validaciones del lado del cliente
            if (formData.password.length < 8) {
                setErrors({
                    ...errors,
                    password: 'La contraseña debe tener al menos 8 caracteres'
                });
                return;
            }
            if (formData.password !== formData.password_confirmation) {
                setErrors({
                    ...errors,
                    password_confirmation: 'Las contraseñas no coinciden'
                });
                return;
            }

            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            if (err.errors) {
                setErrors(err.errors);
            } else {
                setErrors({
                    general: err.message || 'Error al registrar usuario'
                });
            }
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-left">
                    <div className="register-content">
                        <h1>VetCare</h1>
                        <p className="subtitle">Gestión de Citas Veterinarias</p>
                        <div className="features">
                            <div className="feature">
                                <span className="icon-lucide"><CalendarCheck size={28} /></span>
                                <span>Gestiona tus citas</span>
                            </div>
                            <div className="feature">
                                <span className="icon-lucide"><PawPrint size={28} /></span>
                                <span>Historial de mascotas</span>
                            </div>
                            <div className="feature">
                                <span className="icon-lucide"><Bell size={28} /></span>
                                <span>Recordatorios automáticos</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="register-right">
                    <div className="register-form-container">
                        <h2>Registro</h2>
                        <p className="register-subtitle">Crea tu cuenta para comenzar</p>
                        {errors.general && <div className="error-message">{errors.general}</div>}
                        <form onSubmit={handleSubmit} className="register-form">
                            <div className="form-group">
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="Nombre"
                                    required
                                />
                                {errors.nombre && <span className="error-text">{errors.nombre}</span>}
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    id="apellido"
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    placeholder="Apellido"
                                    required
                                />
                                {errors.apellido && <span className="error-text">{errors.apellido}</span>}
                            </div>
                            <div className="form-group">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Correo Electrónico"
                                    required
                                />
                                {errors.email && <span className="error-text">{errors.email}</span>}
                            </div>
                            <div className="form-group">
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Contraseña"
                                    required
                                    minLength="8"
                                />
                                {errors.password && <span className="error-text">{errors.password}</span>}
                            </div>
                            <div className="form-group">
                                <input
                                    type="password"
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    placeholder="Confirmar Contraseña"
                                    required
                                    minLength="8"
                                />
                                {errors.password_confirmation && <span className="error-text">{errors.password_confirmation}</span>}
                            </div>
                            <button type="submit" className="register-button">
                                Registrarse
                            </button>
                        </form>
                        <p className="login-link">
                            ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;