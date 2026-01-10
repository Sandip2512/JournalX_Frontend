import axios from 'axios';

// Environment-based API URL configuration
// In development, this will fallback to localhost if VITE_API_URL is not set
// In production, this should be set via environment variables or fallback to the production URL
const VITE_API_URL = import.meta.env.VITE_API_URL;
const FALLBACK_URL = import.meta.env.DEV ? 'http://localhost:8000' : 'https://journalxbackend-production.up.railway.app';

// Sanitize URL: Remove any ellipses (...) that might have been pasted by mistake
// and ensure we use HTTPS for production railway URLs
let API_URL = VITE_API_URL && !VITE_API_URL.includes('...') ? VITE_API_URL : FALLBACK_URL;

if (API_URL.includes('railway.app')) {
    API_URL = API_URL.replace('http://', 'https://');
}

console.log('🚀 API Configured to:', API_URL);



const api = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor to attach the token and handle content-type
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('API Request - Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Only set Content-Type to application/json if we're not sending FormData
        // This allows Axios/Browser to automatically set the boundary for multipart/form-data
        if (!(config.data instanceof FormData) && !config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }

        console.log('API Request - Headers:', config.headers);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 errors (optional but good practice)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access (e.g., redirect to login, clear token)
            // For now, we'll just reject the promise and let the UI handle it.
            // localStorage.removeItem('token');
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

// Leaderboard API functions
export const leaderboardApi = {
    getLeaderboard: (sortBy: string, limit: number, timePeriod: string) => {
        // Force HTTPS - hardcoded to prevent any HTTP requests
        const endpoint = `/api/leaderboard/?sort_by=${sortBy}&limit=${limit}&time_period=${timePeriod}`;
        console.log('🔗 Leaderboard API URL:', `${API_URL}${endpoint}`);
        return api.get(endpoint);
    },
    getUserRanking: (userId: string, sortBy: string, timePeriod: string) => {
        const endpoint = `/api/leaderboard/user/${userId}?sort_by=${sortBy}&time_period=${timePeriod}`;
        console.log('🔗 User Ranking API URL:', `${API_URL}${endpoint}`);
        return api.get(endpoint);
    }
};

export default api;
