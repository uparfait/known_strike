
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tag, Film } from 'lucide-react'
import LoadingSkeleton from '../components/common/loading_skeleton'
import MovieCard from '../components/common/movie_card'
import InfiniteScroll from '../components/common/infinite_scroll'
import { useApp } from '../contexts/app_context'
import toast from 'react-hot-toast'

const Category = () => {
  const [search_params] = useSearchParams()
  const { api_request } = useApp()
  const category = search_params.get('category')
  
  const [movies, set_movies] = useState([])
  const [loading, set_loading] = useState(true)
  const [loaded_idx, set_loaded_idx] = useState([])

  useEffect(() => {
    if (category) {
      load_movies()
    }
  }, [category])

  const load_movies = async () => {
    try {
      set_loading(true)
      set_movies([])
      set_loaded_idx([])
      
      let response
      if (category === 'all') {
        response = await api_request('GET', '/movies')
      } else {
        response = await api_request('GET', `/genre/${category}`)
      }
      
      if (response.data.success) {
        const movies_data = response.data.movies || []
        set_movies(movies_data)
        set_loaded_idx(movies_data.map(m => m._id))
      }
    } catch (error) {
      toast.error('Failed to load movies')
    } finally {
      set_loading(false)
    }
  }

  const load_next_movies = async () => {
    try {
      let response
      if (category === 'all') {
        response = await api_request('POST', '/movies/next', {
          loaded_idx: loaded_idx
        })
      } else {
        // Note: Backend might not have genre-specific next loading
        // This would need to be implemented in backend
        return false
      }
      
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

  if (!category) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <Tag className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">No Category Selected</h1>
          <p className="text-text-secondary">Please select a category to view movies</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Tag className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-semibold capitalize">
            {category === 'all' ? 'All Movies' : `${category} Movies`}
          </h1>
          {!loading && (
            <span className="text-text-secondary">
              ({movies.length} movies)
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array(20).fill().map((_, index) => (
              <LoadingSkeleton key={index} className="h-80" />
            ))}
          </div>
        ) : movies.length > 0 ? (
          <InfiniteScroll
            items={movies}
            render_item={(movie) => <MovieCard key={movie._id} movie={movie} />}
            load_more={category === 'all' ? load_next_movies : null}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          />
        ) : (
          <div className="text-center py-12">
            <Film className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No movies found</h3>
            <p className="text-text-secondary">
              No movies found in the "{category}" category
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Category
