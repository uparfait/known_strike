import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search } from 'lucide-react'
import { useAuth } from '../../contexts/auth_context' // Assuming useAuth is defined elsewhere
import axios from 'axios' // Assuming axios is available
import debounce from 'lodash.debounce' // Assuming lodash is available

// Mock useApp hook if it's not provided in the context
const useApp = () => {
  const { API_BASE_URL, get_auth_headers } = useAuth() // Assuming these are available from useAuth

  const api_request = async (method, endpoint, data = null) => {
    const headers = get_auth_headers()
    try {
      const response = await axios({
        method,
        url: `${API_BASE_URL}${endpoint}`,
        data,
        headers,
      })
      return response
    } catch (error) {
      console.error(`API request failed: ${error.message}`)
      throw error // Re-throw to handle in components
    }
  }

  return { api_request }
}


const SearchSuggestions = ({ query, on_query_change, on_select, placeholder }) => {
  const [suggestions, set_suggestions] = useState([])
  const [loading, set_loading] = useState(false)
  const [show_suggestions, set_show_suggestions] = useState(false)

  const { api_request } = useApp()
  const input_ref = useRef(null)

  const debounced_search = useCallback(
    debounce(async (search_query) => {
      if (search_query.trim().length < 2) {
        set_suggestions([])
        set_show_suggestions(false)
        return
      }

      try {
        set_loading(true)
        const response = await api_request('GET', `/suggestions?query=${encodeURIComponent(search_query)}`)
        if (response.data.success) {
          const suggestions_data = response.data.suggestions || []
          set_suggestions(suggestions_data.slice(0, 10)) // Top 10 as requested
          set_show_suggestions(true)
        }
      } catch (error) {
        set_suggestions([])
        set_show_suggestions(false)
      } finally {
        set_loading(false)
      }
    }, 300),
    [api_request]
  )

  useEffect(() => {
    if (query) {
      debounced_search(query)
    } else {
      set_suggestions([])
      set_show_suggestions(false)
    }
  }, [query, debounced_search])

  const handle_select = (suggestion) => {
    on_select(suggestion)
    set_show_suggestions(false)
  }

  const handle_input_change = (e) => {
    const new_query = e.target.value
    if (on_query_change) {
      on_query_change(new_query)
    }
    debounced_search(new_query)
  }

  const handle_blur = (e) => {
    // Use a timeout to allow click events on suggestions to register before hiding
    setTimeout(() => {
      // Check if the focus is still within the suggestion box itself
      if (!input_ref.current?.contains(document.activeElement)) {
        set_show_suggestions(false)
      }
    }, 150)
  }

  const handle_focus = () => {
    if (query && suggestions.length > 0) {
      set_show_suggestions(true)
    }
  }

  return (
    <div className="relative w-full" ref={input_ref}>
      <div className="relative">
        <input
          ref={input_ref}
          type="text"
          value={query}
          onChange={handle_input_change}
          onBlur={handle_blur}
          onFocus={handle_focus}
          placeholder={placeholder || 'Search movies...'}
          className="w-full py-2 px-3 rounded-md bg-dark-200 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          ) : (
            <Search size={20} className="text-gray-400" />
          )}
        </div>
      </div>

      {show_suggestions && (
        <div className="absolute top-full left-0 right-0 bg-dark-300 border border-gray-600 rounded-lg mt-1 max-h-96 overflow-y-auto z-50 shadow-lg">
          {loading ? (
            <div className="p-4 text-center text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <div
                key={suggestion._id}
                onClick={() => handle_select(suggestion)}
                className="flex items-center gap-3 p-3 hover:bg-tertiary cursor-pointer transition-colors border-b border-tertiary last:border-b-0"
              >
                <img
                  src={suggestion.thumbnail_image}
                  alt={suggestion.name}
                  className="w-12 h-8 object-cover rounded flex-shrink-0"
                  onError={(e) => {
                    e.target.src = '/placeholder-movie.jpg'
                    e.target.onerror = null
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{suggestion.name}</div>
                  <div className="text-sm text-text-secondary flex items-center gap-2">
                    <span>{suggestion.genre}</span>
                    {suggestion.release_date && (
                      <>
                        <span>•</span>
                        <span>{new Date(suggestion.release_date).getFullYear()}</span>
                      </>
                    )}
                  </div>
                </div>
                {suggestion.is_interpreted && suggestion.interpreter && (
                  <div className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded">
                    {suggestion.interpreter}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-400">
              <Search size={24} className="mx-auto mb-2" />
              <p>No suggestions found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchSuggestions