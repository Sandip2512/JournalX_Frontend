import axios from "axios";
import { Post, Comment, Like, CreatePostData, CreateCommentData } from "@/types/lounge";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Get auth token from localStorage
const getAuthToken = () => {
    const token = localStorage.getItem("token");
    return token;
};

// Create axios instance with auth header
const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ============= POSTS =============

export const createPost = async (data: CreatePostData): Promise<Post> => {
    const formData = new FormData();
    formData.append("content", data.content);

    if (data.image) {
        formData.append("image", data.image);
    }

    const response = await api.post("/api/posts/", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};

export const getPosts = async (skip: number = 0, limit: number = 20): Promise<Post[]> => {
    const response = await api.get("/api/posts/", {
        params: { skip, limit },
    });

    return response.data;
};

export const getPost = async (postId: string): Promise<Post> => {
    const response = await api.get(`/api/posts/${postId}`);
    return response.data;
};

export const deletePost = async (postId: string): Promise<void> => {
    await api.delete(`/api/posts/${postId}`);
};

// ============= LIKES =============

export const likePost = async (postId: string): Promise<Like> => {
    const response = await api.post(`/api/posts/${postId}/like`);
    return response.data;
};

export const unlikePost = async (postId: string): Promise<void> => {
    await api.delete(`/api/posts/${postId}/like`);
};

export const getPostLikes = async (postId: string): Promise<Like[]> => {
    const response = await api.get(`/api/posts/${postId}/likes`);
    return response.data;
};

export const reactToPost = async (postId: string, emoji: string): Promise<any> => {
    const response = await api.post(`/api/posts/${postId}/react`, { emoji });
    return response.data;
};

// ============= COMMENTS =============

export const addComment = async (
    postId: string,
    data: CreateCommentData
): Promise<Comment> => {
    const response = await api.post(`/api/posts/${postId}/comments`, data);
    return response.data;
};

export const getComments = async (postId: string): Promise<Comment[]> => {
    const response = await api.get(`/api/posts/${postId}/comments`);
    return response.data;
};

export const deleteComment = async (
    postId: string,
    commentId: string
): Promise<void> => {
    await api.delete(`/api/posts/${postId}/comments/${commentId}`);
};

export const likeComment = async (postId: string, commentId: string): Promise<void> => {
    await api.post(`/api/posts/${postId}/comments/${commentId}/like`);
};

export const unlikeComment = async (postId: string, commentId: string): Promise<void> => {
    await api.delete(`/api/posts/${postId}/comments/${commentId}/like`);
};

// ============= IMAGES =============

export const getImageUrl = (fileId: string): string => {
    return `${API_BASE_URL}/api/posts/images/${fileId}`;
};
