import React, { useState, useEffect } from 'react'
import { Eye, Download, Users, Film, TrendingUp, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'

// API
import { apiRequest, API_CONFIG } from '../utils/api'

// Components
import LoadingSkeleton from '../components/common/loading_skeleton'
import MovieCard from '../components/common/movie_card'
import InfiniteScroll from '../components/common/infinite_scroll'

const Dashboard = () => {
  const [stats, set_stats] = useState({
    total_movies: 0,
    total_users: 0,
    total_views: 0,
    total_downloads: 0
  })
  const [popular_movies, set_popular_movies] = useState([])
  const [loading_stats, set_loading_stats] = useState(true)
  const [loading_popular, set_loading_popular] = useState(true)
  const [loaded_popular_idx, set_loaded_popular_idx] = useState([])

  useEffect(() => {
    load_statistics()
    load_popular_movies()
  }, [])

  const load_statistics = async () => {
    try {
      set_loading_stats(true)
      const [movies_res, users_res, views_res, downloads_res] = await Promise.all([
        apiRequest('GET', `/total_movies`),
        apiRequest('GET', `/total_users`),
        apiRequest('GET', `/total_views`),
        apiRequest('GET', `/total_downloads`)
      ])

      set_stats({
        total_movies: movies_res.data.total_movies || 0,
        total_users: users_res.data.total_users || 0,
        total_views: views_res.data.total_views || 0,
        total_downloads: downloads_res.data.total_downloads || 0
      })
    } catch (error) {
      toast.error('Failed to load statistics')
    } finally {
      set_loading_stats(false)
    }
  }

  const load_popular_movies = async () => {
    try {
      set_loading_popular(true)
      const response = await apiRequest('GET', `/popular`)
      console.log("Popular movies response:", response.data.movies)
      if (response.data.success) {
        const movies = response.data.movies || []
        set_popular_movies(movies)
        set_loaded_popular_idx(movies.map(m => m._id))
      }
    } catch (error) {
      toast.error('Failed to load popular movies')
    } finally {
      set_loading_popular(false)
    }
  }

  const load_next_popular = async () => {
    try {
      const response = await apiRequest('POST', `/popular/next`, {
        loaded_idx: loaded_popular_idx
      })

      if (response.data.success && response.data.movies?.length > 0) {
        const new_movies = response.data.movies
        set_popular_movies(prev => [...prev, ...new_movies])
        set_loaded_popular_idx(prev => [...prev, ...new_movies.map(m => m._id)])
        return true
      }
      return false
    } catch (error) {
      toast.error('Failed to load more movies')
      return false
    }
  }

  const stat_cards = [
    {
      title: 'Total Movies',
      value: stats.total_movies,
      icon: Film,
      color: 'text-blue-400'
    },
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: Users,
      color: 'text-green-400'
    },
    {
      title: 'Total Views',
      value: stats.total_views,
      icon: Eye,
      color: 'text-yellow-400'
    },
    {
      title: 'Total Downloads',
      value: stats.total_downloads,
      icon: Download,
      color: 'text-purple-400'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-accent" />
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stat_cards.map((stat, index) => (
          <div key={index} className="bg-secondary p-6 rounded-lg border border-tertiary">
            {loading_stats ? (
              <LoadingSkeleton className="h-20" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-2">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Popular Movies */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Film className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-semibold">Popular Movies</h2>
        </div>

        {loading_popular ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array(10).fill().map((_, index) => (
              <LoadingSkeleton key={index} className="h-80" />
            ))}
          </div>
        ) : (
          <InfiniteScroll
            items={popular_movies}
            render_item={(movie) => <MovieCard key={movie._id} movie={movie} />}
            load_more={load_next_popular}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          />
        )}
      </div>
    </div>
  )
}

export default Dashboard
