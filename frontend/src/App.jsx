import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

// Componente de ruta protegida
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return <div>Cargando...</div>
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />
    }

    return children
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    )
}

export default App 