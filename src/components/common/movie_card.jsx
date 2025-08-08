
import React from 'react'
import { Eye, Download, Play, Edit, Trash2, Languages, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const MovieCard = ({ movie, onEdit, onDelete, showActions = true }) => {
  // Debug log for movie object
  console.log('Rendering MovieCard:', movie)
  
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

  const handleDownload = () => {
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
    <div className="card hover:scale-105 transform transition-all duration-300">
      <div className="relative">
        <img
          src={movie.thumbnail_image || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={movie.name || 'No name'}
          className="w-full h-64 object-cover rounded-lg"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'
          }}
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
              <button
                onClick={handleDownload}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg"
              >
                <Download size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-text-primary font-semibold text-lg mb-2 truncate">
          {movie.name || 'No name'}
        </h3>

        <div className="flex items-center text-text-secondary text-sm mb-2">
          <User size={14} className="mr-1" />
          <span className="truncate">{movie.interpreter || 'N/A'}</span>
        </div>

        <div className="flex items-center text-text-secondary text-sm mb-3">
          <Languages size={14} className="mr-1" />
          <span>{movie.display_language || 'N/A'}</span>
        </div>

        <div className="flex justify-between text-text-secondary text-sm">
          <div className="flex items-center">
            <Eye size={14} className="mr-1" />
            <span>{movie.views || 0}</span>
          </div>
          <div className="flex items-center">
            <Download size={14} className="mr-1" />
            <span>{movie.download_count || 0}</span>
          </div>
        </div>

        {movie.genre && (
          <div className="mt-2">
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
              {movie.genre}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default MovieCard
