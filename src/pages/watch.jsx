import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw, Download, Eye, Calendar, Share2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import LoadingSkeleton from '../components/common/loading_skeleton'
import MovieCard from '../components/common/movie_card'
import { useApp } from '../contexts/app_context'
import toast from 'react-hot-toast'

const Watch = () => {
  const [search_params] = useSearchParams()
  const navigate = useNavigate()
  const { api_request } = useApp()
  const video_ref = useRef(null)
  const video_container_ref = useRef(null)
  const controls_timeout_ref = useRef(null)
  
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
  const [volume, set_volume] = useState(0.7)
  const [current_time, set_current_time] = useState(0)
  const [duration, set_duration] = useState(0)
  const [buffered, set_buffered] = useState(0)
  const [show_controls, set_show_controls] = useState(true)
  const [fullscreen, set_fullscreen] = useState(false)
  const [is_seeking, set_is_seeking] = useState(false)
  const [playback_rate, set_playback_rate] = useState(1)
  const [quality_options, set_quality_options] = useState([])
  const [current_quality, set_current_quality] = useState('auto')
  const [is_loading_video, set_is_loading_video] = useState(true)
  const [error, set_error] = useState(null)

  // Keyboard shortcuts
  useEffect(() => {
    const handle_keydown = (e) => {
      if (!video_ref.current) return
      
      switch (e.key) {
        case ' ':
          e.preventDefault()
          handle_play_pause()
          break
        case 'ArrowRight':
          e.preventDefault()
          handle_seek(Math.min(current_time + 5, duration))
          break
        case 'ArrowLeft':
          e.preventDefault()
          handle_seek(Math.max(current_time - 5, 0))
          break
        case 'ArrowUp':
          e.preventDefault()
          handle_volume_change(Math.min(volume + 0.1, 1))
          break
        case 'ArrowDown':
          e.preventDefault()
          handle_volume_change(Math.max(volume - 0.1, 0))
          break
        case 'm':
          e.preventDefault()
          handle_mute_toggle()
          break
        case 'f':
          e.preventDefault()
          handle_fullscreen()
          break
      }
    }

    document.addEventListener('keydown', handle_keydown)
    return () => document.removeEventListener('keydown', handle_keydown)
  }, [current_time, duration, volume])

  // Auto-hide controls
  useEffect(() => {
    if (!playing) return
    
    const hide_controls = () => {
      if (show_controls) {
        controls_timeout_ref.current = setTimeout(() => {
          set_show_controls(false)
        }, 3000)
      }
    }

    hide_controls()
    return () => clearTimeout(controls_timeout_ref.current)
  }, [playing, show_controls])

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
      detect_quality_options()
    }
  }, [movie])

  const load_movie = async () => {
    try {
      set_loading(true)
      set_error(null)
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

  const detect_quality_options = () => {
    // In a real app, this would detect available streams
    // For demo, we'll simulate some options
    set_quality_options([
      { label: 'Auto', value: 'auto' },
      { label: '1080p', value: '1080' },
      { label: '720p', value: '720' },
      { label: '480p', value: '480' }
    ])
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
    if (navigator.share) {
      navigator.share({
        title: movie.name,
        text: `Watch "${movie.name}" on our platform`,
        url: share_url
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(share_url)
        toast.success('Share link copied to clipboard!')
      })
    } else {
      navigator.clipboard.writeText(share_url)
      toast.success('Share link copied to clipboard!')
    }
  }

  const handle_play_pause = () => {
    if (video_ref.current) {
      if (playing) {
        video_ref.current.pause()
      } else {
        video_ref.current.play().catch(err => {
          set_error('Failed to play video. Please check your connection.')
          console.error('Playback error:', err)
        })
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
    const video_container = video_container_ref.current
    if (video_container) {
      if (!fullscreen) {
        if (video_container.requestFullscreen) {
          video_container.requestFullscreen()
        } else if (video_container.webkitRequestFullscreen) {
          video_container.webkitRequestFullscreen()
        } else if (video_container.msRequestFullscreen) {
          video_container.msRequestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        }
      }
      set_fullscreen(!fullscreen)
    }
  }

  const handle_playback_rate_change = (rate) => {
    if (video_ref.current) {
      video_ref.current.playbackRate = rate
      set_playback_rate(rate)
    }
  }

  const handle_quality_change = (quality) => {
    set_current_quality(quality)
    // In a real app, you would switch the video source here
  }

  const format_time = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handle_video_click = () => {
    set_show_controls(true)
    handle_play_pause()
  }

  const handle_video_hover = () => {
    set_show_controls(true)
    clearTimeout(controls_timeout_ref.current)
  }

  const handle_video_leave = () => {
    if (playing) {
      controls_timeout_ref.current = setTimeout(() => {
        set_show_controls(false)
      }, 2000)
    }
  }

  const handle_progress = () => {
    if (video_ref.current && video_ref.current.buffered.length > 0) {
      set_buffered(video_ref.current.buffered.end(0))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <LoadingSkeleton className="w-full aspect-video bg-gray-800 mb-6" />
          <LoadingSkeleton className="w-3/4 h-8 bg-gray-800 mb-4" />
          <LoadingSkeleton className="w-1/2 h-6 bg-gray-800" />
        </div>
      </div>
    )
  }

  if (!movie) return null

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-8">
        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Column - Player and Info */}
          <div className="flex-1">
            {/* Video Player Container */}
            <div 
              ref={video_container_ref}
              className="relative bg-black rounded-none lg:rounded-lg overflow-hidden group"
              onMouseEnter={handle_video_hover}
              onMouseLeave={handle_video_leave}
            >
              {/* Video Element */}
              <video
                ref={video_ref}
                src={movie.watch_url}
                poster={movie.thumbnail_image}
                className="w-full h-auto aspect-video"
                onTimeUpdate={(e) => set_current_time(e.target.currentTime)}
                onLoadedMetadata={(e) => {
                  set_duration(e.target.duration)
                  set_is_loading_video(false)
                }}
                onProgress={handle_progress}
                onPlay={() => {
                  set_playing(true)
                  set_is_loading_video(false)
                }}
                onPause={() => set_playing(false)}
                onWaiting={() => set_is_loading_video(true)}
                onPlaying={() => set_is_loading_video(false)}
                onError={() => {
                  set_error('Failed to load video. Please try again later.')
                  set_is_loading_video(false)
                }}
                onClick={handle_video_click}
              />
              
              {/* Loading Indicator */}
              {is_loading_video && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4">
                  <div className="text-center">
                    <p className="text-lg font-medium mb-2">{error}</p>
                    <button
                      onClick={() => {
                        set_error(null)
                        video_ref.current.load()
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Video Controls Overlay */}
              <div className={`absolute inset-0 transition-opacity duration-300 ${show_controls ? 'opacity-100' : 'opacity-0'}`}>
                {/* Top Gradient */}
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/70 to-transparent pointer-events-none"></div>
                
                {/* Bottom Gradient and Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 space-y-3">
                  {/* Progress Bar */}
                  <div className="relative w-full h-2 bg-gray-600/50 rounded-full cursor-pointer group/progress">
                    <div
                      className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full"
                      style={{ width: `${(current_time / duration) * 100}%` }}
                    ></div>
                    <div
                      className="absolute top-0 left-0 h-full bg-gray-400/30 rounded-full"
                      style={{ width: `${(buffered / duration) * 100}%` }}
                    ></div>
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={current_time}
                      onChange={(e) => {
                        set_is_seeking(true)
                        set_current_time(parseFloat(e.target.value))
                      }}
                      onMouseUp={(e) => {
                        handle_seek(parseFloat(e.target.value))
                        set_is_seeking(false)
                      }}
                      onTouchEnd={(e) => {
                        handle_seek(parseFloat(e.target.value))
                        set_is_seeking(false)
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div
                      className={`absolute h-3 w-3 bg-indigo-500 rounded-full -translate-y-1/2 top-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity`}
                      style={{ left: `${(current_time / duration) * 100}%` }}
                    ></div>
                  </div>

                  {/* Control Bar */}
                  <div className="flex items-center justify-between">
                    {/* Left Controls */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Play/Pause */}
                      <button
                        onClick={handle_play_pause}
                        className="text-white hover:text-indigo-300 transition-colors"
                        aria-label={playing ? 'Pause' : 'Play'}
                      >
                        {playing ? (
                          <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                          <Play className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}
                      </button>

                      {/* Volume */}
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={handle_mute_toggle}
                          className="text-white hover:text-indigo-300 transition-colors"
                          aria-label={muted ? 'Unmute' : 'Mute'}
                        >
                          {muted ? (
                            <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
                          ) : (
                            <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
                          )}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={muted ? 0 : volume}
                          onChange={(e) => handle_volume_change(parseFloat(e.target.value))}
                          className="w-16 sm:w-24 accent-indigo-500"
                          aria-label="Volume"
                        />
                      </div>

                      {/* Time */}
                      <div className="text-sm sm:text-base font-mono">
                        {format_time(current_time)} / {format_time(duration)}
                      </div>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Playback Rate */}
                      <div className="relative group/playback">
                        <button className="text-sm px-2 py-1 bg-gray-700/70 hover:bg-gray-700 rounded">
                          {playback_rate}x
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/playback:block bg-gray-800 rounded-md shadow-lg z-10">
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                            <button
                              key={rate}
                              onClick={() => handle_playback_rate_change(rate)}
                              className={`block w-full px-4 py-2 text-left text-sm ${playback_rate === rate ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}
                            >
                              {rate}x
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quality */}
                      {quality_options.length > 0 && (
                        <div className="relative group/quality">
                          <button className="text-sm px-2 py-1 bg-gray-700/70 hover:bg-gray-700 rounded">
                            {current_quality === 'auto' ? 'Quality' : `${current_quality}p`}
                          </button>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/quality:block bg-gray-800 rounded-md shadow-lg z-10 min-w-[120px]">
                            {quality_options.map(option => (
                              <button
                                key={option.value}
                                onClick={() => handle_quality_change(option.value)}
                                className={`block w-full px-4 py-2 text-left text-sm ${current_quality === option.value ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Fullscreen */}
                      <button
                        onClick={handle_fullscreen}
                        className="text-white hover:text-indigo-300 transition-colors"
                        aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                      >
                        {fullscreen ? (
                          <Minimize className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                          <Maximize className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Movie Info */}
            <div className="px-4 lg:px-0 py-6 space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-3">{movie.name}</h1>
                
                <div className="flex flex-wrap items-center gap-3 text-gray-400 mb-4">
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
                  <div className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-sm">
                    {movie.genre}
                  </div>
                  {movie.is_interpreted && movie.interpreter && (
                    <div className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
                      Interpreted: {movie.interpreter}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={handle_download}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={handle_share}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
                
                <p className="text-gray-300 leading-relaxed">
                  {movie.description}
                </p>
              </div>

              {/* Linked Series */}
              {movie.is_serie && movie.linked_serie && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Series Episodes</h2>
                  {loading_series ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {Array(8).fill().map((_, index) => (
                        <LoadingSkeleton key={index} className="h-40 bg-gray-800" />
                      ))}
                    </div>
                  ) : linked_series.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {linked_series.map(episode => (
                        <div
                          key={episode._id}
                          onClick={() => navigate(`/watch?v_id=${episode._id}`)}
                          className="cursor-pointer group"
                        >
                          <div className="relative overflow-hidden rounded-lg mb-2 aspect-video">
                            <img
                              src={episode.thumbnail_image}
                              alt={episode.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all">
                              <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                              <p className="text-xs text-white truncate">{episode.name}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No episodes found</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Recommended Movies (Desktop) */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-4 space-y-6">
              <h2 className="text-xl font-semibold px-2">Recommended</h2>
              {loading_recommended ? (
                <div className="space-y-4">
                  {Array(5).fill().map((_, index) => (
                    <LoadingSkeleton key={index} className="h-24 bg-gray-800" />
                  ))}
                </div>
              ) : recommended_movies.length > 0 ? (
                <div className="space-y-4">
                  {recommended_movies.map(rec_movie => (
                    <div
                      key={rec_movie._id}
                      onClick={() => navigate(`/watch?v_id=${rec_movie._id}`)}
                      className="flex gap-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <div className="relative w-24 h-16 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={rec_movie.thumbnail_image}
                          alt={rec_movie.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all">
                          <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-indigo-400 transition-colors">
                          {rec_movie.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                          {rec_movie.views?.toLocaleString() || 0} views
                        </p>
                        <p className="text-xs text-gray-400">
                          {rec_movie.genre}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 px-2">No recommendations available</p>
              )}
            </div>
          </div>
        </div>

        {/* Recommended Movies (Mobile) */}
        <div className="lg:hidden px-4 py-6">
          <h2 className="text-xl font-semibold mb-4">Recommended</h2>
          {loading_recommended ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array(6).fill().map((_, index) => (
                <LoadingSkeleton key={index} className="h-40 bg-gray-800" />
              ))}
            </div>
          ) : recommended_movies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {recommended_movies.slice(0, 6).map(rec_movie => (
                <div
                  key={rec_movie._id}
                  onClick={() => navigate(`/watch?v_id=${rec_movie._id}`)}
                  className="cursor-pointer group"
                >
                  <div className="relative overflow-hidden rounded-lg mb-2 aspect-video">
                    <img
                      src={rec_movie.thumbnail_image}
                      alt={rec_movie.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all">
                      <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <h3 className="font-medium text-sm line-clamp-2 group-hover:text-indigo-400 transition-colors">
                    {rec_movie.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {rec_movie.views?.toLocaleString() || 0} views
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No recommendations available</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Watch