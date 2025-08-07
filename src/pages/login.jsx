import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Film } from 'lucide-react'
import { useAuth } from '../contexts/auth_context'
import toast from 'react-hot-toast'

const Login = () => {
  const { login, user, loading: auth_loading } = useAuth()
  const [loading, set_loading] = useState(false)
  const [show_password, set_show_password] = useState(false)
  const [form_data, set_form_data] = useState({
    username: '',
    password: ''
  })

  if (auth_loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handle_input_change = (field, value) => {
    set_form_data(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handle_submit = async (e) => {
    e.preventDefault()

    if (!form_data.username.trim() || !form_data.password.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    set_loading(true)
    try {
      await login(form_data.username, form_data.password)
    } catch (error) {
      // Error handling is done in the login function
    } finally {
      set_loading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto w-24 h-24 mb-6">
            <img
              src="https://i.pinimg.com/1200x/39/66/8f/39668f9545b3491f96fbc9ac9e080da1.jpg"
              alt="CineVido Admin"
              className="w-full h-full object-cover rounded-full border-4 border-accent"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2">CineVido Admin</h1>
          <p className="text-text-secondary">Sign in to manage your movies</p>
        </div>

        {/* Login Form */}
        <div className="bg-secondary p-8 rounded-lg border border-tertiary">
          <form onSubmit={handle_submit} className="space-y-6">
            <div>
              <label className="label">Username</label>
              <input
                type="text"
                value={form_data.username}
                onChange={(e) => handle_input_change('username', e.target.value)}
                className="input w-full"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={show_password ? 'text' : 'password'}
                  value={form_data.password}
                  onChange={(e) => handle_input_change('password', e.target.value)}
                  className="input w-full pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => set_show_password(!show_password)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {show_password ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-text-secondary">
          <p>© 2024 CineVido Admin Panel</p>
        </div>
      </div>
    </div>
  )
}

export default Login