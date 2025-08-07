
// API Configuration and Utilities
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-domain.com' 
    : 'http://localhost:3000',
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/api/login',
    USER_INFO: '/api/user-info',
    
    // Movie endpoints
    MOVIES: '/api/movies',
    ADD_MOVIE: '/api/movies',
    UPDATE_MOVIE: '/api/movies',
    DELETE_MOVIE: '/api/movies',
    SEARCH_MOVIES: '/api/search',
    SEARCH_SUGGESTIONS: '/api/search/suggestions',
    POPULAR_MOVIES: '/api/movies/popular',
    MOVIE_BY_ID: '/api/movies',
    
    // Genre endpoints
    GENRES: '/api/genres',
    ADD_GENRE: '/api/genres',
    DELETE_GENRE: '/api/genres',
    MOVIES_BY_GENRE: '/api/movies/genre',
    
    // User endpoints
    USERS: '/api/users',
    
    // Statistics endpoints
    STATISTICS: '/api/statistics',
    TOTAL_MOVIES: '/api/statistics/movies',
    TOTAL_USERS: '/api/statistics/users',
    TOTAL_VIEWS: '/api/statistics/views',
    
    // System endpoints
    INCREMENT_VIEWS: '/api/system/increment-views',
    INCREMENT_DOWNLOADS: '/api/system/increment-downloads'
  }
}

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
}

// API Response helper
export const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
  }
  return await response.json()
}

// Build URL helper
export const buildUrl = (endpoint, params = {}) => {
  const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`)
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key])
    }
  })
  return url.toString()
}
