
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search } from 'lucide-react'
import { useAuth } from '../../contexts/auth_context'
import { debounce } from 'lodash'

const SearchSuggestions = ({ 
  query, 
  on_query_change, 
  on_suggestion_select, 
  placeholder 
}) => {
  const { api_request } = useAuth()
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [show_suggestions, setShowSuggestions] = useState(false)
  const input_ref = useRef(null)

  const fetch_suggestions = async (search_query) => {
    if (!search_query || search_query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      setLoading(true)
      const response = await api_request('GET', `/api/search/suggestions?q=${encodeURIComponent(search_query)}`)
      
      if (response.success && response.suggestions) {
        setSuggestions(response.suggestions)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setLoading(false)
    }
  }

  const debounced_search = useCallback(
    debounce((search_query) => {
      fetch_suggestions(search_query)
    }, 300),
    [api_request]
  )

  useEffect(() => {
    return () => {
      debounced_search.cancel()
    }
  }, [debounced_search])

  const handle_input_change = (e) => {
    const new_query = e.target.value
    if (on_query_change) {
      on_query_change(new_query)
    }
    debounced_search(new_query)
  }

  const handle_suggestion_click = (suggestion) => {
    if (on_suggestion_select) {
      on_suggestion_select(suggestion)
    }
    setShowSuggestions(false)
  }

  const handle_blur = () => {
    setTimeout(() => {
      setShowSuggestions(false)
    }, 150)
  }

  const handle_focus = () => {
    if (query && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  return (
    <div className="relative w-full" ref={input_ref}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handle_input_change}
          onBlur={handle_blur}
          onFocus={handle_focus}
          placeholder={placeholder || 'Search movies...'}
          className="w-full py-2 px-3 pr-10 rounded-md bg-secondary border border-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent-primary"></div>
          ) : (
            <Search size={20} className="text-gray-400" />
          )}
        </div>
      </div>

      {show_suggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-secondary border border-tertiary rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-tertiary cursor-pointer text-text-primary"
              onClick={() => handle_suggestion_click(suggestion)}
            >
              <div className="flex items-center space-x-3">
                {suggestion.thumbnail && (
                  <img
                    src={suggestion.thumbnail}
                    alt={suggestion.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                )}
                <div>
                  <div className="font-medium">{suggestion.name}</div>
                  {suggestion.genre && (
                    <div className="text-sm text-gray-400">{suggestion.genre}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchSuggestions
