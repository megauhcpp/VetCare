import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Register.css';

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
        <div className="register-container">
            <div className="register-form">
                <h1>VetCare</h1>
                <h2>Registro</h2>
                {errors.general && <div className="error-message">{errors.general}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                        {errors.nombre && <span className="error-text">{errors.nombre}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="apellido">Apellido</label>
                        <input
                            type="text"
                            id="apellido"
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            required
                        />
                        {errors.apellido && <span className="error-text">{errors.apellido}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="8"
                        />
                        {errors.password && <span className="error-text">{errors.password}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="password_confirmation">Confirmar Contraseña</label>
                        <input
                            type="password"
                            id="password_confirmation"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            required
                            minLength="8"
                        />
                        {errors.password_confirmation && <span className="error-text">{errors.password_confirmation}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="rol">Rol</label>
                        <select
                            id="rol"
                            name="rol"
                            value={formData.rol}
                            onChange={handleChange}
                            required
                        >
                            <option value="cliente">Cliente</option>
                            <option value="veterinario">Veterinario</option>
                            <option value="admin">Administrador</option>
                        </select>
                        {errors.rol && <span className="error-text">{errors.rol}</span>}
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
    );
};

export default Register; 