
import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useAuth } from '../../contexts/auth_context'
import axios from 'axios'

const SearchSuggestions = ({ query, onSelect, onClose }) => {
  const { API_BASE_URL, get_auth_headers } = useAuth()
  const [suggestions, set_suggestions] = useState([])
  const [loading, set_loading] = useState(false)

  useEffect(() => {
    if (query.length > 0) {
      fetch_suggestions()
    }
  }, [query])

  const fetch_suggestions = async () => {
    set_loading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/suggestions?q=${encodeURIComponent(query)}`, {
        headers: get_auth_headers()
      })
      if (response.data.success) {
        set_suggestions(response.data.suggestions.slice(0, 10))
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    }
    set_loading(false)
  }

  if (!query) return null

  return (
    <div className="absolute top-full left-0 right-0 bg-dark-300 border border-gray-600 rounded-lg mt-1 max-h-96 overflow-y-auto z-50">
      {loading ? (
        <div className="p-4 text-center text-gray-400">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      ) : suggestions.length > 0 ? (
        suggestions.map((movie) => (
          <div
            key={movie._id}
            onClick={() => onSelect(movie)}
            className="flex items-center p-3 hover:bg-dark-200 cursor-pointer border-b border-gray-700 last:border-b-0"
          >
            <img
              src={movie.thumbnail_image}
              alt={movie.name}
              className="w-12 h-8 object-cover rounded mr-3"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/120x80?text=No+Image'
              }}
            />
            <div className="flex-1">
              <div className="text-white text-sm font-medium">{movie.name}</div>
              <div className="text-gray-400 text-xs">{movie.genre}</div>
            </div>
          </div>
        ))
      ) : (
        <div className="p-4 text-center text-gray-400">
          <Search size={24} className="mx-auto mb-2" />
          <p>No suggestions found</p>
        </div>
      )}
    </div>
  )
}

export default SearchSuggestions
