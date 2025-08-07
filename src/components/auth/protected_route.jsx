
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/auth_context'

const ProtectedRoute = ({ children }) => {
  const { is_authenticated } = useAuth()
  
  return is_authenticated ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute
