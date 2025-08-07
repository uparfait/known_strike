
// Global API Configuration
const BACKEND_URL = 'https://hiddenskeleton.vercel.app/cinapi';

// API Configuration and Utilities
export const API_CONFIG = {
  BASE_URL: BACKEND_URL,
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/login',
    USER_INFO: '/user',
    
    // Movie endpoints
    MOVIES: '/movies',
    ADD_MOVIE: '/movies',
    UPDATE_MOVIE: '/movies',
    DELETE_MOVIE: '/movies',
    SEARCH_MOVIES: '/search',
    SEARCH_SUGGESTIONS: '/suggestions',
    POPULAR_MOVIES: '/popular',
    MOVIE_BY_ID: '/movies',
    
    // Genre endpoints
    GENRES: '/genres',
    ADD_GENRE: '/genres',
    DELETE_GENRE: '/genres',
    MOVIES_BY_GENRE: '/movies/genre',
    
    // User endpoints
    USERS: '/users',
    
    // Statistics endpoints
    STATISTICS: '/movie_counts',
    TOTAL_MOVIES: '/total_movies',
    TOTAL_USERS: '/total_users',
    TOTAL_VIEWS: '/total_views',
    
    // System endpoints
    INCREMENT_VIEWS: '/views',
    INCREMENT_DOWNLOADS: '/downloads'
  }
}

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint || ''}`;
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

// API Request Helper
export const apiRequest = async (method, endpoint, data = null, headers = {}) => {
  const config = {
    method: method.toUpperCase(),
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT' || method.toUpperCase() === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(getApiUrl(endpoint), config);
  return {
    data: await response.json(),
    status: response.status,
    ok: response.ok
  };
};
