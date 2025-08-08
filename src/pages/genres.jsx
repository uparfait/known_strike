
import React, { useState, useEffect } from 'react'
import { Tag, Plus, Trash2 } from 'lucide-react'
import LoadingSkeleton from '../components/common/loading_skeleton'
import { useApp } from '../contexts/app_context'
import toast from 'react-hot-toast'

const Genres = () => {
  const { api_request } = useApp()
  const [genres, set_genres] = useState([])
  const [loading, set_loading] = useState(true)
  const [adding, set_adding] = useState(false)
  const [new_genre, set_new_genre] = useState('')
  const [show_form, set_show_form] = useState(false)

  useEffect(() => {
    load_genres()
  }, [])

  const load_genres = async () => {
    try {
      set_loading(true)
      const response = await api_request('GET', '/genres')
      if (response.data.success) {
        set_genres(response.data.genres || [])
      }
    } catch (error) {
      toast.error('Failed to load genres')
    } finally {
      set_loading(false)
    }
  }

  const handle_add_genre = async (e) => {
    e.preventDefault()
    if (!new_genre.trim()) return
    
    try {
      set_adding(true)
      const response = await api_request('POST', '/add/genre', {
        name: new_genre.trim()
      })
      
      if (response.data.success) {
        await load_genres()
        set_new_genre('')
        set_show_form(false)
        toast.success('Genre added successfully')
      } else {
        toast.error(response.data.error || 'Failed to add genre')
      }
    } catch (error) {
      toast.error('Failed to add genre' + error.message)
    } finally {
      set_adding(false)
    }
  }

  const handle_delete_genre = async (genre_id) => {
    if (!confirm('Are you sure you want to delete this genre? This will affect all movies with this genre.')) return
    
    try {
      const response = await api_request('DELETE', `/genre/${genre_id}`)
      if (response.data.success) {
        set_genres(prev => prev.filter(g => g._id !== genre_id))
        toast.success('Genre deleted successfully')
      } else {
        toast.error(response.data.message || 'Failed to delete genre')
      }
    } catch (error) {
      toast.error('Failed to delete genre')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-semibold">Genres</h1>
        </div>
        
        <button
          onClick={() => set_show_form(!show_form)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Genre
        </button>
      </div>

      {/* Add Genre Form */}
      {show_form && (
        <div className="bg-secondary p-6 rounded-lg border border-tertiary">
          <form onSubmit={handle_add_genre} className="flex gap-4">
            <input
              type="text"
              value={new_genre}
              onChange={(e) => set_new_genre(e.target.value)}
              placeholder="Enter genre name"
              className="input flex-1"
              required
            />
            <button
              type="submit"
              disabled={adding}
              className="btn-primary"
            >
              {adding ? 'Adding...' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => {
                set_show_form(false)
                set_new_genre('')
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Genres List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill().map((_, index) => (
            <LoadingSkeleton key={index} className="h-24" />
          ))}
        </div>
      ) : genres.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {genres.map((genre) => (
            <div
              key={genre._id}
              className="bg-secondary p-4 rounded-lg border border-tertiary hover:border-accent transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-accent" />
                  <div>
                    <h3 className="font-semibold">{genre.name}</h3>
                    <p className="text-sm text-text-secondary">
                      Saved
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handle_delete_genre(genre._id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-1 rounded"
                  title="Delete genre"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No genres found</h3>
          <p className="text-text-secondary mb-4">
            Create your first genre to organize movies
          </p>
          <button
            onClick={() => set_show_form(true)}
            className="btn-primary"
          >
            Add Genre
          </button>
        </div>
      )}
    </div>
  )
}

export default Genres
