
// Global API Configuration
const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://hiddenskeleton.vercel.app/cinapi'
  : 'https://hiddenskeleton.vercel.app/cinapi'; // Using production URL for development too

// API Configuration and Utilities
export const API_CONFIG = {
  BASE_URL: BACKEND_URL,
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/login',
    USER_INFO: '/user-info',
    
    // Movie endpoints
    MOVIES: '/movies',
    ADD_MOVIE: '/movies',
    UPDATE_MOVIE: '/movies',
    DELETE_MOVIE: '/movies',
    SEARCH_MOVIES: '/search',
    SEARCH_SUGGESTIONS: '/search/suggestions',
    POPULAR_MOVIES: '/movies/popular',
    MOVIE_BY_ID: '/movies',
    
    // Genre endpoints
    GENRES: '/genres',
    ADD_GENRE: '/genres',
    DELETE_GENRE: '/genres',
    MOVIES_BY_GENRE: '/movies/genre',
    
    // User endpoints
    USERS: '/users',
    
    // Statistics endpoints
    STATISTICS: '/statistics',
    TOTAL_MOVIES: '/statistics/movies',
    TOTAL_USERS: '/statistics/users',
    TOTAL_VIEWS: '/statistics/views',
    
    // System endpoints
    INCREMENT_VIEWS: '/system/increment-views',
    INCREMENT_DOWNLOADS: '/system/increment-downloads'
  }
}

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
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
