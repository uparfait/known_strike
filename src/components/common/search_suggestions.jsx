import React, { useState, useEffect } from 'react'
import { Search, X, Film } from 'lucide-react'
import { useApp } from '../../contexts/app_context'

const SearchSuggestions = ({ 
  query = '', 
  onSelect, 
  onClose, 
  isVisible = true,
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const { api_request } = useApp()

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      setLoading(true)
      try {
        const response = await api_request('GET', `/search?q=${encodeURIComponent(query)}&limit=5`)
        if (response.data && response.data.success) {
          setSuggestions(response.data.movies || response.data.data || [])
        } else {
          setSuggestions([])
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [query, api_request])

  if (!isVisible || query.length < 2) {
    return null
  }

  return (
    <div className={`search-suggestions ${className}`}>
      <div className="p-2 sm:p-3 border-b border-tertiary flex items-center justify-between">
        <span className="text-xs sm:text-sm text-text-secondary flex items-center gap-2">
          <Search size={12} className="sm:w-4 sm:h-4" />
          Search suggestions
        </span>
        <button 
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary p-1"
        >
          <X size={12} className="sm:w-4 sm:h-4" />
        </button>
      </div>

      {loading ? (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-gray-500 mx-auto"></div>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="py-1 sm:py-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion._id || index}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 text-left hover:bg-tertiary transition-colors text-text-primary flex items-center gap-2 sm:gap-3"
              onClick={() => onSelect(suggestion)}
            >
              <img 
                src={suggestion.thumbnail_image || 'https://via.placeholder.com/40x60?text=No+Image'} 
                alt={suggestion.name} 
                className="w-8 h-10 sm:w-10 sm:h-14 object-cover rounded flex-shrink-0" 
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/40x60?text=No+Image'
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base truncate">{suggestion.name || 'Unnamed Movie'}</div>
                <div className="text-xs sm:text-sm text-text-secondary truncate">
                  {suggestion.genre || 'Unknown'} | {suggestion.display_language || 'Unknown'}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-text-secondary text-sm">
          <Film size={24} className="mx-auto mb-2 opacity-50" />
          No movies found for "{query}"
        </div>
      )}
    </div>
  )
}

export default SearchSuggestions