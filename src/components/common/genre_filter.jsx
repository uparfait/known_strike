
import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../../contexts/auth_context'
import { useApp } from '../../contexts/app_context'
import axios from 'axios'

const GenreFilter = () => {
  const { API_BASE_URL, get_auth_headers } = useAuth()
  const { genres, set_genres } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [scroll_position, set_scroll_position] = useState(0)

  useEffect(() => {
    fetch_genres()
  }, [])

  const fetch_genres = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/genres`, {
        headers: get_auth_headers()
      })
      if (response.data.success) {
        set_genres(response.data.genres)
      }
    } catch (error) {
      console.error('Error fetching genres:', error)
    }
  }

  const handle_genre_click = (genre) => {
    if (genre === 'All') {
      navigate('/movies')
    } else {
      navigate(`/category?category=${encodeURIComponent(genre)}`)
    }
  }

  const scroll_left = () => {
    const container = document.getElementById('genre-scroll')
    container.scrollLeft -= 200
    set_scroll_position(container.scrollLeft - 200)
  }

  const scroll_right = () => {
    const container = document.getElementById('genre-scroll')
    container.scrollLeft += 200
    set_scroll_position(container.scrollLeft + 200)
  }

  const get_active_genre = () => {
    const params = new URLSearchParams(location.search)
    return params.get('category') || 'All'
  }

  return (
    <div className="bg-dark-200 border-b border-gray-700 px-6 py-3">
      <div className="flex items-center">
        <button
          onClick={scroll_left}
          className="p-1 rounded-full hover:bg-dark-300 text-gray-400 hover:text-white mr-2"
        >
          <ChevronLeft size={20} />
        </button>

        <div
          id="genre-scroll"
          className="flex space-x-3 overflow-x-auto scrollbar-hide flex-1"
        >
          <button
            onClick={() => handle_genre_click('All')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              get_active_genre() === 'All'
                ? 'bg-white text-black'
                : 'bg-dark-300 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All
          </button>
          
          {genres.map((genre) => (
            <button
              key={genre._id}
              onClick={() => handle_genre_click(genre.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                get_active_genre() === genre.name
                  ? 'bg-white text-black'
                  : 'bg-dark-300 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>

        <button
          onClick={scroll_right}
          className="p-1 rounded-full hover:bg-dark-300 text-gray-400 hover:text-white ml-2"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}

export default GenreFilter
