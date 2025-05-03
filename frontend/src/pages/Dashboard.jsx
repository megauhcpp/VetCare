import { useAuth } from '../context/AuthContext'
import '../styles/Dashboard.css'

const Dashboard = () => {
    const { user, logout } = useAuth()

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Bienvenido a VetCare</h1>
                <div className="user-info">
                    <span>Hola, {user?.name}</span>
                    <button onClick={logout} className="logout-button">
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            <main className="dashboard-main">
                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h2>Mis Mascotas</h2>
                        <p>Gestiona el historial de tus mascotas</p>
                    </div>
                    <div className="dashboard-card">
                        <h2>Citas</h2>
                        <p>Agenda y gestiona tus citas</p>
                    </div>
                    <div className="dashboard-card">
                        <h2>Historial Médico</h2>
                        <p>Consulta el historial médico de tus mascotas</p>
                    </div>
                    <div className="dashboard-card">
                        <h2>Perfil</h2>
                        <p>Actualiza tu información personal</p>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Dashboard 