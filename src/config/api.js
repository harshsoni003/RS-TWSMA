// API Configuration for different environments
const getApiBaseUrl = () => {
  // Check if we're in production (Netlify)
  if (process.env.NODE_ENV === 'production') {
    // Use Netlify Functions
    return '/.netlify/functions/api';
  }
  
  // Development environment
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();

// API endpoints
export const API_ENDPOINTS = {
  SEARCH: `${API_BASE_URL}/search`,
  SEARCH_HISTORY: `${API_BASE_URL}/search-history`,
  SCRAPE: `${API_BASE_URL}/scrape`,
  FORMAT_CONTENT: `${API_BASE_URL}/format-content`,
  GENERATE_THREAD: `${API_BASE_URL}/generate-thread`,
  TEST_SCRAPE: `${API_BASE_URL}/test-scrape`,
  HEALTH: `${API_BASE_URL}/health`
};

export default API_ENDPOINTS;
