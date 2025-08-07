
import React, { useState, useEffect } from 'react'
import { Search, User, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/auth_context'
import { useNavigate, useLocation } from 'react-router-dom'
import GenreFilter from '../common/genre_filter'
import SearchSuggestions from '../common/search_suggestions'

const Header = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [search_query, set_search_query] = useState('')
  const [show_suggestions, set_show_suggestions] = useState(false)

  const handle_search = (e) => {
    e.preventDefault()
    if (search_query.trim()) {
      navigate(`/search?q=${encodeURIComponent(search_query.trim())}`)
      set_show_suggestions(false)
    }
  }

  const handle_logout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="bg-dark-200 border-b border-gray-700">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <img 
            src="https://i.pinimg.com/1200x/39/66/8f/39668f9545b3491f96fbc9ac9e080da1.jpg" 
            alt="Cinevido" 
            className="h-8 w-8 rounded-full"
          />
          <h1 className="text-xl font-bold text-white">Cinevido Admin</h1>
        </div>

        <div className="flex-1 max-w-md mx-8 relative">
          <form onSubmit={handle_search} className="relative">
            <input
              type="text"
              value={search_query}
              onChange={(e) => {
                set_search_query(e.target.value)
                set_show_suggestions(e.target.value.length > 0)
              }}
              onFocus={() => search_query.length > 0 && set_show_suggestions(true)}
              placeholder="Search movies..."
              className="input-field pr-10"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <Search size={20} />
            </button>
          </form>
          
          {show_suggestions && search_query.length > 0 && (
            <SearchSuggestions
              query={search_query}
              onSelect={(movie) => {
                navigate(`/watch?v_id=${movie._id}`)
                set_show_suggestions(false)
                set_search_query('')
              }}
              onClose={() => set_show_suggestions(false)}
            />
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-300">
            <User size={20} />
            <span>Admin</span>
          </div>
          <button
            onClick={handle_logout}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {!location.pathname.includes('/watch') && <GenreFilter />}
    </div>
  )
}

export default Header
