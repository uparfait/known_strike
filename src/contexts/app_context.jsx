
import React, { createContext, useContext, useState } from 'react'
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
  // useAuth must be called inside the component, not at module scope
  let api_request = apiRequest;
  try {
    // Dynamically require useAuth only if React context is available
    // This avoids invalid hook call at module scope
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { useAuth } = require('./auth_context');
    const auth = useAuth();
    if (auth && auth.api_request) {
      api_request = auth.api_request;
    }
  } catch (e) {
    // fallback to default apiRequest
  }
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

  // Backend API integrations for all endpoints
  // Example: logs, comments, admin actions
  const getLogs = async () => {
    return await api_request('GET', '/logs');
  };
  const clearLogs = async () => {
    return await api_request('POST', '/logs/clear');
  };
  const getComments = async (movieId) => {
    return await api_request('GET', `/comments/${movieId}`);
  };
  const saveComment = async (data) => {
    return await api_request('POST', '/comment', data);
  };
  const deleteComment = async (commentId) => {
    return await api_request('DELETE', `/comment/${commentId}`);
  };
  const hitComment = async (data) => {
    return await api_request('POST', '/comment/hit', data);
  };
  const getWatchList = async (userId) => {
    return await api_request('GET', `/watchlist/${userId}`);
  };
  const addToWatchList = async (data) => {
    return await api_request('POST', '/watchlist', data);
  };
  const removeFromWatchList = async (data) => {
    return await api_request('DELETE', '/watchlist', data);
  };

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
    // Backend API
    getLogs,
    clearLogs,
    getComments,
    saveComment,
    deleteComment,
    hitComment,
    getWatchList,
    addToWatchList,
    removeFromWatchList,
    setCurrentPage,
    
    // Actions
    addLoadedMovieIds,
    addLoadedPopularIds,
    addLoadedSearchIds,
    addLoadedGenreIds,
    resetLoadedIds,
    fetchGenres,
    
    // API access
    api_request
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
