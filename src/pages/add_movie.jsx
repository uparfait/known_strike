import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Edit, Search, X, Image, Link, Calendar, Globe, Play, Download, FileText, Users, Film } from 'lucide-react'
import LoadingSkeleton from '../components/common/loading_skeleton'
import SearchSuggestions from '../components/common/search_suggestions'
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
  const [show_linked_search, set_show_linked_search] = useState(false)
  const [linked_search_query, set_linked_search_query] = useState('')

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

  useEffect(() => {
    load_genres()
    if (is_editing) {
      load_movie_details()
    }
  }, [id])

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
      <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto px-4 sm:px-0">
        <LoadingSkeleton className="h-8 w-64" />
        <LoadingSkeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto px-4 sm:px-0">
      {/* Header */}
      <div className="flex items-center gap-3">
        {is_editing ? <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-accent" /> : <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />}
        <h1 className="text-xl sm:text-2xl font-semibold">
          {is_editing ? 'Edit Movie' : 'Add Movie'}
        </h1>
      </div>

      <form onSubmit={handle_submit} className="card space-y-6 sm:space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Film className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-medium">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="label">Movie Name *</label>
              <input
                type="text"
                value={form_data.name}
                onChange={(e) => handle_input_change('name', e.target.value)}
                className="input w-full"
                placeholder="Enter movie title"
                required
              />
            </div>

            <div>
              <label className="label">Genre *</label>
              <div className="flex gap-2">
                <select
                  value={form_data.genre}
                  onChange={(e) => handle_input_change('genre', e.target.value)}
                  className="input flex-1"
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
                  className="btn-iron px-3 py-2 text-sm"
                  title="Add new genre"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {show_genre_form && (
                <div className="flex gap-2 mt-3 p-3 bg-tertiary rounded-lg border border-slate-600">
                  <input
                    type="text"
                    value={new_genre}
                    onChange={(e) => set_new_genre(e.target.value)}
                    placeholder="New genre name"
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={handle_add_genre}
                    className="btn-iron px-3 py-2 text-sm"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      set_show_genre_form(false)
                      set_new_genre('')
                    }}
                    className="btn-secondary px-3 py-2 text-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Media Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Image className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-medium">Media & Links</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="label flex items-center gap-2">
                <Image className="w-4 h-4" />
                Thumbnail URL *
              </label>
              <input
                type="url"
                value={form_data.thumbnail_image}
                onChange={(e) => handle_input_change('thumbnail_image', e.target.value)}
                className="input w-full"
                placeholder="https://example.com/poster.jpg"
                required
              />
              {form_data.thumbnail_image && (
                <div className="mt-3">
                  <img
                    src={form_data.thumbnail_image}
                    alt="Thumbnail preview"
                    className="w-full max-w-xs h-48 object-cover rounded-lg border border-slate-600"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      toast.error('Invalid image URL')
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="label flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Watch URL *
                </label>
                <input
                  type="url"
                  value={form_data.watch_url}
                  onChange={(e) => handle_input_change('watch_url', e.target.value)}
                  className="input w-full"
                  placeholder="https://example.com/watch"
                  required
                />
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download URL *
                </label>
                <input
                  type="url"
                  value={form_data.download_url}
                  onChange={(e) => handle_input_change('download_url', e.target.value)}
                  className="input w-full"
                  placeholder="https://example.com/download"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-medium">Description</h2>
          </div>

          <div>
            <label className="label">Movie Description (100-500 characters) *</label>
            <textarea
              value={form_data.description}
              onChange={(e) => handle_input_change('description', e.target.value)}
              className="input w-full h-32 resize-none"
              placeholder="Enter a detailed description of the movie..."
              minLength="100"
              maxLength="500"
              required
            />
            <div className={`text-sm mt-2 ${form_data.description.length < 100 ? 'text-red-400' :
                form_data.description.length > 500 ? 'text-red-400' : 'text-green-400'
              }`}>
              {form_data.description.length}/500 characters
              {form_data.description.length < 100 && ' (minimum 100)'}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-medium">Additional Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Release Date
              </label>
              <input
                type="date"
                value={form_data.release_date}
                onChange={(e) => handle_input_change('release_date', e.target.value)}
                className="input w-full"
              />
            </div>

            <div>
              <label className="label flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Language *
              </label>
              <input
                type="text"
                value={form_data.display_language}
                onChange={(e) => handle_input_change('display_language', e.target.value)}
                className="input w-full"
                placeholder="English, Spanish, etc."
                required
              />
            </div>

            <div>
              <label className="label">Views</label>
              <input
                type="number"
                value={form_data.views}
                onChange={(e) => handle_input_change('views', parseInt(e.target.value) || 0)}
                className="input w-full"
                min="0"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Special Features Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-medium">Special Features</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interpretation */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-600 hover:border-accent transition-colors">
                <input
                  type="checkbox"
                  checked={form_data.is_interpreted}
                  onChange={(e) => handle_input_change('is_interpreted', e.target.checked)}
                  className="checkbox"
                />
                <span className="label">Is Interpreted?</span>
              </label>

              {form_data.is_interpreted && (
                <div className="pl-3">
                  <label className="label">Interpreter</label>
                  <input
                    type="text"
                    value={form_data.interpreter}
                    onChange={(e) => handle_input_change('interpreter', e.target.value)}
                    className="input w-full"
                    placeholder="Interpreter name"
                  />
                </div>
              )}
            </div>

            {/* Series */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-600 hover:border-accent transition-colors">
                <input
                  type="checkbox"
                  checked={form_data.is_serie}
                  onChange={(e) => handle_input_change('is_serie', e.target.checked)}
                  className="checkbox"
                />
                <span className="label">Is Series?</span>
              </label>

              {form_data.is_serie && (
                <div className="pl-3 space-y-3">
                  <div>
                    <label className="label">Linked Serie ID</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={form_data.linked_serie}
                        onChange={(e) => handle_input_change('linked_serie', e.target.value)}
                        className="input flex-1"
                        placeholder="Enter serie ID or search movie"
                      />
                      <button
                        type="button"
                        onClick={() => set_show_linked_search(!show_linked_search)}
                        className="btn-iron px-3 py-2"
                        title="Search for linked movie"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                      {show_linked_search && (
                        <div className="p-3 bg-tertiary rounded-lg border border-slate-600">
                          <input
                            type="text"
                            value={linked_search_query}
                            onChange={e => set_linked_search_query(e.target.value)}
                            className="input w-full mb-3"
                            placeholder="Type to search for movie to link serie..."
                          />
                          <SearchSuggestions
                            query={linked_search_query}
                            onSuggestionClick={handle_linked_movie_select}
                            onClose={() => set_show_linked_search(false)}
                            isVisible={show_linked_search}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-600">
          <button
            type="submit"
            disabled={submitting}
            className="btn-iron w-full sm:w-auto px-8 py-3 text-base font-medium"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {is_editing ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {is_editing ? 'Update Movie' : 'Add Movie'}
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/movies')}
            className="btn-secondary w-full sm:w-auto px-8 py-3 text-base font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddMovie