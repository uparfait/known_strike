
import React, { useState, useEffect } from 'react'
import { api } from '../../utils/api'

const GenreFilter = ({ selectedGenre, onGenreChange, className = '' }) => {
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGenres()
  }, [])

  const fetchGenres = async () => {
    try {
      const response = await api.get('/get-all-genres')
      if (response.data.success) {
        setGenres(response.data.genres)
      }
    } catch (error) {
      console.error('Error fetching genres:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`flex space-x-2 ${className}`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="skeleton h-8 w-20"></div>
        ))}
      </div>
    )
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <button
        onClick={() => onGenreChange('')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
          selectedGenre === ''
            ? 'bg-accent-primary text-white'
            : 'bg-secondary hover:bg-tertiary text-text-primary'
        }`}
      >
        All Genres
      </button>
      
      {genres.map((genre) => (
        <button
          key={genre._id}
          onClick={() => onGenreChange(genre.name)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
            selectedGenre === genre.name
              ? 'bg-accent-primary text-white'
              : 'bg-secondary hover:bg-tertiary text-text-primary'
          }`}
        >
          {genre.name}
        </button>
      ))}
    </div>
  )
}

export default GenreFilter
