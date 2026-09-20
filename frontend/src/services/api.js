import axios from 'axios';

// Automatically ensure /api suffix regardless of how VITE_API_URL was entered in Vercel
let rawBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').trim().replace(/\/+$/, '');
if (!rawBaseUrl.endsWith('/api')) {
  rawBaseUrl += '/api';
}

const api = axios.create({
  baseURL: rawBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Automatically inject JWT bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campus_event_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Uniform error handling and session expiration detection
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      const currentPath = window.location.pathname;
      if (
        !currentPath.includes('/login') && 
        !currentPath.includes('/register') && 
        currentPath !== '/' &&
        !currentPath.startsWith('/events')
      ) {
        localStorage.removeItem('campus_event_token');
        localStorage.removeItem('campus_event_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
