import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />

      {/* Protected — Dashboard is a layout that renders nested routes */}
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}
