import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Plus, PawPrint, Stethoscope } from 'lucide-react';
import '../styles/Dashboard.css';

/**
 * Dashboard principal de la aplicación
 * Muestra un resumen de mascotas, citas, tratamientos y un calendario
 */
const Dashboard = () => {
    const { user } = useAuth();
    // Estado para controlar la fecha actual del calendario
    const [currentDate, setCurrentDate] = useState(new Date());

    // Datos de ejemplo (en una aplicación real, estos vendrían de la API)
    const mascotas = [
        { id: 1, nombre: 'Max', tipo: 'Perro', raza: 'Labrador' },
        { id: 2, nombre: 'Luna', tipo: 'Gato', raza: 'Siamés' }
    ];

    const citas = [
        { id: 1, mascota: 'Max', tipo: 'Chequeo Anual', fecha: '2024-05-10', hora: '10:00', estado: 'confirmada' },
        { id: 2, mascota: 'Luna', tipo: 'Vacunación', fecha: '2024-05-15', hora: '15:30', estado: 'pendiente' }
    ];

    const tratamientos = [
        { id: 1, mascota: 'Max', tratamiento: 'Control de peso', duracion: '3 meses' },
        { id: 2, mascota: 'Luna', tratamiento: 'Antiparasitario', duracion: '1 mes' }
    ];

    /**
     * Genera la matriz del calendario para el mes actual
     * @returns {Array} Matriz de semanas con días del mes
     */
    const generarCalendario = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const weeks = [];
        let week = [];

        // Agregar días vacíos al principio
        for (let i = 0; i < startingDay; i++) {
            week.push(null);
        }

        // Agregar días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            week.push(day);
            if (week.length === 7) {
                weeks.push(week);
                week = [];
            }
        }

        // Agregar días vacíos al final
        while (week.length < 7) {
            week.push(null);
        }
        weeks.push(week);

        return weeks;
    };

    /**
     * Cambia el mes mostrado en el calendario
     * @param {number} incremento - Número de meses a avanzar o retroceder
     */
    const cambiarMes = (incremento) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + incremento, 1));
    };

    return (
        <div className="dashboard-container">
            <main className="dashboard-main">
                <div className="dashboard-grid">
                    {/* Sección de Mascotas */}
                    <div className="dashboard-card pets-card">
                        <div className="card-header">
                            <PawPrint className="card-icon" />
                            <h2>Mis Mascotas</h2>
                        </div>
                        <div className="card-content">
                            <p className="total-count">{mascotas.length} mascotas registradas</p>
                            <ul className="pets-list">
                                {mascotas.map(mascota => (
                                    <li key={mascota.id}>
                                        <span className="pet-name">{mascota.nombre}</span>
                                        <span className="pet-details">{mascota.tipo} - {mascota.raza}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Sección de Citas */}
                    <div className="dashboard-card appointments-card">
                        <div className="card-header">
                            <Calendar className="card-icon" />
                            <h2>Citas Próximas</h2>
                        </div>
                        <div className="card-content">
                            <ul className="appointments-list">
                                {citas.map(cita => (
                                    <li key={cita.id} className={`appointment-item ${cita.estado}`}>
                                        <input type="checkbox" id={`cita-${cita.id}`} />
                                        <label htmlFor={`cita-${cita.id}`}>
                                            <span className="pet-name">{cita.mascota}</span>
                                            <span className="appointment-type">{cita.tipo}</span>
                                            <span className="appointment-date">{cita.fecha}</span>
                                            <span className="appointment-time">{cita.hora}</span>
                                            <span className="appointment-status">{cita.estado}</span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Sección de Tratamientos */}
                    <div className="dashboard-card treatments-card">
                        <div className="card-header">
                            <Stethoscope className="card-icon" />
                            <h2>Tratamientos Activos</h2>
                        </div>
                        <div className="card-content">
                            <ul className="treatments-list">
                                {tratamientos.map(tratamiento => (
                                    <li key={tratamiento.id}>
                                        <span className="treatment-pet">{tratamiento.mascota}</span>
                                        <span className="treatment-name">{tratamiento.tratamiento}</span>
                                        <span className="treatment-duration">{tratamiento.duracion}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Sección de Calendario */}
                    <div className="dashboard-card calendar-card">
                        <div className="card-header">
                            <Calendar className="card-icon" />
                            <h2>Calendario</h2>
                            <div className="calendar-navigation">
                                <button onClick={() => cambiarMes(-1)}>&lt;</button>
                                <span>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                                <button onClick={() => cambiarMes(1)}>&gt;</button>
                            </div>
                        </div>
                        <div className="calendar-content">
                            <table className="calendar-table">
                                <thead>
                                    <tr>
                                        <th>Dom</th>
                                        <th>Lun</th>
                                        <th>Mar</th>
                                        <th>Mié</th>
                                        <th>Jue</th>
                                        <th>Vie</th>
                                        <th>Sáb</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {generarCalendario().map((week, index) => (
                                        <tr key={index}>
                                            {week.map((day, dayIndex) => (
                                                <td key={dayIndex} className={day ? 'calendar-day' : 'empty-day'}>
                                                    {day}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Botón de Nueva Cita */}
                <div className="new-appointment-container">
                    <button className="new-appointment-button">
                        <Plus className="button-icon" />
                        Agendar visita
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Dashboard; 