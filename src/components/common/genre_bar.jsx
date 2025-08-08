import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '../../contexts/app_context'

const GenreBar = ({ selectedGenre = '', onGenreSelect, className = '' }) => {
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const { api_request } = useApp()

  useEffect(() => {
    fetchGenres()
  }, [])

  const fetchGenres = async () => {
    setLoading(true)
    try {
      const response = await api_request('GET', '/genres')
      if (response.data && response.data.success) {
        setGenres(response.data.genres || response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching genres:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenreClick = (genre) => {
    onGenreSelect(genre === selectedGenre ? '' : genre)
  }

  const scrollGenres = (direction) => {
    const container = document.getElementById('genre-scroll-container')
    if (container) {
      const scrollAmount = 200
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount)
      
      container.scrollTo({ left: newPosition, behavior: 'smooth' })
      setScrollPosition(newPosition)
    }
  }

  if (loading) {
    return (
      <div className={`genre-bar ${className}`}>
        {[...Array(8)].map((_, index) => (
          <div key={index} className="animate-pulse bg-tertiary h-8 w-20 sm:w-24 rounded-full"></div>
        ))}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center">
        {/* Left scroll button - hidden on mobile */}
        <button
          onClick={() => scrollGenres('left')}
          className="hidden sm:flex items-center justify-center w-8 h-8 bg-secondary border border-tertiary rounded-full mr-2 hover:bg-tertiary transition-colors"
          disabled={scrollPosition === 0}
        >
          <ChevronLeft size={16} />
        </button>

        {/* Genre container */}
        <div 
          id="genre-scroll-container"
          className="genre-bar flex-1"
          onScroll={(e) => setScrollPosition(e.target.scrollLeft)}
        >
          {/* All Genres option */}
          <button
            onClick={() => handleGenreClick('')}
            className={`genre-item ${selectedGenre === '' ? 'active' : ''}`}
          >
            All Genres
          </button>

          {/* Individual genres */}
          {genres.map((genre, index) => (
            <button
              key={genre._id || genre.name || index}
              onClick={() => handleGenreClick(genre.name || genre)}
              className={`genre-item ${selectedGenre === (genre.name || genre) ? 'active' : ''}`}
            >
              {genre.name || genre}
            </button>
          ))}
        </div>

        {/* Right scroll button - hidden on mobile */}
        <button
          onClick={() => scrollGenres('right')}
          className="hidden sm:flex items-center justify-center w-8 h-8 bg-secondary border border-tertiary rounded-full ml-2 hover:bg-tertiary transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

export default GenreBar