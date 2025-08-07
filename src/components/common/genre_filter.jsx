
import React, { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

const GenreFilter = ({ 
  genres = [], 
  selectedGenre = '', 
  onGenreChange, 
  loading = false 
}) => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.genre-filter')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleGenreSelect = (genre) => {
    onGenreChange(genre)
    setIsOpen(false)
  }

  if (loading) {
    return (
      <div className="animate-pulse bg-tertiary h-10 w-48 rounded-lg"></div>
    )
  }

  return (
    <div className="relative genre-filter">
      <button
        className="flex items-center justify-between w-48 px-4 py-2 bg-secondary border border-tertiary rounded-lg hover:bg-tertiary transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-text-primary">
          {selectedGenre || 'All Genres'}
        </span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-secondary border border-tertiary rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <button
            className="w-full px-4 py-2 text-left hover:bg-tertiary transition-colors text-text-primary"
            onClick={() => handleGenreSelect('')}
          >
            All Genres
          </button>
          {genres.map((genre) => (
            <button
              key={genre._id || genre.name}
              className="w-full px-4 py-2 text-left hover:bg-tertiary transition-colors text-text-primary"
              onClick={() => handleGenreSelect(genre.name)}
            >
              {genre.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default GenreFilter
