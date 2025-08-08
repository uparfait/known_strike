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
    <div className="card hover:scale-105 transform transition-all duration-300" onClick={handleWatch}>
      <div className="relative">
        <img
          src={movie.thumbnail_image || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={movie.name || 'No name'}
          className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-lg"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleWatch}
            className="btn-iron mr-1 sm:mr-2 p-2 sm:p-3"
          >
            <Play size={16} className="sm:w-5 sm:h-5" />
          </button>
          {showActions && (
            <>
              <button
                onClick={handleEdit}
                className="btn-iron mr-1 sm:mr-2 p-2 sm:p-3"
              >
                <Edit size={14} className="sm:w-4 sm:h-4" />
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(movie._id)}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 sm:p-3 rounded-lg mr-1 sm:mr-2 transition-all duration-300"
                >
                  <Trash2 size={14} className="sm:w-4 sm:h-4" />
                </button>
              )}
              <button
                onClick={handleDownload}
                className="bg-green-600 hover:bg-green-700 text-white p-2 sm:p-3 rounded-lg transition-all duration-300"
              >
                <Download size={14} className="sm:w-4 sm:h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 sm:mt-4">
        <h3 className="text-text-primary font-semibold text-base sm:text-lg mb-2 truncate">
          {movie.name || 'No name'}
        </h3>

        <div className="flex items-center text-text-secondary text-xs sm:text-sm mb-2">
          <User size={12} className="mr-1 sm:w-4 sm:h-4" />
          <span className="truncate">{movie.interpreter || movie.display_language}</span>
        </div>

        <div className="flex items-center text-text-secondary text-xs sm:text-sm mb-3">
          <Languages size={12} className="mr-1 sm:w-4 sm:h-4" />
          <span>{movie.display_language || 'N/A'}</span>
        </div>

        <div className="flex justify-between text-text-secondary text-xs sm:text-sm">
          <div className="flex items-center">
            <Eye size={12} className="mr-1 sm:w-4 sm:h-4" />
            <span>{movie.views_short || 0}</span>
          </div>
          <div className="flex items-center">
            <Download size={12} className="mr-1 sm:w-4 sm:h-4" />
            <span>{movie.download_count_short || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieCard
