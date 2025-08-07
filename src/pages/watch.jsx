
import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Download, Eye, Calendar, Share2 } from 'lucide-react'
import LoadingSkeleton from '../components/common/loading_skeleton'
import MovieCard from '../components/common/movie_card'
import { useApp } from '../contexts/app_context'
import toast from 'react-hot-toast'

const Watch = () => {
  const [search_params] = useSearchParams()
  const navigate = useNavigate()
  const { api_request } = useApp()
  const video_ref = useRef(null)
  
  const movie_id = search_params.get('v_id')
  const [movie, set_movie] = useState(null)
  const [linked_series, set_linked_series] = useState([])
  const [recommended_movies, set_recommended_movies] = useState([])
  const [loading, set_loading] = useState(true)
  const [loading_series, set_loading_series] = useState(false)
  const [loading_recommended, set_loading_recommended] = useState(false)
  
  // Video player state
  const [playing, set_playing] = useState(false)
  const [muted, set_muted] = useState(false)
  const [volume, set_volume] = useState(1)
  const [current_time, set_current_time] = useState(0)
  const [duration, set_duration] = useState(0)
  const [show_controls, set_show_controls] = useState(true)
  const [fullscreen, set_fullscreen] = useState(false)

  useEffect(() => {
    if (movie_id) {
      load_movie()
    } else {
      navigate('/')
    }
  }, [movie_id])

  useEffect(() => {
    if (movie) {
      load_linked_series()
      load_recommended_movies()
      increment_views()
    }
  }, [movie])

  const load_movie = async () => {
    try {
      set_loading(true)
      const response = await api_request('GET', `/movies/${movie_id}`)
      if (response.data.success) {
        set_movie(response.data.movie)
      } else {
        toast.error('Movie not found')
        navigate('/')
      }
    } catch (error) {
      toast.error('Failed to load movie')
      navigate('/')
    } finally {
      set_loading(false)
    }
  }

  const load_linked_series = async () => {
    if (!movie?.linked_serie) return
    
    try {
      set_loading_series(true)
      const response = await api_request('GET', `/series/${movie_id}/${movie.linked_serie}`)
      if (response.data.success) {
        set_linked_series(response.data.series || [])
      }
    } catch (error) {
      console.error('Failed to load linked series')
    } finally {
      set_loading_series(false)
    }
  }

  const load_recommended_movies = async () => {
    if (!movie?.genre) return
    
    try {
      set_loading_recommended(true)
      const response = await api_request('GET', `/genre/${movie.genre}`)
      if (response.data.success) {
        const movies = response.data.movies || []
        set_recommended_movies(movies.filter(m => m._id !== movie_id).slice(0, 12))
      }
    } catch (error) {
      console.error('Failed to load recommended movies')
    } finally {
      set_loading_recommended(false)
    }
  }

  const increment_views = async () => {
    try {
      await api_request('POST', `/views/${movie_id}`)
    } catch (error) {
      console.error('Failed to increment views')
    }
  }

  const handle_download = async () => {
    if (!movie?.download_url) return
    
    try {
      await api_request('POST', `/downloads/${movie_id}`)
      
      const link = document.createElement('a')
      link.href = movie.download_url
      link.download = movie.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Download started!')
    } catch (error) {
      toast.error('Download failed')
    }
  }

  const handle_share = () => {
    const share_url = `${window.location.origin}/watch?v_id=${movie_id}`
    navigator.clipboard.writeText(share_url)
    toast.success('Share link copied to clipboard!')
  }

  const handle_play_pause = () => {
    if (video_ref.current) {
      if (playing) {
        video_ref.current.pause()
      } else {
        video_ref.current.play()
      }
      set_playing(!playing)
    }
  }

  const handle_volume_change = (new_volume) => {
    if (video_ref.current) {
      video_ref.current.volume = new_volume
      set_volume(new_volume)
      set_muted(new_volume === 0)
    }
  }

  const handle_mute_toggle = () => {
    if (video_ref.current) {
      const new_muted = !muted
      video_ref.current.muted = new_muted
      set_muted(new_muted)
    }
  }

  const handle_seek = (new_time) => {
    if (video_ref.current) {
      video_ref.current.currentTime = new_time
      set_current_time(new_time)
    }
  }

  const handle_fullscreen = () => {
    const video_container = video_ref.current?.parentElement
    if (video_container) {
      if (!fullscreen) {
        video_container.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
      set_fullscreen(!fullscreen)
    }
  }

  const format_time = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary">
        <div className="container mx-auto px-4 py-8">
          <LoadingSkeleton className="w-full h-96 mb-6" />
          <LoadingSkeleton className="w-3/4 h-8 mb-4" />
          <LoadingSkeleton className="w-1/2 h-6" />
        </div>
      </div>
    )
  }

  if (!movie) return null

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Video Player */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <div
            className="relative group"
            onMouseEnter={() => set_show_controls(true)}
            onMouseLeave={() => set_show_controls(false)}
          >
            <video
              ref={video_ref}
              src={movie.watch_url}
              poster={movie.thumbnail_image}
              className="w-full h-auto max-h-[70vh] object-contain"
              onTimeUpdate={(e) => set_current_time(e.target.currentTime)}
              onLoadedMetadata={(e) => set_duration(e.target.duration)}
              onPlay={() => set_playing(true)}
              onPause={() => set_playing(false)}
            />
            
            {/* Video Controls */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity ${show_controls ? 'opacity-100' : 'opacity-0'}`}>
              {/* Play/Pause Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={handle_play_pause}
                  className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                >
                  {playing ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </button>
              </div>
              
              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                {/* Progress Bar */}
                <div className="w-full bg-white/30 rounded-full h-1 cursor-pointer">
                  <div
                    className="bg-accent h-full rounded-full transition-all"
                    style={{ width: `${(current_time / duration) * 100}%` }}
                  />
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={current_time}
                    onChange={(e) => handle_seek(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer"
                  />
                </div>
                
                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handle_play_pause}
                      className="text-white hover:text-accent transition-colors"
                    >
                      {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handle_mute_toggle}
                        className="text-white hover:text-accent transition-colors"
                      >
                        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={muted ? 0 : volume}
                        onChange={(e) => handle_volume_change(parseFloat(e.target.value))}
                        className="w-20 accent-accent"
                      />
                    </div>
                    
                    <div className="text-white text-sm">
                      {format_time(current_time)} / {format_time(duration)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handle_seek(0)}
                      className="text-white hover:text-accent transition-colors"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handle_fullscreen}
                      className="text-white hover:text-accent transition-colors"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Movie Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-4">{movie.name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-text-secondary mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{movie.views?.toLocaleString() || 0} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>{movie.download_count?.toLocaleString() || 0} downloads</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{movie.release_date || 'N/A'}</span>
                </div>
                <div className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
                  {movie.genre}
                </div>
                {movie.is_interpreted && movie.interpreter && (
                  <div className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
                    Interpreted: {movie.interpreter}
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handle_download}
                  className="btn-primary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={handle_share}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
              
              <p className="text-text-secondary leading-relaxed">
                {movie.description}
              </p>
            </div>

            {/* Linked Series */}
            {movie.is_serie && movie.linked_serie && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Series Episodes</h2>
                {loading_series ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Array(6).fill().map((_, index) => (
                      <LoadingSkeleton key={index} className="h-32" />
                    ))}
                  </div>
                ) : linked_series.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {linked_series.map(episode => (
                      <div
                        key={episode._id}
                        onClick={() => navigate(`/watch?v_id=${episode._id}`)}
                        className="cursor-pointer group"
                      >
                        <div className="relative overflow-hidden rounded-lg mb-2">
                          <img
                            src={episode.thumbnail_image}
                            alt={episode.name}
                            className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
                            <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <h3 className="text-sm font-medium truncate">{episode.name}</h3>
                        <p className="text-xs text-text-secondary">{episode.views || 0} views</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary">No episodes found</p>
                )}
              </div>
            )}
          </div>

          {/* Recommended Movies */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Recommended</h2>
            {loading_recommended ? (
              <div className="space-y-4">
                {Array(5).fill().map((_, index) => (
                  <LoadingSkeleton key={index} className="h-24" />
                ))}
              </div>
            ) : recommended_movies.length > 0 ? (
              <div className="space-y-4">
                {recommended_movies.map(rec_movie => (
                  <div
                    key={rec_movie._id}
                    onClick={() => navigate(`/watch?v_id=${rec_movie._id}`)}
                    className="flex gap-3 cursor-pointer group"
                  >
                    <div className="relative w-24 h-16 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={rec_movie.thumbnail_image}
                        alt={rec_movie.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
                        <Play className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2 group-hover:text-accent transition-colors">
                        {rec_movie.name}
                      </h3>
                      <p className="text-xs text-text-secondary mt-1">
                        {rec_movie.views?.toLocaleString() || 0} views
                      </p>
                      <p className="text-xs text-text-secondary">
                        {rec_movie.genre}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary">No recommendations available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Watch
