import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search as SearchIcon, Film } from 'lucide-react'
import LoadingSkeleton from '../components/common/loading_skeleton'
import MovieCard from '../components/common/movie_card'
import InfiniteScroll from '../components/common/infinite_scroll'
import SearchSuggestions from '../components/common/search_suggestions'
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

  useEffect(() => {
    setSearchInput(query)
    if (query) {
      search_movies()
    }
  }, [query])

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
      }
    } catch (error) {
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

  if (!query) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center px-4">
        <div className="text-center w-full max-w-lg mx-auto">
          <SearchIcon className="w-12 h-12 sm:w-16 sm:h-16 text-text-secondary mx-auto mb-4" />
          <h1 className="text-lg sm:text-xl font-semibold mb-2">Start Searching</h1>
          <p className="text-text-secondary mb-6">Enter a movie name to search</p>
          
          <form onSubmit={handle_search} className="relative">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
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
                className="input-field pl-10 w-full"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 btn-iron text-sm py-1 px-3"
              >
                Search
              </button>
            </div>
            
            {showSuggestions && search_input.length >= 2 && (
              <SearchSuggestions
                query={search_input}
                onSelect={handle_suggestion_select}
                onClose={() => setShowSuggestions(false)}
                isVisible={showSuggestions}
              />
            )}
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search Header  make header fixed to top with full*/}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <SearchIcon className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
          <h1 className="text-xl sm:text-2xl font-semibold">
            Search Results for "{query}"
          </h1>
        </div>
        
        {/* Search Input */}
        <form onSubmit={handle_search} className="relative">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
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
              className="input-field pl-10 pr-20 w-full"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 btn-iron text-sm py-1 px-3"
            >
              Search
            </button>
          </div>
          
          {showSuggestions && search_input.length >= 2 && (
            <SearchSuggestions
              query={search_input}
              onSelect={handle_suggestion_select}
              onClose={() => setShowSuggestions(false)}
              isVisible={showSuggestions}
            />
          )}
        </form>
      </div>


      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, index) => (
            <LoadingSkeleton key={index} />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <>
          <p className="text-text-secondary text-sm sm:text-base">
            Found {movies.length} result{movies.length !== 1 ? 's' : ''} for "{query}"
          </p>
          <InfiniteScroll
            items={movies}
            render_item={(movie, index) => (
              <MovieCard
                key={movie._id || index}
                movie={movie}
                showActions={false}
              />
            )}
            load_more={load_next_search}
            loading={loading}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          />
        </>
      ) : (
        <div className="text-center py-12">
          <Film size={48} className="mx-auto mb-4 text-text-secondary opacity-50" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            No Results Found
          </h3>
          <p className="text-text-secondary">
            No movies found for "{query}". Try searching with different keywords.
          </p>
        </div>
      )}
    </div>
  )
}

export default Search