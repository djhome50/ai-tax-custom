import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Entities from './pages/Entities'
import Transactions from './pages/Transactions'
import TaxForms from './pages/TaxForms'
import Settings from './pages/Settings'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/entities" element={<Entities />} />
        <Route path="/entities/:entityId/transactions" element={<Transactions />} />
        <Route path="/entities/:entityId/forms" element={<TaxForms />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}

export default App
