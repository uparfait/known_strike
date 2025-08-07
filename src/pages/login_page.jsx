
import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/auth_context'
import { Eye, EyeOff } from 'lucide-react'

const LoginPage = () => {
  const { login, is_authenticated } = useAuth()
  const [form_data, set_form_data] = useState({
    username: '',
    password: ''
  })
  const [show_password, set_show_password] = useState(false)
  const [loading, set_loading] = useState(false)

  if (is_authenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handle_submit = async (e) => {
    e.preventDefault()
    set_loading(true)
    
    await login(form_data.username, form_data.password)
    
    set_loading(false)
  }

  const handle_change = (e) => {
    set_form_data({
      ...form_data,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <img
            src="https://i.pinimg.com/1200x/39/66/8f/39668f9545b3491f96fbc9ac9e080da1.jpg"
            alt="Cinevido"
            className="mx-auto h-16 w-16 rounded-full"
          />
          <h2 className="mt-6 text-3xl font-bold text-white">
            Cinevido Admin Panel
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to your admin account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handle_submit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={form_data.username}
                onChange={handle_change}
                className="input-field"
                placeholder="Username"
              />
            </div>
            
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={show_password ? 'text' : 'password'}
                required
                value={form_data.password}
                onChange={handle_change}
                className="input-field pr-10"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => set_show_password(!show_password)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {show_password ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
