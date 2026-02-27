import React, { useState, useEffect } from "react";
import { Users, Lock, Shield, Plus, ArrowRight, UserPlus, CheckCircle2, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import api from "@/lib/api";

interface RoomLobbyProps {
    onJoinRoom: (meetingId?: string) => void;
}

interface Friend {
    friendship_id: string;
    user_id: string;
    name: string;
    status: string;
    is_online: boolean;
}

import { toast } from "sonner";

export const RoomLobby = ({ onJoinRoom }: RoomLobbyProps) => {
    const [invited, setInvited] = useState<string[]>([]);
    const [onlineFriends, setOnlineFriends] = useState<Friend[]>([]);
    const [currentMeetingId, setCurrentMeetingId] = useState<string | null>(null);

    // Search State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    React.useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await api.get("/api/friends");
                const friends = res.data.map((f: any) => ({
                    friendship_id: f.friendship_id,
                    user_id: f.user_id,
                    name: f.name,
                    is_online: f.is_online,
                    status: f.is_online ? "Online" : "Away"
                }));
                const sorted = friends.sort((a: any, b: any) => Number(b.is_online) - Number(a.is_online));
                setOnlineFriends(sorted);
            } catch (error) {
                console.error("Failed to fetch friends", error);
            }
        };
        fetchFriends();
        const interval = setInterval(fetchFriends, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleInvite = async (id: string) => {
        try {
            const res = await api.post("/api/friends/invite-room", { recipient_id: id });
            setInvited(prev => [...prev, id]);
            setCurrentMeetingId(res.data.meeting_id);
            toast.success("Invitation sent");
        } catch (err) {
            toast.error("Failed to send invitation");
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await api.get(`/api/friends/search?query=${query}`);
            setSearchResults(res.data);
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchInvite = async (user: any) => {
        try {
            // 1. If not a friend, send friend request first
            if (!user.is_friend && !user.has_pending_request) {
                await api.post("/api/friends/request", { recipient_id: user.user_id });
                toast.info(`Friend request sent to ${user.first_name}`);
            }

            // 2. Send room invitation
            const res = await api.post("/api/friends/invite-room", { recipient_id: user.user_id });
            setInvited(prev => [...prev, user.user_id]);
            setCurrentMeetingId(res.data.meeting_id);
            setIsSearchOpen(false);
            toast.success(`Invited ${user.first_name} to room`);
        } catch (err) {
            toast.error("Failed to invite member");
        }
    };

    React.useEffect(() => {
        if (!currentMeetingId) return;

        const checkStatus = async () => {
            try {
                const res = await api.get(`/api/friends/meeting/${currentMeetingId}`);
                if (res.data.status === "accepted") {
                    toast.success("Friend accepted! Starting room...");
                    onJoinRoom(currentMeetingId);
                    setCurrentMeetingId(null);
                }
            } catch (e) { }
        };

        const interval = setInterval(checkStatus, 3000);
        return () => clearInterval(interval);
    }, [currentMeetingId, onJoinRoom]);

    return (
        <div className="h-full w-full flex items-center justify-center p-4">
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                {/* Left: Create Room */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card-premium p-8 rounded-[2rem] border border-white/5 space-y-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[60px]" />

                    <div className="space-y-4 relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                            <Lock className="w-3 h-3" />
                            Private & Encrypted
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">
                            Trade Room <br />
                            <span className="text-emerald-500">Lobby</span>
                        </h1>
                        <p className="text-muted-foreground leading-relaxed">
                            Start a secure, private session. Invite friends to share screens,
                            analyze charts, and execute synchronized trades.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={() => onJoinRoom()}
                            className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)] group"
                        >
                            Start Private Room
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-2">
                            <Shield className="w-3 h-3" />
                            End-to-end encrypted voice & data
                        </p>
                    </div>
                </motion.div>

                {/* Right: Friends Online */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-bold text-lg text-white">Friends Online</h3>
                        <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                            {onlineFriends.filter(f => f.is_online).length} Active
                        </span>
                    </div>

                    {currentMeetingId && (
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                                <span className="text-xs font-bold text-amber-500">Wait for acceptance...</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentMeetingId(null)}
                                className="h-7 text-[10px] text-amber-500 hover:bg-amber-500/20"
                            >
                                Cancel
                            </Button>
                        </div>
                    )}

                    <div className="space-y-3">
                        {onlineFriends.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm border border-white/5 rounded-2xl bg-white/5">
                                No friends online.
                            </div>
                        ) : (
                            onlineFriends.map((friend) => {
                                const isInvited = invited.includes(friend.user_id);
                                return (
                                    <motion.div
                                        key={friend.user_id}
                                        layout
                                        className="p-4 rounded-2xl bg-muted/30 border border-white/5 flex items-center justify-between group hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-blue-600")}>
                                                    {friend.name.charAt(0)}
                                                </div>
                                                {friend.is_online && (
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0a0a0c] rounded-full animate-pulse" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{friend.name}</div>
                                                <div className={cn("text-[10px] font-medium uppercase tracking-wider", friend.is_online ? "text-emerald-500" : "text-muted-foreground")}>
                                                    {friend.status}
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            variant={isInvited ? "outline" : "secondary"}
                                            disabled={isInvited}
                                            onClick={() => handleInvite(friend.user_id)}
                                            className={cn(
                                                "rounded-lg text-xs font-bold transition-all",
                                                isInvited
                                                    ? "border-emerald-500/50 text-emerald-500 bg-emerald-500/10"
                                                    : "bg-white/5 hover:bg-white/10"
                                            )}
                                        >
                                            {isInvited ? (
                                                <>
                                                    <CheckCircle2 className="w-3 h-3 mr-1.5" />
                                                    Sent
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus className="w-3 h-3 mr-1.5" />
                                                    Invite
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
                                );
                            })
                        )}

                        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                            <DialogTrigger asChild>
                                <div className="p-4 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-white hover:border-white/20 transition-colors cursor-pointer group">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-medium">Add more friends</span>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="bg-[#0a0a0c] border-white/5 text-white max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-black italic">Find Community Members</DialogTitle>
                                    <DialogDescription className="text-white/50">
                                        Search by name or username to invite them to your room.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <Input
                                            autoFocus
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            placeholder="Search traders..."
                                            className="bg-white/5 border-white/10 pl-10 rounded-xl"
                                        />
                                        {isSearching && (
                                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
                                        )}
                                    </div>

                                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {searchResults.length === 0 ? (
                                            <p className="text-center py-8 text-white/30 text-xs italic">
                                                {searchQuery.length < 2 ? "Start typing to find members..." : "No members found."}
                                            </p>
                                        ) : (
                                            searchResults.map((user) => (
                                                <div key={user.user_id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-10 h-10 border border-white/10">
                                                            <AvatarFallback className="bg-primary/20 text-primary font-bold">
                                                                {user.first_name.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="text-sm font-bold">{user.first_name} {user.last_name}</div>
                                                            <div className="text-[10px] text-white/40">@{user.username || "trader"}</div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleSearchInvite(user)}
                                                        className="h-8 bg-primary hover:bg-primary/90 text-[10px] font-black uppercase tracking-wider rounded-lg"
                                                    >
                                                        Invite
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
