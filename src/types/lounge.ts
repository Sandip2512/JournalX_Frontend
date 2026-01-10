export interface Post {
    post_id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    content: string;
    image_file_id?: string;
    image_url?: string;
    like_count: number;
    reactions?: Record<string, number>;
    user_reaction?: string | null;
    comment_count: number;
    user_has_liked?: boolean;
    created_at: string;
    updated_at?: string;
    // New visual fields that could be added in future, currently mocked or derived
    is_online?: boolean;
}
// ... rest of the file (unchanged interfaces for now)
export interface Comment {
    comment_id: string;
    post_id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    content: string;
    parent_id?: string;
    like_count: number;
    user_has_liked?: boolean;
    created_at: string;
    updated_at?: string;
}

export interface Like {
    like_id: string;
    post_id: string;
    user_id: string;
    user_name: string;
    created_at: string;
}

export interface CreatePostData {
    content: string;
    image?: File;
}

export interface CreateCommentData {
    content: string;
    parent_id?: string;
}
