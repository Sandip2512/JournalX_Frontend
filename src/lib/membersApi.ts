import api from "./api";

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
