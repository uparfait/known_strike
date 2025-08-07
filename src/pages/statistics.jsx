
import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Film, Users as UsersIcon, Download, Eye } from 'lucide-react'
import LoadingSkeleton from '../components/common/loading_skeleton'
import { useApp } from '../contexts/app_context'
import toast from 'react-hot-toast'

const Statistics = () => {
  const { api_request } = useApp()
  const [stats, set_stats] = useState({
    total_movies: 0,
    total_users: 0,
    total_views: 0,
    total_downloads: 0,
    movie_counts: []
  })
  const [loading, set_loading] = useState(true)

  useEffect(() => {
    load_statistics()
  }, [])

  const load_statistics = async () => {
    try {
      set_loading(true)
      const [movies_res, users_res, views_res, downloads_res, counts_res] = await Promise.all([
        api_request('GET', '/total_movies'),
        api_request('GET', '/total_users'),
        api_request('GET', '/total_views'),
        api_request('GET', '/total_downloads'),
        api_request('GET', '/movie_counts')
      ])

      set_stats({
        total_movies: movies_res.data.total_movies || 0,
        total_users: users_res.data.total_users || 0,
        total_views: views_res.data.total_views || 0,
        total_downloads: downloads_res.data.total_downloads || 0,
        movie_counts: counts_res.data.total_movies_along_genres || []
      })
    } catch (error) {
      toast.error('Failed to load statistics' + error.message)
      console.log(error)
    } finally {
      set_loading(false)
    }
  }

  const main_stats = [
    {
      title: 'Total Movies',
      value: stats.total_movies,
      icon: Film,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: UsersIcon,
      color: 'text-green-400',
      bg: 'bg-green-400/10'
    },
    {
      title: 'Total Views',
      value: stats.total_views,
      icon: Eye,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10'
    },
    {
      title: 'Total Downloads',
      value: stats.total_downloads,
      icon: Download,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    }
  ]

  const format_number = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-accent" />
        <h1 className="text-2xl font-semibold">Statistics</h1>
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {main_stats.map((stat, index) => (
          <div key={index} className="bg-secondary p-6 rounded-lg border border-tertiary">
            {loading ? (
              <LoadingSkeleton className="h-20" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {format_number(stat.value)}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">
                    Active
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Movies by Genre */}
      <div className="bg-secondary p-6 rounded-lg border border-tertiary">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
          <Film className="w-5 h-5 text-accent" />
          Movies by Genre
        </h2>
        
        {loading ? (
          <div className="space-y-4">
            {Array(5).fill().map((_, index) => (
              <LoadingSkeleton key={index} className="h-16" />
            ))}
          </div>
        ) : stats.movie_counts.length > 0 ? (
          <div className="space-y-4">
            {stats.movie_counts.map((genre, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-tertiary rounded-lg">
                <div>
                  <h3 className="font-semibold">{genre.genre || 'Unknown'}</h3>
                  <p className="text-sm text-text-secondary">
                    {genre.count} movie{genre.count !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-primary rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-accent h-full transition-all duration-500"
                      style={{
                        width: `${Math.min((genre.count / Math.max(...stats.movie_counts.map(g => g.count))) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <span className="font-semibold text-lg min-w-[3rem] text-right">
                    {genre.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Film className="w-12 h-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary">No genre data available</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-secondary p-6 rounded-lg border border-tertiary">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={load_statistics}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Statistics
