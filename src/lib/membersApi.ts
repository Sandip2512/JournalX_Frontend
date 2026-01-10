import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getAuthToken = () => {
    return localStorage.getItem("token");
};

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface CommunityMember {
    user_id: string;
    name: string;
    role: "user" | "moderator" | "admin";
    last_seen: string | null;
}

export const getCommunityMembers = async (): Promise<CommunityMember[]> => {
    const response = await api.get("/api/users/community/members");
    return response.data;
};
