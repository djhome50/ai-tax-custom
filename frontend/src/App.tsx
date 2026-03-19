import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Entities from './pages/Entities'
import Transactions from './pages/Transactions'
import TaxForms from './pages/TaxForms'
import Settings from './pages/Settings'
import { Login } from './pages/Login'
import { Register } from './pages/Register'

function ProtectedRoute() {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout><Outlet /></Layout>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/entities" element={<Entities />} />
          <Route path="/entities/:entityId/transactions" element={<Transactions />} />
          <Route path="/entities/:entityId/forms" element={<TaxForms />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
