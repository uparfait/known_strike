
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, Film } from 'lucide-react'
import LoadingSkeleton from '../components/common/loading_skeleton'
import MovieCard from '../components/common/movie_card'
import InfiniteScroll from '../components/common/infinite_scroll'
import { useApp } from '../contexts/app_context'
import toast from 'react-hot-toast'

const Search = () => {
  const [searchInput, setSearchInput] = useState(query)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [search_params] = useSearchParams()
  const { api_request } = useApp()
  const query = search_params.get('q') || ''
  
  const [movies, set_movies] = useState([])
  const [loading, set_loading] = useState(true)
  const [loaded_idx, set_loaded_idx] = useState([])

  useEffect(() => {
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
      toast.error('Failed to load more results' + error.message)
      console.log(error)
      return false
    }
  }

  if (!query) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center w-full max-w-lg mx-auto">
          <SearchIcon className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">No Search Query</h1>
          <p className="text-text-secondary mb-4">Please enter a search term</p>
          <div className="relative">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchInput}
              onChange={e => {
                setSearchInput(e.target.value)
                setShowSuggestions(e.target.value.length >= 2)
              }}
              onFocus={() => searchInput.length >= 2 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyPress={e => e.key === 'Enter' && window.location.replace(`/search?q=${encodeURIComponent(searchInput)}`)}
              className="input pl-10 w-full bg-blue-950 text-white"
            />
            <SearchSuggestions
              query={searchInput}
              isVisible={showSuggestions}
              onSuggestionClick={suggestion => {
                setSearchInput(suggestion)
                setShowSuggestions(false)
                window.location.replace(`/search?q=${encodeURIComponent(suggestion)}`)
              }}
              onClose={() => setShowSuggestions(false)}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <SearchIcon className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-semibold">
            Search Results for "{query}"
          </h1>
          {!loading && (
            <span className="text-text-secondary">
              ({movies.length} results)
            </span>
          )}
        </div>
        <div className="relative max-w-lg mx-auto">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchInput}
            onChange={e => {
              setSearchInput(e.target.value)
              setShowSuggestions(e.target.value.length >= 2)
            }}
            onFocus={() => searchInput.length >= 2 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyPress={e => e.key === 'Enter' && window.location.replace(`/search?q=${encodeURIComponent(searchInput)}`)}
            className="input pl-10 w-full bg-blue-950 text-white"
          />
          <SearchSuggestions
            query={searchInput}
            isVisible={showSuggestions}
            onSuggestionClick={suggestion => {
              setSearchInput(suggestion)
              setShowSuggestions(false)
              window.location.replace(`/search?q=${encodeURIComponent(suggestion)}`)
            }}
            onClose={() => setShowSuggestions(false)}
          />
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array(20).fill().map((_, index) => (
              <LoadingSkeleton key={index} className="h-80 bg-blue-950" />
            ))}
          </div>
        ) : movies.length > 0 ? (
          <InfiniteScroll
            items={movies}
            render_item={(movie) => <MovieCard key={movie._id} movie={movie} />}
            load_more={load_next_search}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          />
        ) : (
          <div className="text-center py-12">
            <Film className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-text-secondary">
              No movies found for "{query}". Try different search terms.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
