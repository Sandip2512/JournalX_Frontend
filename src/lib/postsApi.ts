import api from "./api";
import { Post, Comment, Like, CreatePostData, CreateCommentData } from "@/types/lounge";

// Reuse the central api instance from api.ts
// which has correct production/dev fallback URLs and interceptors

// ============= POSTS =============

export const createPost = async (data: CreatePostData): Promise<Post> => {
    const formData = new FormData();
    formData.append("content", data.content || "");

    if (data.image) {
        formData.append("image", data.image);
    }

    console.log("🚀 postsApi: Sending FormData...", {
        content: data.content,
        hasImage: !!data.image,
        formDataEntries: Array.from((formData as any).entries()).map(([k, v]: any) => k)
    });

    const response = await api.post("/api/posts/", formData);

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

export const updatePost = async (postId: string, content: string): Promise<Post> => {
    const response = await api.put(`/api/posts/${postId}`, { content });
    return response.data;
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
    // Use the baseURL from the shared api instance
    const baseURL = api.defaults.baseURL || "";
    return `${baseURL}/api/posts/images/${fileId}`;
};
