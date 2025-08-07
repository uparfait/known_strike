
import React from 'react'
import { Eye, Download, Play, Edit, Trash2, Languages, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const MovieCard = ({ movie, onEdit, onDelete, showActions = true }) => {
  const navigate = useNavigate()

  const handleWatch = () => {
    navigate(`/watch?id=${movie._id}`)
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(movie._id)
    } else {
      navigate(`/edit-movie/${movie._id}`)
    }
  }

  return (
    <div className="card hover:scale-105 transform transition-all duration-300">
      <div className="relative">
        <img
          src={movie.poster || '/placeholder-movie.jpg'}
          alt={movie.name}
          className="w-full h-64 object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleWatch}
            className="btn-primary mr-2"
          >
            <Play size={20} />
          </button>
          {showActions && (
            <>
              <button
                onClick={handleEdit}
                className="btn-secondary mr-2"
              >
                <Edit size={16} />
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(movie._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-text-primary font-semibold text-lg mb-2 truncate">
          {movie.name}
        </h3>
        
        <div className="flex items-center text-text-secondary text-sm mb-2">
          <User size={14} className="mr-1" />
          <span className="truncate">{movie.interpreter}</span>
        </div>
        
        <div className="flex items-center text-text-secondary text-sm mb-3">
          <Languages size={14} className="mr-1" />
          <span>{movie.display_language}</span>
        </div>
        
        <div className="flex justify-between text-text-secondary text-sm">
          <div className="flex items-center">
            <Eye size={14} className="mr-1" />
            <span>{movie.views || 0}</span>
          </div>
          <div className="flex items-center">
            <Download size={14} className="mr-1" />
            <span>{movie.downloads || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieCard

const MovieCard = ({ movie, show_actions = false, on_delete, on_edit }) => {
  const navigate = useNavigate()

  const handle_watch = () => {
    navigate(`/watch?v_id=${movie._id}`)
  }

  const handle_download = () => {
    if (movie.download_url) {
      const link = document.createElement('a')
      link.href = movie.download_url
      link.download = movie.name
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="card hover:transform hover:scale-105 transition-all duration-300">
      <div className="relative">
        <img
          src={movie.thumbnail_image}
          alt={movie.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={handle_watch}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors"
          >
            <Play size={24} />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{movie.name}</h3>
        
        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye size={16} />
              <span>{movie.views_short || movie.views || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Download size={16} />
              <span>{movie.download_count_short || movie.download_count || 0}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {movie.interpreter ? (
              <>
                <User size={16} />
                <span className="text-xs">{movie.interpreter}</span>
              </>
            ) : (
              <>
                <Languages size={16} />
                <span className="text-xs">{movie.display_language}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
            {movie.genre}
          </span>
          
          {show_actions && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => on_edit(movie)}
                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-dark-300 rounded"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => on_delete(movie)}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-300 rounded"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={handle_download}
                className="p-2 text-gray-400 hover:text-green-400 hover:bg-dark-300 rounded"
              >
                <Download size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MovieCard
