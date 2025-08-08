import React, { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { apiRequest } from '../../utils/api'

const SearchSuggestions = ({ 
  query = '', 
  onSuggestionClick, 
  onClose, 
  isVisible = false 
}) => {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      setLoading(true)
      try {
        const response = await apiRequest('get','/suggestions?q=' + encodeURIComponent(query))
        if (response.data && response.data.success) {
          setSuggestions(response.data.suggestions || response.data.data || [])
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
  }, [query])

  if (!isVisible || query.length < 2) {
    return null
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-secondary border border-tertiary rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="p-2 border-b border-tertiary flex items-center justify-between">
        <span className="text-sm text-text-secondary flex items-center gap-2">
          <Search size={14} />
          Search suggestions
        </span>
        <button 
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary"
        >
          <X size={14} />
        </button>
      </div>

      {loading ? (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto"></div>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="py-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion._id || index}
              className="w-full px-4 py-2 text-left hover:bg-tertiary transition-colors text-text-primary flex items-center gap-3"
              onClick={() => onSuggestionClick(suggestion)}
            >
              <img src={suggestion.thumbnail_image || 'https://via.placeholder.com/40x60?text=No+Image'} alt={suggestion.name} className="w-10 h-14 object-cover rounded mr-2" />
              <div className="flex-1">
                <div className="font-semibold text-base truncate">{suggestion.name}</div>
                <div className="text-xs text-text-secondary truncate">{suggestion.genre} | {suggestion.display_language}</div>
                <div className="text-xs text-text-secondary truncate">Views: {suggestion.views_short || suggestion.views}</div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-text-secondary">
          No suggestions found
        </div>
      )}
    </div>
  )
}

export default SearchSuggestions
