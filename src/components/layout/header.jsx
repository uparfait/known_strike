import React, { useState, useEffect } from 'react'
import { Search, User, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../../contexts/auth_context'
import { useNavigate, useLocation } from 'react-router-dom'
import SearchSuggestions from '../common/search_suggestions'
import GenreBar from '../common/genre_bar'

const Header = ({ onGenreSelect, selectedGenre }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [search_query, set_search_query] = useState('')
  const [show_suggestions, set_show_suggestions] = useState(false)
  const [show_mobile_menu, set_show_mobile_menu] = useState(false)

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
    set_show_mobile_menu(false)
  }

  const handleSuggestionSelect = (movie) => {
    navigate(`/watch?v_id=${movie._id}`)
    set_show_suggestions(false)
    set_search_query('')
  }

  return (
    <div className="bg-dark-200 border-b border-gray-700">
      {/* Main header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        {/* Logo and title */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <img 
            src="https://i.pinimg.com/1200x/39/66/8f/39668f9545b3491f96fbc9ac9e080da1.jpg" 
            alt="Cinevido" 
            className="h-6 w-6 sm:h-8 sm:w-8 rounded-full"
          />
          <h1 className="text-lg sm:text-xl font-bold text-white">
            <span className="hidden sm:inline">Cinevido Admin</span>
            <span className="sm:hidden">Cinevido</span>
          </h1>
        </div>

        {/* Desktop search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <form onSubmit={handle_search} className="w-full relative">
            <input
              type="text"
              value={search_query}
              onChange={(e) => {
                set_search_query(e.target.value)
                set_show_suggestions(e.target.value.length > 0)
              }}
              onFocus={() => search_query.length > 0 && set_show_suggestions(true)}
              onBlur={() => setTimeout(() => set_show_suggestions(false), 200)}
              placeholder="Search movies..."
              className="input-field pr-10"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <Search size={18} />
            </button>
          </form>
          
          {show_suggestions && search_query.length > 0 && (
            <SearchSuggestions
              query={search_query}
              onSelect={handleSuggestionSelect}
              onClose={() => set_show_suggestions(false)}
              isVisible={show_suggestions}
            />
          )}
        </div>

        {/* Desktop user menu */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={handle_logout}
            className="btn-iron flex items-center gap-2"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => set_show_mobile_menu(!show_mobile_menu)}
          className="md:hidden btn-iron p-2"
        >
          {show_mobile_menu ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <form onSubmit={handle_search} className="relative">
            <input
              type="text"
              value={search_query}
              onChange={(e) => {
                set_search_query(e.target.value)
                set_show_suggestions(e.target.value.length > 0)
              }}
              onFocus={() => search_query.length > 0 && set_show_suggestions(true)}
              onBlur={() => setTimeout(() => set_show_suggestions(false), 200)}
              placeholder="Search movies..."
              className="input-field pr-10"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <Search size={18} />
            </button>
          </form>
          
          {show_suggestions && search_query.length > 0 && (
            <SearchSuggestions
              query={search_query}
              onSelect={handleSuggestionSelect}
              onClose={() => set_show_suggestions(false)}
              isVisible={show_suggestions}
            />
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {show_mobile_menu && (
        <div className="md:hidden bg-secondary border-t border-tertiary">
          <div className="px-4 py-3 space-y-2">
            <button
              onClick={handle_logout}
              className="w-full btn-iron flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Genre bar */}
      {(location.pathname === '/' || location.pathname === '/movies') && onGenreSelect && (
        <GenreBar 
          selectedGenre={selectedGenre}
          onGenreSelect={onGenreSelect}
          className="border-t border-gray-700"
        />
      )}
    </div>
  )
}

export default Header