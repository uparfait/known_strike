import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Edit, Search, X, Image, Link, Calendar, Globe, Play, Download, FileText, Users, Film } from 'lucide-react'
import LoadingSkeleton from '../components/common/loading_skeleton'
import { useApp } from '../contexts/app_context'
import toast from 'react-hot-toast'

const AddMovie = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { api_request } = useApp()
  const is_editing = Boolean(id)

  const [loading, set_loading] = useState(is_editing)
  const [submitting, set_submitting] = useState(false)
  const [genres, set_genres] = useState([])
  const [show_genre_form, set_show_genre_form] = useState(false)
  const [new_genre, set_new_genre] = useState('')

  // Search suggestions state
  const [show_linked_search, set_show_linked_search] = useState(false)
  const [linked_search_query, set_linked_search_query] = useState('')
  const [suggestions, set_suggestions] = useState([])
  const [suggestions_loading, set_suggestions_loading] = useState(false)

  const [form_data, set_form_data] = useState({
    name: '',
    genre: '',
    thumbnail_image: '',
    watch_url: '',
    download_url: '',
    description: '',
    release_date: '',
    display_language: '',
    views: 0,
    download_count: 0,
    is_interpreted: false,
    interpreter: '',
    is_serie: false,
    linked_serie: ''
  })

  // Load genres and movie details
  useEffect(() => {
    load_genres()
    if (is_editing) {
      load_movie_details()
    }
  }, [id])

  // Fetch search suggestions
  useEffect(() => {
    if (!show_linked_search || linked_search_query.length < 2) {
      set_suggestions([])
      return
    }

    const fetch_suggestions = async () => {
      set_suggestions_loading(true)
      try {
        const response = await api_request('GET', `/search?q=${encodeURIComponent(linked_search_query)}&limit=5`)
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
  }, [linked_search_query, show_linked_search, api_request])

  const load_genres = async () => {
    try {
      const response = await api_request('GET', '/genres')
      if (response.data.success) {
        set_genres(response.data.genres || [])
      }
    } catch (error) {
      toast.error('Failed to load genres')
    }
  }

  const load_movie_details = async () => {
    try {
      set_loading(true)
      const response = await api_request('GET', `/movies/${id}`)
      if (response.data.success) {
        const movie = response.data.movie
        set_form_data({
          name: movie.name || '',
          genre: movie.genre || '',
          thumbnail_image: movie.thumbnail_image || '',
          watch_url: movie.watch_url || '',
          download_url: movie.download_url || '',
          description: movie.description || '',
          release_date: movie.release_date || '',
          display_language: movie.display_language || '',
          views: movie.views || 0,
          download_count: movie.download_count || 0,
          is_interpreted: movie.is_interpreted || false,
          interpreter: movie.interpreter || '',
          is_serie: movie.is_serie || false,
          linked_serie: movie.linked_serie || ''
        })
      }
    } catch (error) {
      toast.error('Failed to load movie details')
      navigate('/movies')
    } finally {
      set_loading(false)
    }
  }

  const handle_input_change = (field, value) => {
    set_form_data(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handle_add_genre = async () => {
    if (!new_genre.trim()) return

    try {
      const response = await api_request('POST', '/add/genre', {
        name: new_genre.trim()
      })

      if (response.data.success) {
        await load_genres()
        set_form_data(prev => ({ ...prev, genre: new_genre.trim() }))
        set_new_genre('')
        set_show_genre_form(false)
        toast.success('Genre added successfully')
      } else {
        toast.error(response.data.message || 'Failed to add genre')
      }
    } catch (error) {
      toast.error('Failed to add genre')
    }
  }

  const handle_linked_movie_select = (movie) => {
    if (movie.linked_serie) {
      set_form_data(prev => ({ ...prev, linked_serie: movie.linked_serie }))
      set_show_linked_search(false)
      set_linked_search_query('')
      toast.success('Linked serie selected')
    } else {
      toast.error('Selected movie has no linked serie')
    }
  }

  const handle_submit = async (e) => {
    e.preventDefault()

    if (form_data.description.length < 100 || form_data.description.length > 500) {
      toast.error('Description must be between 100-500 characters')
      return
    }

    const submit_data = {
      ...form_data,
      interpreter: form_data.interpreter || null,
      linked_serie: form_data.linked_serie || null
    }

    try {
      set_submitting(true)
      const endpoint = is_editing ? `/movies/${id}` : '/movies'
      const method = is_editing ? 'PUT' : 'POST'

      const response = await api_request(method, endpoint, submit_data)

      if (response.data.success) {
        toast.success(`Movie ${is_editing ? 'updated' : 'added'} successfully`)
        navigate('/movies')
      } else {
        toast.error(response.data.message || `Failed to ${is_editing ? 'update' : 'add'} movie`)
      }
    } catch (error) {
      toast.error(`Failed to ${is_editing ? 'update' : 'add'} movie`)
    } finally {
      set_submitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {is_editing ? (
            <Edit className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          ) : (
            <Plus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          )}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {is_editing ? 'Edit Movie' : 'Add Movie'}
          </h1>
        </div>
        <button
          onClick={() => navigate('/movies')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>

      <form onSubmit={handle_submit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            <Film className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Movie Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Movie Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form_data.name}
                onChange={(e) => handle_input_change('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter movie title"
                required
              />
            </div>

            {/* Genre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Genre <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={form_data.genre}
                  onChange={(e) => handle_input_change('genre', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select Genre</option>
                  {genres.map(genre => (
                    <option key={genre._id} value={genre.name}>
                      {genre.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => set_show_genre_form(!show_genre_form)}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  title="Add new genre"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {show_genre_form && (
                <div className="flex gap-2 mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <input
                    type="text"
                    value={new_genre}
                    onChange={(e) => set_new_genre(e.target.value)}
                    placeholder="New genre name"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handle_add_genre}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      set_show_genre_form(false)
                      set_new_genre('')
                    }}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Media Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            <Image className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Media & Links</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <Image className="w-4 h-4" />
                Thumbnail URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={form_data.thumbnail_image}
                onChange={(e) => handle_input_change('thumbnail_image', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://example.com/poster.jpg"
                required
              />
              {form_data.thumbnail_image && (
                <div className="mt-3">
                  <img
                    src={form_data.thumbnail_image}
                    alt="Thumbnail preview"
                    className="w-full max-w-xs h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      toast.error('Invalid image URL')
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Watch URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Watch URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={form_data.watch_url}
                  onChange={(e) => handle_input_change('watch_url', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://example.com/watch"
                  required
                />
              </div>

              {/* Download URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={form_data.download_url}
                  onChange={(e) => handle_input_change('download_url', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://example.com/download"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Movie Description (100-500 characters) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form_data.description}
              onChange={(e) => handle_input_change('description', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white h-32 resize-none"
              placeholder="Enter a detailed description of the movie..."
              minLength="100"
              maxLength="500"
              required
            />
            <div className={`text-sm mt-2 ${form_data.description.length < 100 ? 'text-red-500' :
                form_data.description.length > 500 ? 'text-red-500' : 'text-green-600'
              }`}>
              {form_data.description.length}/500 characters
              {form_data.description.length < 100 && ' (minimum 100)'}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Additional Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Release Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Release Date
              </label>
              <input
                type="date"
                value={form_data.release_date}
                onChange={(e) => handle_input_change('release_date', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Language <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form_data.display_language}
                onChange={(e) => handle_input_change('display_language', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="English, Spanish, etc."
                required
              />
            </div>

            {/* Views */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Views
              </label>
              <input
                type="number"
                value={form_data.views}
                onChange={(e) => handle_input_change('views', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                min="0"
                placeholder="0"
              />
            </div>

            {/* downloads */}

             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Downloads
              </label>
              <input
                type="number"
                value={form_data.download_count}
                onChange={(e) => handle_input_change('download_count', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                min="0"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Special Features Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Special Features</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interpretation */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-indigo-500 transition-colors">
                <input
                  type="checkbox"
                  checked={form_data.is_interpreted}
                  onChange={(e) => handle_input_change('is_interpreted', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Is Interpreted?</span>
              </label>

              {form_data.is_interpreted && (
                <div className="pl-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Interpreter
                  </label>
                  <input
                    type="text"
                    value={form_data.interpreter}
                    onChange={(e) => handle_input_change('interpreter', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Interpreter name"
                  />
                </div>
              )}
            </div>

            {/* Series */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-indigo-500 transition-colors">
                <input
                  type="checkbox"
                  checked={form_data.is_serie}
                  onChange={(e) => handle_input_change('is_serie', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Is Series?</span>
              </label>

              {form_data.is_serie && (
                <div className="pl-3 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Linked Serie ID
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form_data.linked_serie}
                        onChange={(e) => handle_input_change('linked_serie', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter serie ID or search movie"
                      />
                      <button
                        type="button"
                        onClick={() => set_show_linked_search(!show_linked_search)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        title="Search for linked movie"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </div>

                    {show_linked_search && (
                      <div className="mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <Search size={12} />
                            Search suggestions
                          </span>
                          <button
                            onClick={() => set_show_linked_search(false)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                          >
                            <X size={12} />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={linked_search_query}
                          onChange={e => set_linked_search_query(e.target.value)}
                          className="w-full px-4 py-2 border-b border-gray-200 dark:border-gray-600 focus:outline-none dark:bg-gray-700 dark:text-white"
                          placeholder="Type to search for movie to link serie..."
                        />

                        {suggestions_loading ? (
                          <div className="p-4 text-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mx-auto"></div>
                          </div>
                        ) : suggestions.length > 0 ? (
                          <div className="py-1 max-h-60 overflow-y-auto">
                            {suggestions.map((suggestion, index) => (
                              <button
                                key={suggestion._id || index}
                                className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-800 dark:text-white flex items-center gap-3"
                                onClick={() => handle_linked_movie_select(suggestion)}
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
                                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {suggestion.genre || 'Unknown'} | {suggestion.display_language || 'Unknown'}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : linked_search_query.length > 1 ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                            <Film size={24} className="mx-auto mb-2 opacity-50" />
                            No movies found for "{linked_search_query}"
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {is_editing ? 'Updating...' : 'Adding...'}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                {is_editing ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {is_editing ? 'Update Movie' : 'Add Movie'}
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddMovie