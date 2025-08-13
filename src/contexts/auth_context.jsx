import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

// Centralized API configuration
let k = true;
const API_CONFIG = {
  BASE_URL: k === true
    ? 'https://hiddenskeleton.vercel.app/cinapi'
    : 'http://localhost:2025/cinapi', // Default to localhost for development if not specified
  ENDPOINTS: {
    LOGIN: '/login',
    USER_INFO: '/user',
    MOVIES: '/movies',
    GENRES: '/genres',
    SEARCH: '/search',
    STATISTICS: '/statistics'
  }
}

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('cinevido_token') || '')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_INFO}`)
          if (response.data.success) {
            setUser(response.data.user)
          } else {
            logout()
          }
        } catch (error) {
          console.error("Authentication check failed:", error)
          logout()
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [token])

  const login = async (username, password) => {
    try {
      setLoading(true)
      const response = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        username,
        password
      })

      if (response.data.success) {
        const newToken = response.data.token
        setToken(newToken)
        setUser(response.data.user)
        localStorage.setItem('cinevido_token', newToken)
        toast.success('Login successful!')
        return { success: true }
      } else {
        toast.error(response.data.error || 'Login failed')
        return { success: false, error: response.data.error }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Network error occurred'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken('')
    setUser(null)
    localStorage.removeItem('cinevido_token')
    delete axios.defaults.headers.common['Authorization']
    toast.success('Logged out successfully')
    navigate('/login') // Redirect to login after logout
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    is_authenticated: !!token && !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
