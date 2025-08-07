
import React, { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [loaded_movie_ids, set_loaded_movie_ids] = useState([])
  const [loaded_popular_ids, set_loaded_popular_ids] = useState([])
  const [loaded_search_ids, set_loaded_search_ids] = useState([])
  const [loaded_genre_ids, set_loaded_genre_ids] = useState({})
  const [genres, set_genres] = useState([])

  const add_loaded_movie_ids = (ids) => {
    set_loaded_movie_ids(prev => [...new Set([...prev, ...ids])])
  }

  const add_loaded_popular_ids = (ids) => {
    set_loaded_popular_ids(prev => [...new Set([...prev, ...ids])])
  }

  const add_loaded_search_ids = (ids) => {
    set_loaded_search_ids(prev => [...new Set([...prev, ...ids])])
  }

  const add_loaded_genre_ids = (genre, ids) => {
    set_loaded_genre_ids(prev => ({
      ...prev,
      [genre]: [...new Set([...(prev[genre] || []), ...ids])]
    }))
  }

  const reset_loaded_ids = (type) => {
    switch(type) {
      case 'movies':
        set_loaded_movie_ids([])
        break
      case 'popular':
        set_loaded_popular_ids([])
        break
      case 'search':
        set_loaded_search_ids([])
        break
      case 'all':
        set_loaded_movie_ids([])
        set_loaded_popular_ids([])
        set_loaded_search_ids([])
        set_loaded_genre_ids({})
        break
    }
  }

  const value = {
    loaded_movie_ids,
    loaded_popular_ids,
    loaded_search_ids,
    loaded_genre_ids,
    genres,
    set_genres,
    add_loaded_movie_ids,
    add_loaded_popular_ids,
    add_loaded_search_ids,
    add_loaded_genre_ids,
    reset_loaded_ids
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
import React, { createContext, useContext, useState } from 'react'

const AppContext = createContext({})

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [loaded_movie_ids, setLoadedMovieIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [search_query, setSearchQuery] = useState('')
  const [current_page, setCurrentPage] = useState('dashboard')

  const addLoadedMovieIds = (ids) => {
    setLoadedMovieIds(prev => [...new Set([...prev, ...ids])])
  }

  const clearLoadedMovieIds = () => {
    setLoadedMovieIds([])
  }

  const value = {
    loaded_movie_ids,
    addLoadedMovieIds,
    clearLoadedMovieIds,
    loading,
    setLoading,
    search_query,
    setSearchQuery,
    current_page,
    setCurrentPage
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
