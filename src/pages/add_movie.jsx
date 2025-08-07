
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Edit, Search, X } from 'lucide-react'
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
      <div className="space-y-6">
        <LoadingSkeleton className="h-8 w-64" />
        <LoadingSkeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {is_editing ? <Edit className="w-6 h-6 text-accent" /> : <Plus className="w-6 h-6 text-accent" />}
        <h1 className="text-2xl font-semibold">
          {is_editing ? 'Edit Movie' : 'Add Movie'}
        </h1>
      </div>

      <form onSubmit={handle_submit} className="bg-secondary p-6 rounded-lg border border-tertiary space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Movie Name *</label>
            <input
              type="text"
              value={form_data.name}
              onChange={(e) => handle_input_change('name', e.target.value)}
              className="input w-full"
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
                className="btn-secondary px-3"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {show_genre_form && (
              <div className="flex gap-2 mt-2">
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
                  className="btn-primary"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    set_show_genre_form(false)
                    set_new_genre('')
                  }}
                  className="btn-secondary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Media URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Thumbnail URL *</label>
            <input
              type="url"
              value={form_data.thumbnail_image}
              onChange={(e) => handle_input_change('thumbnail_image', e.target.value)}
              className="input w-full"
              required
            />
            {form_data.thumbnail_image && (
              <img
                src={form_data.thumbnail_image}
                alt="Thumbnail preview"
                className="mt-2 w-full h-32 object-cover rounded"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
          </div>
          
          <div>
            <label className="label">Watch URL *</label>
            <input
              type="url"
              value={form_data.watch_url}
              onChange={(e) => handle_input_change('watch_url', e.target.value)}
              className="input w-full"
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Download URL *</label>
          <input
            type="url"
            value={form_data.download_url}
            onChange={(e) => handle_input_change('download_url', e.target.value)}
            className="input w-full"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="label">Description (100-500 characters) *</label>
          <textarea
            value={form_data.description}
            onChange={(e) => handle_input_change('description', e.target.value)}
            className="input w-full h-32 resize-none"
            minLength="100"
            maxLength="500"
            required
          />
          <div className="text-sm text-text-secondary mt-1">
            {form_data.description.length}/500 characters
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Release Date</label>
            <input
              type="date"
              value={form_data.release_date}
              onChange={(e) => handle_input_change('release_date', e.target.value)}
              className="input w-full"
            />
          </div>
          
          <div>
            <label className="label">Display Language *</label>
            <input
              type="text"
              value={form_data.display_language}
              onChange={(e) => handle_input_change('display_language', e.target.value)}
              className="input w-full"
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
            />
          </div>
        </div>

        {/* Interpretation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form_data.is_interpreted}
                onChange={(e) => handle_input_change('is_interpreted', e.target.checked)}
                className="checkbox"
              />
              <span className="label">Is Interpreted?</span>
            </label>
          </div>
          
          {form_data.is_interpreted && (
            <div>
              <label className="label">Interpreter</label>
              <input
                type="text"
                value={form_data.interpreter}
                onChange={(e) => handle_input_change('interpreter', e.target.value)}
                className="input w-full"
              />
            </div>
          )}
        </div>

        {/* Series */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form_data.is_serie}
                onChange={(e) => handle_input_change('is_serie', e.target.checked)}
                className="checkbox"
              />
              <span className="label">Is Series?</span>
            </label>
          </div>
          
          {form_data.is_serie && (
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
                  className="btn-secondary px-3"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
              
              {show_linked_search && (
                <div className="mt-2">
                  <SearchSuggestions
                    query={linked_search_query}
                    on_query_change={set_linked_search_query}
                    on_select={handle_linked_movie_select}
                    placeholder="Search for movie to link serie..."
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1 sm:flex-none"
          >
            {submitting ? 'Saving...' : (is_editing ? 'Update Movie' : 'Add Movie')}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/movies')}
            className="btn-secondary flex-1 sm:flex-none"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddMovie
