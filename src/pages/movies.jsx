
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Film, Plus, Search } from 'lucide-react'
import LoadingSkeleton from '../components/common/loading_skeleton'
import MovieCard from '../components/common/movie_card'
import InfiniteScroll from '../components/common/infinite_scroll'
import { useApp } from '../contexts/app_context'
import toast from 'react-hot-toast'

const Movies = () => {
  const navigate = useNavigate()
  const { api_request } = useApp()
  const [movies, set_movies] = useState([])
  const [loading, set_loading] = useState(true)
  const [loaded_idx, set_loaded_idx] = useState([])
  const [search_query, set_search_query] = useState('')

  useEffect(() => {
    load_movies()
    console.log("Loading movies")
  }, [])

  const load_movies = async () => {
    try {
      set_loading(true)
      const response = await api_request('GET', '/movies')
      if (response.data.success) {
        const movies_data = response.data.movies || []
        set_movies(movies_data)
        set_loaded_idx(movies_data.map(m => m._id))
      }
    } catch (error) {
      toast.error('Failed to load movies' + error.message);
      console.log(error);
    } finally {
      set_loading(false)
    }
  }

  const load_next_movies = async () => {
    try {
      const response = await api_request('POST', '/movies/next', {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Film className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-semibold">Movies</h1>
        </div>
        <button
          onClick={() => navigate('/add-movie')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Movie
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search movies..."
            value={search_query}
            onChange={(e) => set_search_query(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handle_search()}
            className="input pl-10 w-full bg-blue-950 text-white"
          />
        </div>
        <button
          onClick={handle_search}
          className="btn-secondary"
        >
          Search
        </button>
        {search_query && (
          <button
            onClick={() => {
              set_search_query('')
              load_movies()
            }}
            className="btn-secondary"
          >
            Clear
          </button>
        )}
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array(10).fill().map((_, index) => (
            <LoadingSkeleton key={index} className="h-80" />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <InfiniteScroll
          items={movies}
          render_item={(movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              show_actions={true}
              on_delete={() => handle_delete_movie(movie._id)}
              on_edit={() => handle_edit_movie(movie._id)}
            />
          )}
          load_more={search_query ? null : load_next_movies}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        />
      ) : (
        <div className="text-center py-12">
          <Film className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No movies found</h3>
          <p className="text-text-secondary mb-4">
            {search_query ? 'Try different search terms' : 'Start by adding your first movie'}
          </p>
          <button
            onClick={() => navigate('/add-movie')}
            className="btn-primary"
          >
            Add Movie
          </button>
        </div>
      )}
    </div>
  )
}

export default Movies
