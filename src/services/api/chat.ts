import axios from 'axios';

// Use environment variable or default to localhost for development
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const sendMessageToAI = async (message: string) => {
    try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.post(`${API_URL}/api/chat/message`, {
            message,
        }, {
            headers
        });
        return response.data.response;
    } catch (error) {
        console.error("Error sending message to AI:", error);
        throw error;
    }
};
