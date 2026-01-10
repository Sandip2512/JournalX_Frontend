import React, { useEffect, useState } from "react";
import { Circle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCommunityMembers, CommunityMember } from "@/lib/membersApi";

interface UsersListProps {
    className?: string;
}

export const UsersList: React.FC<UsersListProps> = ({ className }) => {
    const [members, setMembers] = useState<CommunityMember[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMembers = async () => {
        try {
            const data = await getCommunityMembers();
            setMembers(data);
        } catch (error) {
            console.error("Failed to fetch community members:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
        // Refresh status every 30 seconds
        const interval = setInterval(fetchMembers, 30000);
        return () => clearInterval(interval);
    }, []);

    const isOnline = (lastSeen: string | null) => {
        if (!lastSeen) return false;
        const lastSeenDate = new Date(lastSeen);
        const now = new Date();
        const diffInMinutes = (now.getTime() - lastSeenDate.getTime()) / 1000 / 60;
        return diffInMinutes < 5; // Online if active in last 5 minutes
    };

    const onlineUsers = members.filter(m => isOnline(m.last_seen));
    const offlineUsers = members.filter(m => !isOnline(m.last_seen));

    const getRoleInfo = (user: CommunityMember) => {
        if (user.name === "Sandip Salunkhe" && user.role === "admin") {
            return { label: "Owner", color: "text-amber-500" };
        }
        if (user.role === "admin") return { label: "Admin", color: "text-amber-500" };
        if (user.role === "moderator") return { label: "Moderator", color: "text-green-500" };
        return { label: "Member", color: "text-foreground" };
    };

    return (
        <div className={cn("w-60 bg-muted/30 border-l border-border/40 flex flex-col h-full", className)}>
            <div className="p-4 border-b border-border/40 h-14 flex items-center justify-between">
                <h2 className="font-bold text-sm tracking-tight text-muted-foreground">Members</h2>
                <div className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {members.length}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                {/* Online */}
                <div>
                    <div className="px-1 text-[10px] uppercase font-bold text-muted-foreground/70 mb-2 tracking-wider">
                        Online — {onlineUsers.length}
                    </div>
                    <div className="space-y-1">
                        {onlineUsers.map((user) => {
                            const { label, color } = getRoleInfo(user);
                            return (
                                <div key={user.user_id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors group">
                                    <div className="relative">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-background rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={cn("text-sm font-medium", color)}>
                                            {user.name}
                                        </span>
                                        {label !== "Member" && (
                                            <span className="text-[10px] text-muted-foreground leading-none">
                                                {label}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {onlineUsers.length === 0 && !loading && (
                            <div className="px-2 py-1 text-[11px] text-muted-foreground italic">No one online</div>
                        )}
                    </div>
                </div>

                {/* Offline */}
                <div>
                    <div className="px-1 text-[10px] uppercase font-bold text-muted-foreground/70 mb-2 tracking-wider">
                        Offline — {offlineUsers.length}
                    </div>
                    <div className="space-y-1">
                        {offlineUsers.map((user) => {
                            const { label } = getRoleInfo(user);
                            return (
                                <div key={user.user_id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors opacity-60 group">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {user.name}
                                        </span>
                                        {label !== "Member" && (
                                            <span className="text-[10px] text-muted-foreground/60 leading-none">
                                                {label}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
