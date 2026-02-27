import React, { useState, useEffect, useRef } from "react";
import { Users, Lock, Shield, Plus, ArrowRight, UserPlus, CheckCircle2, Search, Loader2, Video, Link, Calendar, ChevronDown, Copy } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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

import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";

interface RoomLobbyProps {
    onJoinRoom: (meetingId?: string) => void;
    meetingId?: string;
    onUpdateMeetingId?: (id: string) => void;
}

interface Friend {
    friendship_id: string;
    user_id: string;
    name: string;
    status: string;
    is_online: boolean;
}

export const RoomLobby = ({ onJoinRoom, meetingId, onUpdateMeetingId }: RoomLobbyProps) => {
    const { user: currentUser } = useAuth();
    const [invited, setInvited] = useState<string[]>([]);
    const [onlineFriends, setOnlineFriends] = useState<Friend[]>([]);
    const [currentMeetingId, setCurrentMeetingId] = useState<string | null>(meetingId || null);
    const meetingIdAnchor = useRef<string | null>(meetingId || null);

    // Search State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(meetingId || "");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const fetchAllTraders = async () => {
            try {
                // Fetch both friends and community members for maximum discovery
                const [friendsRes, membersRes] = await Promise.all([
                    api.get("/api/friends"),
                    api.get("/api/users/community/members")
                ]);

                const friendsData = Array.isArray(friendsRes.data) ? friendsRes.data : [];
                const membersData = Array.isArray(membersRes.data) ? membersRes.data : [];

                // Create a map of friends for quick lookup
                const friendIds = new Set(friendsData.map((f: any) => f.user_id));

                const mergedList: Friend[] = [];
                const seenIds = new Set();

                // 1. Add Friends first
                friendsData.forEach((f: any) => {
                    if (f.user_id === currentUser?.user_id) return;
                    seenIds.add(f.user_id);
                    mergedList.push({
                        friendship_id: f.friendship_id,
                        user_id: f.user_id,
                        name: f.name || "Anonymous Trader",
                        is_online: !!f.is_online,
                        status: f.is_online ? "Online" : "Away"
                    });
                });

                // 2. Add online community members who aren't in the friends list yet
                membersData.forEach((m: any) => {
                    if (m.user_id === currentUser?.user_id) return;
                    if (seenIds.has(m.user_id)) return;

                    // Calculate online status for community members (last seen < 5 mins)
                    let isOnline = false;
                    if (m.last_seen) {
                        const lastSeenDate = new Date(m.last_seen);
                        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
                        isOnline = lastSeenDate > fiveMinsAgo;
                    }

                    // Only show them in the lobby if they are online (to avoid clutter)
                    if (isOnline) {
                        seenIds.add(m.user_id);
                        mergedList.push({
                            friendship_id: "", // Not a friend yet
                            user_id: m.user_id,
                            name: m.name || "Anonymous Trader",
                            is_online: true,
                            status: "Community"
                        });
                    }
                });

                const sorted = mergedList.sort((a, b) => Number(b.is_online) - Number(a.is_online));
                setOnlineFriends(sorted);
            } catch (error) {
                console.error("Failed to fetch traders", error);
            }
        };

        fetchAllTraders();
        const interval = setInterval(fetchAllTraders, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, [currentUser?.user_id]);

    const handleInvite = async (id: string) => {
        try {
            // Synchronously resolve/generate ID before any network calls to prevent fragmentation
            if (!meetingIdAnchor.current) {
                // For instant meetings from friends list, use the old anchor logic
                const newId = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
                meetingIdAnchor.current = newId;
                setCurrentMeetingId(newId);
                if (onUpdateMeetingId) onUpdateMeetingId(newId);
                console.log(`[Mesh] Synchronous anchor set: ${newId}`);
            }

            const activeMeetingId = meetingIdAnchor.current;

            await api.post("/api/friends/invite-room", {
                recipient_id: id,
                meeting_id: activeMeetingId
            });

            setInvited(prev => [...prev, id]);
            toast.success("Invitation sent");
        } catch (err) {
            toast.error("Failed to send invitation");
        }
    };

    const handleStartInstantMeeting = async () => {
        try {
            const res = await api.post("/api/friends/meeting/create");
            const newId = res.data.meeting_id;
            meetingIdAnchor.current = newId;
            setCurrentMeetingId(newId);
            onJoinRoom(newId);
        } catch (err) {
            toast.error("Failed to create meeting");
        }
    };

    const [laterMeetingId, setLaterMeetingId] = useState<string | null>(null);
    const handleCreateMeetingForLater = async () => {
        try {
            const res = await api.post("/api/friends/meeting/create");
            const newId = res.data.meeting_id;
            setLaterMeetingId(newId);
        } catch (err) {
            toast.error("Failed to generate meeting link");
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Link copied to clipboard!");
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

            // Synchronously resolve/generate ID before sending invitation
            if (!meetingIdAnchor.current) {
                const newId = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
                meetingIdAnchor.current = newId;
                setCurrentMeetingId(newId);
                if (onUpdateMeetingId) onUpdateMeetingId(newId);
                console.log(`[Mesh] Synchronous anchor set via search: ${newId}`);
            }

            const activeMeetingId = meetingIdAnchor.current;

            // 2. Send room invitation
            await api.post("/api/friends/invite-room", {
                recipient_id: user.user_id,
                meeting_id: activeMeetingId
            });

            setInvited(prev => [...prev, user.user_id]);
            setIsSearchOpen(false);
            toast.success(`Invited ${user.first_name} to room`);
        } catch (err) {
            toast.error("Failed to invite member");
        }
    };

    useEffect(() => {
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

                    <div className="flex gap-3 relative z-10">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)] group"
                                >
                                    <Video className="w-5 h-5 mr-3" />
                                    New Meeting
                                    <ChevronDown className="w-4 h-4 ml-auto" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 bg-[#0a0a0c] border-white/10 text-white p-2 rounded-2xl shadow-2xl">
                                <DropdownMenuItem
                                    onClick={handleCreateMeetingForLater}
                                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/5"
                                >
                                    <Link className="w-5 h-5 text-emerald-500" />
                                    <div>
                                        <p className="font-bold text-sm">Create a meeting for later</p>
                                        <p className="text-[10px] text-muted-foreground">Get a link you can share</p>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleStartInstantMeeting}
                                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/5"
                                >
                                    <Plus className="w-5 h-5 text-emerald-500" />
                                    <div>
                                        <p className="font-bold text-sm">Start an instant meeting</p>
                                        <p className="text-[10px] text-muted-foreground">Join right now</p>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/5 opacity-50"
                                >
                                    <Calendar className="w-5 h-5 text-emerald-500" />
                                    <div>
                                        <p className="font-bold text-sm">Schedule for later</p>
                                        <p className="text-[10px] text-muted-foreground">Coming soon</p>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="flex-[0.8] relative group">
                            <Input
                                placeholder="Enter meeting ID"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-14 bg-white/5 border-white/10 rounded-xl pl-12 font-medium focus:border-emerald-500/50 transition-all text-white"
                            />
                            <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-emerald-500 transition-colors" />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => searchQuery.length > 5 && onJoinRoom(searchQuery)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-500 hover:bg-emerald-500/10 font-bold"
                            >
                                Join
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-white/5">
                        <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-2">
                            <Shield className="w-3 h-3 text-emerald-500" />
                            End-to-end encrypted sessions
                        </p>
                    </div>

                    {/* Later Meeting Link Dialog */}
                    <AnimatePresence>
                        {laterMeetingId && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-white">Here's your meeting link</p>
                                    <Button variant="ghost" size="icon" onClick={() => setLaterMeetingId(null)} className="h-6 w-6 text-white/50 hover:text-white">
                                        <Plus className="w-4 h-4 rotate-45" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Copy this link and send it to people you want to meet with.</p>
                                <div className="flex items-center gap-2 bg-[#0a0a0c] p-3 rounded-xl border border-white/5">
                                    <p className="flex-1 text-[10px] font-mono text-emerald-500 truncate">{window.location.origin}/trader-room?meetingId={laterMeetingId}</p>
                                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(`${window.location.origin}/trader-room?meetingId=${laterMeetingId}`)} className="h-8 w-8 text-white/30 hover:text-emerald-500">
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
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
