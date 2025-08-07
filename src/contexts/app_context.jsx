
import React, { createContext, useContext, useState } from 'react'
import { useAuth } from './auth_context'
import { apiRequest } from '../utils/api'

const AppContext = createContext({})

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const { api_request } = useAuth()
  const [loaded_movie_ids, setLoadedMovieIds] = useState([])
  const [loaded_popular_ids, setLoadedPopularIds] = useState([])
  const [loaded_search_ids, setLoadedSearchIds] = useState([])
  const [loaded_genre_ids, setLoadedGenreIds] = useState({})
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(false)
  const [search_query, setSearchQuery] = useState('')
  const [current_page, setCurrentPage] = useState('dashboard')

  const addLoadedMovieIds = (ids) => {
    setLoadedMovieIds(prev => [...new Set([...prev, ...ids])])
  }

  const addLoadedPopularIds = (ids) => {
    setLoadedPopularIds(prev => [...new Set([...prev, ...ids])])
  }

  const addLoadedSearchIds = (ids) => {
    setLoadedSearchIds(prev => [...new Set([...prev, ...ids])])
  }

  const addLoadedGenreIds = (genre, ids) => {
    setLoadedGenreIds(prev => ({
      ...prev,
      [genre]: [...new Set([...(prev[genre] || []), ...ids])]
    }))
  }

  const resetLoadedIds = (type) => {
    switch(type) {
      case 'movies':
        setLoadedMovieIds([])
        break
      case 'popular':
        setLoadedPopularIds([])
        break
      case 'search':
        setLoadedSearchIds([])
        break
      case 'genres':
        setLoadedGenreIds({})
        break
      case 'all':
        setLoadedMovieIds([])
        setLoadedPopularIds([])
        setLoadedSearchIds([])
        setLoadedGenreIds({})
        break
      default:
        break
    }
  }

  // Fetch genres function
  const fetchGenres = async () => {
    try {
      setLoading(true)
      const response = await api_request('GET', '/api/genres')
      setGenres(response.genres || [])
      return response.genres || []
    } catch (error) {
      console.error('Failed to fetch genres:', error)
      return []
    } finally {
      setLoading(false)
    }
  }

  const value = {
    // State
    loaded_movie_ids,
    loaded_popular_ids,
    loaded_search_ids,
    loaded_genre_ids,
    genres,
    loading,
    search_query,
    current_page,
    
    // Setters
    setGenres,
    setLoading,
    setSearchQuery,
    setCurrentPage,
    
    // Actions
    addLoadedMovieIds,
    addLoadedPopularIds,
    addLoadedSearchIds,
    addLoadedGenreIds,
    resetLoadedIds,
    fetchGenres,
    
    // API access
    api_request: apiRequest
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
