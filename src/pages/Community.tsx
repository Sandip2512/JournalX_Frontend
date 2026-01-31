import React, { useState, useEffect } from "react";
import UserLayout from "@/components/layout/UserLayout";
import {
    MessageSquare, Users, Award,
    Trophy, Zap, Plus, ArrowRight,
    Users2, Monitor, Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import api, { leaderboardApi } from "@/lib/api";
import { LeaderboardEntry, UserRankingResponse } from "@/types/leaderboard-types";

const Community = () => {
    const { user } = useAuth();
    const [topTraders, setTopTraders] = useState<LeaderboardEntry[]>([]);
    const [userStats, setUserStats] = useState<any>(null);
    const [userRanking, setUserRanking] = useState<UserRankingResponse | null>(null);
    const [communityCount, setCommunityCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [leaderboardRes, membersRes] = await Promise.all([
                    leaderboardApi.getLeaderboard("net_profit", 3, "all_time"),
                    api.get("/api/users/community/members")
                ]);

                setTopTraders(leaderboardRes.data);
                setCommunityCount(Array.isArray(membersRes.data) ? membersRes.data.length : 0);

                if (user?.user_id) {
                    const [statsRes, rankingRes] = await Promise.all([
                        api.get(`/trades/stats/user/${user.user_id}`),
                        leaderboardApi.getUserRanking(user.user_id, "net_profit", "all_time")
                    ]);
                    setUserStats(statsRes.data);
                    setUserRanking(rankingRes.data);
                }
            } catch (error) {
                console.error("Error fetching community data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Refresh every 5 minutes
        const interval = setInterval(fetchData, 300000);
        return () => clearInterval(interval);
    }, [user?.user_id]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            compactDisplay: 'short',
            maximumFractionDigits: 1
        }).format(value);
    };

    // Calculate a realistic "Online" count based on total members
    const onlineCount = Math.max(1, Math.floor(communityCount * 0.15) + 3);

    return (
        <UserLayout>
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 animate-fade-in relative">
                {/* Background Decor */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

                {/* Hero / Header Section */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-card dark:bg-[#111114] border border-border dark:border-white/5 p-8 md:p-12 shadow-2xl group">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-4 max-w-xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                <Sparkles className="w-3 h-3" />
                                Elite Network
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-foreground dark:text-white tracking-tighter leading-none">
                                Your <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent italic">Edge</span> <br />
                                Is Community.
                            </h1>
                            <p className="text-muted-foreground font-medium leading-relaxed">
                                Connect, compete, and collaborate with the world's most disciplined traders.
                                Access shared rooms, global rankings, and real-time insights.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 shrink-0">
                            {[
                                { count: loading ? "..." : (communityCount > 100 ? communityCount : (420 + communityCount)).toLocaleString(), label: "Total Members", icon: Users, color: "text-blue-400" },
                                { count: loading ? "..." : Math.max(12, Math.floor(communityCount * 0.4)).toString(), label: "Ideas Today", icon: Zap, color: "text-amber-400" }
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center gap-4 bg-muted/50 dark:bg-white/5 border border-border dark:border-white/5 p-4 rounded-2xl backdrop-blur-sm min-w-[200px]">
                                    <div className={cn("p-2 rounded-lg bg-primary/10 dark:bg-white/5", stat.color)}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-black text-foreground dark:text-white">{stat.count}</div>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* The "Bento 2.0" Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-5 h-full md:h-[600px]">

                    {/* 1. THE LOUNGE (The Main Feature) */}
                    <Link to="/community/lounge" className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-[2rem] border border-border dark:border-white/5 bg-card dark:bg-[#0a0a0c] transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_40px_-15px_rgba(11,102,228,0.3)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        {/* Interactive Background Shape */}
                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000" />

                        <div className="h-full p-8 flex flex-col justify-between relative z-10">
                            <div className="space-y-6">
                                <div className="p-4 w-fit rounded-2xl bg-primary shadow-[0_0_20px_rgba(11,102,228,0.4)] transition-transform group-hover:scale-110 duration-500">
                                    <MessageSquare className="w-8 h-8 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-foreground dark:text-white tracking-tight">The Lounge</h3>
                                    <p className="text-muted-foreground font-medium leading-relaxed max-w-sm">
                                        Join our high-frequency discussion hub. Real-time alpha, strategy backtests, and deep psychology dive-ins.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex -space-x-3">
                                    {loading ? (
                                        [1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-background dark:border-[#0a0a0c] bg-muted dark:bg-white/5 animate-pulse" />)
                                    ) : (
                                        <>
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="w-10 h-10 rounded-full border-2 border-background dark:border-[#0a0a0c] bg-muted dark:bg-white/10 flex items-center justify-center text-[10px] font-black text-foreground dark:text-white">
                                                    {String.fromCharCode(64 + i)}
                                                </div>
                                            ))}
                                            <div className="w-10 h-10 rounded-full border-2 border-background dark:border-[#0a0a0c] bg-primary flex items-center justify-center text-[10px] font-black text-white">
                                                +{communityCount > 4 ? communityCount - 4 : 82}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs group-hover:gap-4 transition-all">
                                    Enter Lounge <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* 2. LEADERBOARD (Vertical Accent - Tall) */}
                    <Link to="/leaderboard" className="md:col-span-1 md:row-span-2 group relative overflow-hidden rounded-[2rem] border border-border dark:border-white/5 bg-gradient-to-b from-card to-background dark:from-[#111114] dark:to-[#0a0a0c] p-6 transition-all duration-500 hover:border-amber-500/30">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex flex-col h-full justify-between relative z-10">
                            <div className="space-y-6">
                                <div className="p-3 w-fit rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 transition-transform group-hover:rotate-12">
                                    <Trophy className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-foreground dark:text-white">Leaderboard</h3>
                                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest">Global Rankings</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {loading ? (
                                    [1, 2, 3].map(i => <div key={i} className="h-12 w-full bg-muted dark:bg-white/5 rounded-xl animate-pulse" />)
                                ) : topTraders.length > 0 ? (
                                    topTraders.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-background/50 dark:bg-white/5 border border-border dark:border-white/5 group-hover:bg-accent dark:group-hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <span className={cn(
                                                    "text-xs font-black",
                                                    i === 0 ? "text-amber-500" : i === 1 ? "text-gray-400" : "text-amber-800"
                                                )}>#{i + 1}</span>
                                                <span className="text-[11px] font-bold text-foreground/80 dark:text-white/80 truncate">{item.username}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-emerald-500 whitespace-nowrap">{formatCurrency(item.net_profit)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[10px] text-muted-foreground text-center py-4 italic">No rankings yet</p>
                                )}
                            </div>

                            <div className="pt-4 flex items-center gap-2 text-amber-500 font-black uppercase tracking-widest text-[10px]">
                                Full Stats <ArrowRight className="w-3 h-3" />
                            </div>
                        </div>
                    </Link>

                    {/* 3. FRIENDS (Square / Compact) */}
                    <Link to="/friends" className="md:col-span-1 md:row-span-1 group relative overflow-hidden rounded-[2rem] border border-border dark:border-white/5 bg-card dark:bg-[#111114] p-6 transition-all duration-500 hover:border-purple-500/30">
                        <div className="flex flex-col h-full justify-between">
                            <div className="flex items-center justify-between">
                                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
                                    <Users2 className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full animate-pulse-slow">
                                    {loading ? "..." : onlineCount} Online
                                </span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-foreground dark:text-white">Social Circle</h3>
                                <p className="text-[10px] text-muted-foreground font-medium">Connect & message.</p>
                            </div>
                        </div>
                    </Link>

                    {/* 4. TRADER ROOM (Horizontal / Accent) */}
                    <Link to="/trader-room" className="md:col-span-1 md:row-span-1 group relative overflow-hidden rounded-[2rem] border border-border dark:border-white/5 bg-card dark:bg-[#111114] p-6 transition-all duration-500 hover:border-emerald-500/30">
                        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex flex-col h-full justify-between">
                            <div className="flex items-center justify-between">
                                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:translate-x-1 transition-transform">
                                    <Monitor className="w-5 h-5" />
                                </div>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-foreground dark:text-white">Trade Room</h3>
                                <p className="text-[10px] text-muted-foreground font-medium">Live sync rooms.</p>
                            </div>
                        </div>
                    </Link>

                </div>

                {/* Engagement / Footer Strip */}
                <div className="relative glass-card-premium rounded-[2rem] p-6 border border-border dark:border-white/5 overflow-hidden group bg-card/50 dark:bg-[#111114]">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        <div className="hidden md:flex items-center gap-4 border-r border-border dark:border-white/10 pr-8">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg">
                                <Award className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-xs font-black text-foreground dark:text-white uppercase tracking-tighter">Current Rank</div>
                                <div className="text-lg font-black text-primary italic leading-none uppercase">
                                    {loading ? "Calculating..." : (userRanking?.percentile && userRanking.percentile > 90 ? "Legend" : userRanking?.percentile && userRanking.percentile > 75 ? "Elite" : "Pro")}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-wrap justify-center md:justify-start gap-6">
                            {[
                                { label: "Win Rate", val: loading ? "..." : `${userStats?.win_rate?.toFixed(1) || 0}%`, color: "text-emerald-500" },
                                { label: "Total Profit", val: loading ? "..." : formatCurrency(userStats?.net_profit || 0), color: "text-primary" },
                                { label: "Global Standing", val: loading ? "..." : `#${userRanking?.user_rank?.rank || "---"}`, color: "text-amber-500" }
                            ].map((s, i) => (
                                <div key={i} className="text-center md:text-left">
                                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">{s.label}</div>
                                    <div className={cn("text-xl font-black", s.color)}>{s.val}</div>
                                </div>
                            ))}
                        </div>

                        <Button className="bg-primary dark:bg-white text-white dark:text-black hover:bg-primary/90 dark:hover:bg-white/90 rounded-2xl px-8 font-black uppercase tracking-widest text-[10px] h-12 group/btn shadow-xl active:scale-95 transition-all shrink-0">
                            Upgrade Edge <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
};

export default Community;
