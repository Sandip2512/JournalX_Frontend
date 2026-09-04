import React, { useState, useEffect } from "react";
import UserLayout from "@/components/layout/UserLayout";
import { cn } from "@/lib/utils";
import { Users2, ArrowLeft, Search, Plus, UserCheck, UserX, Clock, MessageSquare, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import api from "@/lib/api";

// Types
interface Friend {
    friendship_id: string;
    user_id: string;
    name: string;
    username: string;
    connected_at: string;
    status: string;
    is_online?: boolean;
}

interface FriendRequest {
    request_id: string;
    requester_id: string;
    requester_name: string;
    requester_username: string;
    status: string;
    created_at: string;
}

interface UserSearchResult {
    user_id: string;
    username: string;
    first_name: string;
    last_name: string;
    is_friend: boolean;
    has_pending_request: boolean;
    is_self: boolean;
}

const Friends = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("friends");
    const [friends, setFriends] = useState<Friend[]>([]);
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch Lists
    const fetchFriends = async () => {
        try {
            const res = await api.get("/api/friends");
            setFriends(res.data);
        } catch (err) {
            console.error("Failed to fetch friends", err);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await api.get("/api/friends/requests");
            setRequests(res.data);
        } catch (err) {
            console.error("Failed to fetch requests", err);
        }
    };

    useEffect(() => {
        fetchFriends();
        fetchRequests();
    }, []);

    // Actions
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim() || searchQuery.length < 2) return;

        setLoading(true);
        try {
            const res = await api.get(`/api/friends/search?query=${searchQuery}`);
            setSearchResults(res.data);
            setActiveTab("search");
        } catch (err) {
            toast.error("Search failed");
        } finally {
            setLoading(false);
        }
    };

    const sendRequest = async (userId: string) => {
        try {
            await api.post("/api/friends/request", { recipient_id: userId });
            toast.success("Friend request sent");
            // Update UI state in search results
            setSearchResults(prev => prev.map(u =>
                u.user_id === userId ? { ...u, has_pending_request: true } : u
            ));
        } catch (err: any) {
            toast.error(err.response?.data?.detail || "Failed to send request");
        }
    };

    const acceptRequest = async (requestId: string) => {
        try {
            await api.post(`/api/friends/accept/${requestId}`);
            toast.success("Request accepted");
            fetchRequests(); // Refresh requests
            fetchFriends();  // Refresh friends list
        } catch (err) {
            toast.error("Failed to accept");
        }
    };

    const rejectRequest = async (requestId: string) => {
        try {
            await api.post(`/api/friends/reject/${requestId}`);
            toast.info("Request removed");
            fetchRequests();
        } catch (err) {
            toast.error("Failed to reject");
        }
    };

    return (
        <UserLayout>
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in min-h-screen">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate("/community")}
                                className="rounded-xl hover:bg-white/5"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <h1 className="text-4xl font-black text-foreground dark:text-white tracking-tighter flex items-center gap-3">
                                <Users2 className="w-8 h-8 text-purple-500" />
                                Social <span className="text-purple-500 italic">Circle</span>
                            </h1>
                        </div>
                        <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em] ml-14">
                            {friends.length} Friends • {requests.length} Pending
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="flex items-center gap-3">
                        <div className="relative w-64 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Find traders by name..."
                                className="bg-white/5 border-white/5 pl-10 rounded-xl focus:ring-purple-500"
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-6 font-bold">
                            {loading ? "Searching..." : "Search"}
                        </Button>
                    </form>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-white/5 border border-white/5 rounded-xl p-1">
                        <TabsTrigger value="friends" className="rounded-lg data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-500 font-bold">
                            My Friends ({friends.length})
                        </TabsTrigger>
                        <TabsTrigger value="requests" className="rounded-lg data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-500 font-bold relative">
                            Requests
                            {requests.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center text-white border border-[#0a0a0c]">
                                    {requests.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="search" className="rounded-lg data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-500 font-bold">
                            Search Results
                        </TabsTrigger>
                    </TabsList>

                    {/* Friends List */}
                    <TabsContent value="friends" className="animate-fade-up">
                        {friends.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                                <Users2 className="w-16 h-16 text-muted-foreground mb-4" />
                                <h3 className="text-xl font-bold">No friends yet</h3>
                                <p className="text-sm">Search for traders to build your circle.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {friends.map((friend) => (
                                    <div key={friend.friendship_id} className="bg-background/40 dark:bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-purple-500/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <Avatar className="w-12 h-12 border-2 border-white/10">
                                                    <AvatarFallback className="bg-purple-600 text-white font-bold text-lg">
                                                        {friend.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {friend.is_online && (
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0a0a0c] rounded-full animate-pulse" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{friend.name}</div>
                                                <div className={cn("text-xs", friend.is_online ? "text-emerald-500 font-bold" : "text-muted-foreground")}>
                                                    {friend.is_online ? "Active Now" : `@${friend.username || "trader"}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="hover:bg-blue-500/10 hover:text-blue-500 rounded-xl" title="Message">
                                                <MessageSquare className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Requests List */}
                    <TabsContent value="requests" className="animate-fade-up">
                        {requests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                                <Clock className="w-16 h-16 text-muted-foreground mb-4" />
                                <h3 className="text-xl font-bold">No pending requests</h3>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {requests.map((req) => (
                                    <div key={req.request_id} className="bg-background/40 dark:bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="w-12 h-12 border-2 border-amber-500/20">
                                                <AvatarFallback className="bg-amber-600 text-white font-bold">
                                                    {req.requester_name?.charAt(0) || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-bold text-white">{req.requester_name || "Unknown"}</div>
                                                <div className="text-xs text-amber-500 font-medium">Sent a request</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="icon" onClick={() => acceptRequest(req.request_id)} className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl h-10 w-10">
                                                <Check className="w-5 h-5" />
                                            </Button>
                                            <Button size="icon" onClick={() => rejectRequest(req.request_id)} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl h-10 w-10">
                                                <X className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Search Results */}
                    <TabsContent value="search" className="animate-fade-up">
                        {searchResults.length === 0 ? (
                            <div className="text-center text-muted-foreground py-10 italic">
                                Use the search bar to find traders...
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {searchResults.map((user) => (
                                    <div key={user.user_id} className="bg-background/40 dark:bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="w-10 h-10 border border-white/10">
                                                <AvatarFallback className="bg-white/10 text-xs font-bold">
                                                    {user.first_name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-bold text-white text-sm">{user.first_name} {user.last_name}</div>
                                                <div className="text-[10px] text-muted-foreground">@{user.username || "trader"}</div>
                                            </div>
                                        </div>
                                        <div>
                                            {user.is_self ? (
                                                <span className="text-xs text-muted-foreground italic">You</span>
                                            ) : user.is_friend ? (
                                                <div className="flex items-center gap-1 text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">
                                                    <UserCheck className="w-3 h-3" /> Friend
                                                </div>
                                            ) : user.has_pending_request ? (
                                                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold bg-amber-500/10 px-2 py-1 rounded-lg">
                                                    <Clock className="w-3 h-3" /> Pending
                                                </div>
                                            ) : (
                                                <Button size="sm" onClick={() => sendRequest(user.user_id)} className="bg-white/5 hover:bg-primary hover:text-white text-white/70 h-8 rounded-lg text-xs font-bold">
                                                    <Plus className="w-3 h-3 mr-1" /> Add
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                </Tabs>
            </div>
        </UserLayout>
    );
};

export default Friends;
