import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
    const { user } = useAuth()

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            <p>Welcome, {user?.email}</p>
            {/* Add your dashboard content here */}
        </div>
    )
}

export default Dashboard 