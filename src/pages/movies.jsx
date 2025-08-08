import React, { useState, useEffect } from 'react'
import SearchSuggestions from '../components/common/search_suggestions'
import { useNavigate } from 'react-router-dom'
import { Film, Plus, Search } from 'lucide-react'
import LoadingSkeleton from '../components/common/loading_skeleton'
import MovieCard from '../components/common/movie_card'
import InfiniteScroll from '../components/common/infinite_scroll'
import { useApp } from '../contexts/app_context'
import toast from 'react-hot-toast'

const Movies = ({ selectedGenre = '' }) => {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionQuery, setSuggestionQuery] = useState('')
  const navigate = useNavigate()
  const { api_request } = useApp()
  const [movies, set_movies] = useState([])
  const [loading, set_loading] = useState(true)
  const [loaded_idx, set_loaded_idx] = useState([])
  const [search_query, set_search_query] = useState('')

  useEffect(() => {
    load_movies()
  }, [selectedGenre])

  const load_movies = async () => {
    try {
      set_loading(true)
      const endpoint = selectedGenre 
        ? `/movies/genre/${encodeURIComponent(selectedGenre)}`
        : '/movies'
      
      const response = await api_request('GET', endpoint)
      if (response.data.success) {
        const movies_data = response.data.movies || []
        set_movies(movies_data)
        set_loaded_idx(movies_data.map(m => m._id))
      }
    } catch (error) {
      toast.error('Failed to load movies: ' + error.message);
      console.log(error);
    } finally {
      set_loading(false)
    }
  }

  const load_next_movies = async () => {
    try {
      const endpoint = selectedGenre 
        ? `/movies/genre/${encodeURIComponent(selectedGenre)}/next`
        : '/movies/next'
        
      const response = await api_request('POST', endpoint, {
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
      toast.error('Failed to load more movies')
      return false
    }
  }

  const handle_delete_movie = async (movie_id) => {
    if (!confirm('Are you sure you want to delete this movie?')) return
    
    try {
      const response = await api_request('DELETE', `/movies/${movie_id}`)
      if (response.data.success) {
        set_movies(prev => prev.filter(m => m._id !== movie_id))
        set_loaded_idx(prev => prev.filter(id => id !== movie_id))
        toast.success('Movie deleted successfully')
      } else {
        toast.error(response.data.message || 'Failed to delete movie')
      }
    } catch (error) {
      toast.error('Failed to delete movie')
    }
  }

  const handle_edit_movie = (movie_id) => {
    navigate(`/edit-movie/${movie_id}`)
  }

  const handle_search = async () => {
    if (!search_query.trim()) {
      load_movies()
      return
    }

    try {
      set_loading(true)
      const response = await api_request('GET', `/search?q=${encodeURIComponent(search_query)}`)
      if (response.data.success) {
        const search_results = response.data.movies || []
        set_movies(search_results)
        set_loaded_idx(search_results.map(m => m._id))
      }
    } catch (error) {
      toast.error('Search failed')
    } finally {
      set_loading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Film className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
          <h1 className="text-xl sm:text-2xl font-semibold">
            {selectedGenre ? `${selectedGenre} Movies` : 'All Movies'}
          </h1>
        </div>
        <button
          onClick={() => navigate('/add-movie')}
          className="btn-iron flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Add Movie
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search movies..."
            value={search_query}
            onChange={(e) => {
              set_search_query(e.target.value)
              setSuggestionQuery(e.target.value)
              setShowSuggestions(e.target.value.length >= 2)
            }}
            onFocus={() => search_query.length >= 2 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyPress={(e) => e.key === 'Enter' && handle_search()}
            className="input-field pl-10"
          />
          
          {showSuggestions && suggestionQuery && (
            <SearchSuggestions
              query={suggestionQuery}
              isVisible={showSuggestions}
              onSelect={(suggestion) => {
                set_search_query(suggestion.name || suggestion)
                setShowSuggestions(false)
                handle_search()
              }}
              onClose={() => setShowSuggestions(false)}
            />
          )}
        </div>
        
        <button
          onClick={handle_search}
          className="btn-iron w-full sm:w-auto"
        >
          Search
        </button>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, index) => (
            <LoadingSkeleton key={index} />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <InfiniteScroll
          items={movies}
          render_item={(movie, index) => (
            <MovieCard
              key={movie._id || index}
              movie={movie}
              onEdit={handle_edit_movie}
              onDelete={handle_delete_movie}
              showActions={true}
            />
          )}
          load_more={load_next_movies}
          loading={loading}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
        />
      ) : (
        <div className="text-center py-12">
          <Film size={48} className="mx-auto mb-4 text-text-secondary opacity-50" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            {search_query ? 'No movies found' : 'No movies available'}
          </h3>
          <p className="text-text-secondary">
            {search_query 
              ? `Try searching for something else` 
              : selectedGenre 
                ? `No movies found in ${selectedGenre} genre`
                : 'Start by adding some movies to your collection'
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default Movies