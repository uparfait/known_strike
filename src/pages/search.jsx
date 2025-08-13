import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search as SearchIcon, Film, X } from 'lucide-react'
import LoadingSkeleton from '../components/common/loading_skeleton'
import MovieCard from '../components/common/movie_card'
import ExactMatchHighlight from '../components/common/exact_match_highlight'
import InfiniteScroll from '../components/common/infinite_scroll'
import { useApp } from '../contexts/app_context'
import toast from 'react-hot-toast'

const Search = () => {
  const [search_params] = useSearchParams()
  const navigate = useNavigate()
  const query = search_params.get('q') || ''
  const [search_input, setSearchInput] = useState(query)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { api_request } = useApp()
  
  const [movies, set_movies] = useState([])
  const [loading, set_loading] = useState(true)
  const [loaded_idx, set_loaded_idx] = useState([])
  const [suggestions, set_suggestions] = useState([])
  const [suggestions_loading, set_suggestions_loading] = useState(false)

  useEffect(() => {
    setSearchInput(query)
    if (query) {
      search_movies()
    }
  }, [query])


    const fetch_suggestions_for_no_results = async () => {
    set_suggestions_loading(true)
    try {
      const response = await api_request('GET', `/search?q=${encodeURIComponent(query)}`)
      if (response.data && response.data.success) {
        set_suggestions(response.data.suggestions || response.data.movies || [])
      } else {
        set_suggestions([])
      }
    } catch (error) {
      set_suggestions([])
    } finally {
      set_suggestions_loading(false)
    }
  }
  // Fetch search suggestions
  useEffect(() => {
    if (!showSuggestions || search_input.length < 2) {
      set_suggestions([])
      return
    }

    const fetch_suggestions = async () => {
      set_suggestions_loading(true)
      try {
        const response = await api_request('GET', `/search?q=${encodeURIComponent(search_input)}&limit=5`)
        if (response.data && response.data.success) {
          set_suggestions(response.data.movies || response.data.data || [])
        } else {
          set_suggestions([])
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        set_suggestions([])
      } finally {
        set_suggestions_loading(false)
      }
    }

    const debounceTimer = setTimeout(fetch_suggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [search_input, showSuggestions, api_request])

  const search_movies = async () => {
    try {
      set_loading(true)
      set_movies([])
      set_loaded_idx([])
      
      const response = await api_request('GET', `/search?q=${encodeURIComponent(query)}`)
      
      if (response.data.success) {
        const movies_data = response.data.movies || []
        set_movies(movies_data)
        set_loaded_idx(movies_data.map(m => m._id))
        // If no results, fetch suggestions
        if (movies_data.length === 0) {
          fetch_suggestions_for_no_results()
        } else {
          set_suggestions([])
        }
  // Fetch suggestions if no results
      }
    } catch (error) {
      console.log(error);
      toast.error('Search failed')
    } finally {
      set_loading(false)
    }
  }

  const load_next_search = async () => {
    try {
      const response = await api_request('POST', '/search/next', {
        q: query,
        loaded_idx: loaded_idx
      })
      
      if (response.data.success && response.data.movies?.length > 0) {
        const new_movies = response.data.movies
        set_movies(prev => [...prev, ...new_movies])
        set_loaded_idx(prev => [...prev, ...new_movies.map(m => m._id)])
        return true
      }
      return false
    } catch (error) {
      toast.error('Failed to load more results')
      return false
    }
  }

  const handle_search = (e) => {
    e.preventDefault()
    if (search_input.trim()) {
      navigate(`/search?q=${encodeURIComponent(search_input.trim())}`)
      setShowSuggestions(false)
    }
  }

  const handle_suggestion_select = (suggestion) => {
    const searchTerm = suggestion.name || suggestion
    setSearchInput(searchTerm)
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`)
    setShowSuggestions(false)
  }

  const clear_search = () => {
    setSearchInput('')
    navigate('/search')
  }

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
        <div className="text-center w-full max-w-lg mx-auto">
          <SearchIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-semibold mb-2">Start Searching</h1>
          <p className="text-gray-400 mb-6">Enter a movie name to search</p>
          
          <form onSubmit={handle_search} className="relative max-w-md mx-auto">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for movies..."
                value={search_input}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  setShowSuggestions(e.target.value.length >= 2)
                }}
                onFocus={() => search_input.length >= 2 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white"
              />
              {search_input && (
                <button
                  type="button"
                  onClick={clear_search}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-1 px-3 rounded-md"
              >
                Search
              </button>
            </div>
            
            {showSuggestions && search_input.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-10 overflow-hidden">
                <div className="p-2 border-b border-gray-700 flex items-center justify-between">
                  <span className="text-xs text-gray-400 flex items-center gap-2">
                    <SearchIcon size={12} />
                    Search suggestions
                  </span>
                  <button
                    onClick={() => setShowSuggestions(false)}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <X size={12} />
                  </button>
                </div>

                {suggestions_loading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500 mx-auto"></div>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="py-1">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={suggestion._id || index}
                        className="w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors text-white flex items-center gap-3"
                        onClick={() => handle_suggestion_select(suggestion)}
                      >
                        <img
                          src={suggestion.thumbnail_image || 'https://via.placeholder.com/40x60?text=No+Image'}
                          alt={suggestion.name}
                          className="w-10 h-14 object-cover rounded flex-shrink-0"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/40x60?text=No+Image'
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{suggestion.name || 'Unnamed Movie'}</div>
                          <div className="text-xs text-gray-400 truncate">
                            {suggestion.genre || 'Unknown'} | {suggestion.display_language || 'Unknown'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    <Film size={24} className="mx-auto mb-2 opacity-50" />
                    No movies found for "{search_input}"
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <SearchIcon className="w-5 h-5 text-indigo-500" />
            <h1 className="text-xl sm:text-2xl font-semibold">
              Search Results for "{query}"
            </h1>
          </div>
          
          {/* Search Input */}
          <form onSubmit={handle_search} className="relative w-full sm:w-96">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for movies..."
                value={search_input}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  setShowSuggestions(e.target.value.length >= 2)
                }}
                onFocus={() => search_input.length >= 2 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white"
              />
              {search_input && (
                <button
                  type="button"
                  onClick={clear_search}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-1 px-3 rounded-md"
              >
                Search
              </button>
            </div>
            
            {showSuggestions && search_input.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-20 overflow-hidden">
                <div className="p-2 border-b border-gray-700 flex items-center justify-between">
                  <span className="text-xs text-gray-400 flex items-center gap-2">
                    <SearchIcon size={12} />
                    Search suggestions
                  </span>
                  <button
                    onClick={() => setShowSuggestions(false)}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <X size={12} />
                  </button>
                </div>

                {suggestions_loading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500 mx-auto"></div>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="py-1">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={suggestion._id || index}
                        className="w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors text-white flex items-center gap-3"
                        onClick={() => handle_suggestion_select(suggestion)}
                      >
                        <img
                          src={suggestion.thumbnail_image || 'https://via.placeholder.com/40x60?text=No+Image'}
                          alt={suggestion.name}
                          className="w-10 h-14 object-cover rounded flex-shrink-0"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/40x60?text=No+Image'
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{suggestion.name || 'Unnamed Movie'}</div>
                          <div className="text-xs text-gray-400 truncate">
                            {suggestion.genre || 'Unknown'} | {suggestion.display_language || 'Unknown'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    <Film size={24} className="mx-auto mb-2 opacity-50" />
                    No movies found for "{search_input}"
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Results Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, index) => (
              <LoadingSkeleton key={index} className="bg-gray-800" />
            ))}
          </div>
        ) : movies.length > 0 ? (
          <>
            <p className="text-gray-400 text-sm sm:text-base mb-4">
              Found {movies.length} result{movies.length !== 1 ? 's' : ''} for "{query}"
            </p>
            <InfiniteScroll
              items={movies}
              render_item={(movie, index) => {
                // Highlight exact match in movie name
                const isExact = movie.name?.toLowerCase() === query?.toLowerCase()
                return (
                  <div key={movie._id || index} className="relative">
                    {isExact && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded z-10 shadow">
                        Exact Match
                      </div>
                    )}
                    <MovieCard
                      movie={{
                        ...movie,
                        name: <ExactMatchHighlight text={movie.name} match={isExact ? query : ''} />
                      }}
                      showActions={false}
                      className="bg-gray-800 hover:bg-gray-700 transition-colors"
                    />
                  </div>
                )
              }}
              load_more={load_next_search}
              loading={loading}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            />
          </>
        ) : (
          <div className="text-center py-12">
            <Film size={48} className="mx-auto mb-4 text-gray-500 opacity-50" />
            <h3 className="text-lg font-medium text-white mb-2">
              No Results Found
            </h3>
            <p className="text-gray-400 mb-4">
              No movies found for "{query}". Try searching with different keywords.
            </p>
            {/* Suggestions if available */}
            {suggestions_loading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg border border-gray-700 mt-6">
                <div className="p-3 border-b border-gray-700 text-left text-xs text-gray-400">Suggestions</div>
                <div className="divide-y divide-gray-700">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={suggestion._id || idx}
                      className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors text-white flex items-center gap-3"
                      onClick={() => handle_suggestion_select(suggestion)}
                    >
                      <img
                        src={suggestion.thumbnail_image || 'https://via.placeholder.com/40x60?text=No+Image'}
                        alt={suggestion.name}
                        className="w-10 h-14 object-cover rounded flex-shrink-0"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/40x60?text=No+Image'
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{suggestion.name}</div>
                        <div className="text-xs text-gray-400 truncate">
                          {suggestion.genre || 'Unknown'} | {suggestion.display_language || 'Unknown'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

export default Search