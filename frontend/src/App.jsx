import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<h1>Bienvenido a VetCare</h1>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App 