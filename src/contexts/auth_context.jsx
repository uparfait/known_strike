
import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [is_authenticated, set_is_authenticated] = useState(false)
  const [auth_token, set_auth_token] = useState(null)
  const [loading, set_loading] = useState(true)

  const API_BASE_URL = 'https://hiddenskeleton.vercel.app/cinapi'

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      set_auth_token(token)
      set_is_authenticated(true)
    }
    set_loading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username,
        password
      })

      if (response.data.success) {
        const token = response.data.token
        localStorage.setItem('auth_token', token)
        set_auth_token(token)
        set_is_authenticated(true)
        toast.success('Login successful!')
        return true
      } else {
        toast.error(response.data.error || 'Login failed')
        return false
      }
    } catch (error) {
      toast.error('Network error occurred')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    set_auth_token(null)
    set_is_authenticated(false)
    toast.success('Logged out successfully')
  }

  const get_auth_headers = () => ({
    Authorization: `Bearer ${auth_token}`
  })

  const value = {
    is_authenticated,
    auth_token,
    login,
    logout,
    get_auth_headers,
    API_BASE_URL
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const API_BASE_URL = 'https://hiddenskeleton.vercel.app/cinapi'

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
          const response = await axios.get(`${API_BASE_URL}/user`)
          if (response.data.success) {
            setUser(response.data.user)
          } else {
            logout()
          }
        } catch (error) {
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
      const response = await axios.post(`${API_BASE_URL}/login`, {
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
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token && !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
