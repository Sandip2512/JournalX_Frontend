import axios from 'axios';
import { Platform } from 'react-native';

// IMPORTANT: Choose the right URL based on your Expo connection mode
// 
// Option 1: LAN Mode (recommended, faster)
// - Start with: npx expo start --lan
// - Use your computer's local IP address
const LAN_URL = 'http://10.52.195.249:8000';

// Option 2: Tunnel Mode (slower, but works from anywhere)
// - Start with: npx expo start --tunnel
// - Use localhost - Expo tunnel will forward requests
const TUNNEL_URL = 'http://localhost:8000';

// Auto-detect: Try LAN first, fallback to tunnel
// For now, we'll use LAN_URL. If you're using tunnel mode, change to TUNNEL_URL
const BASE_URL = Platform.select({
    android: LAN_URL,
    ios: LAN_URL,
    default: LAN_URL,
});

console.log('🌐 API Base URL:', BASE_URL);

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000, // Increased timeout for tunnel mode
});

// Add interceptor to parse JSON responses if needed, or handle tokens (future)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const errorData = error.response?.data;
        const errorMessage = errorData?.detail || error.message;
        console.error('API Error:', errorMessage);
        return Promise.reject(error);
    }
);

export const authService = {
    login: async (username: string, password: string) => {
        const response = await api.post('/api/auth/login', {
            email: username,
            password: password
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    },

    // Helper to test connection
    ping: async () => {
        try {
            await api.get('/'); // Assuming root endpoint exists or use a known public one
            return true;
        } catch (e) {
            return false;
        }
    }
};

export default api;
