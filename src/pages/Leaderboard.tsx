import UserLayout from "@/components/layout/UserLayout";
import { Trophy, Medal, Crown, ArrowUp, ArrowDown, RefreshCw, Filter, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { leaderboardApi } from "@/lib/api";
import { LeaderboardEntry, SortByMetric, TimePeriod } from "@/types/leaderboard-types";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortByMetric>('net_profit');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all_time');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await leaderboardApi.getLeaderboard(sortBy, 100, timePeriod);
      setLeaderboardData(response.data);
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch leaderboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy, timePeriod]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLeaderboard, 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, sortBy, timePeriod]);

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      compactDisplay: 'short',
      maximumFractionDigits: 1
    }).format(value);
  };

  const topThree = leaderboardData.slice(0, 3);
  const others = leaderboardData.slice(3);

  const timeOptions = [
    { label: "Today", value: "daily" as TimePeriod },
    { label: "This Week", value: "weekly" as TimePeriod },
    { label: "This Month", value: "monthly" as TimePeriod },
    { label: "This Year", value: "all_time" as TimePeriod }, // Mapping 'This Year' to 'all_time' for now
  ];

  return (
    <UserLayout>
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8 animate-fade-in text-foreground">
        {/* Header & Filter Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-foreground dark:text-white">Leaderboard</h1>
            <p className="text-muted-foreground font-medium">Top performing traders this {timeOptions.find(o => o.value === timePeriod)?.label.toLowerCase() || 'week'}</p>
          </div>

          <div className="flex bg-muted/50 dark:bg-[#111114] border border-border dark:border-white/5 p-1 rounded-2xl">
            {timeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimePeriod(option.value)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300",
                  timePeriod === option.value
                    ? "bg-white text-black shadow-lg"
                    : "text-muted-foreground hover:text-white"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Podium Section */}
        <div className="relative glass-card-premium rounded-[3rem] border border-border dark:border-white/5 p-6 md:p-10 overflow-hidden bg-card/50 dark:bg-[#0c0c0e]">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-4 max-w-5xl mx-auto relative z-10">
            {/* 2nd Place */}
            {topThree[1] && (
              <div className="flex-1 w-full order-2 md:order-1 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                <PodiumCard
                  entry={topThree[1]}
                  rank={2}
                  formatCurrency={formatCurrency}
                  getInitials={getInitials}
                  isUser={topThree[1].user_id === user?.user_id}
                />
              </div>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <div className="flex-1 w-full order-1 md:order-2 scale-105 z-20 animate-fade-up">
                <PodiumCard
                  entry={topThree[0]}
                  rank={1}
                  formatCurrency={formatCurrency}
                  getInitials={getInitials}
                  isUser={topThree[0].user_id === user?.user_id}
                />
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div className="flex-1 w-full order-3 md:order-3 animate-fade-up" style={{ animationDelay: '0.2s' }}>
                <PodiumCard
                  entry={topThree[2]}
                  rank={3}
                  formatCurrency={formatCurrency}
                  getInitials={getInitials}
                  isUser={topThree[2].user_id === user?.user_id}
                />
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="glass-card-premium rounded-[2.5rem] border border-border dark:border-white/5 overflow-hidden bg-card/30 dark:bg-[#0c0c0e]/50 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border dark:border-white/5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  <th className="px-4 py-3">RANK</th>
                  <th className="px-4 py-3">TRADER</th>
                  <th className="px-4 py-3 text-right">TRADES</th>
                  <th className="px-4 py-3 text-right">WIN RATE</th>
                  <th className="px-4 py-3 text-right">PROFIT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading && others.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <RefreshCw className="w-5 h-5 animate-spin text-primary mx-auto" />
                    </td>
                  </tr>
                ) : others.length > 0 ? (
                  others.map((entry) => (
                    <tr key={entry.user_id} className={cn(
                      "group hover:bg-muted/50 dark:hover:bg-white/[0.02] transition-colors",
                      entry.user_id === user?.user_id && "bg-primary/5 dark:bg-primary/10"
                    )}>
                      <td className="px-4 py-3 font-black text-muted-foreground pr-0">#{entry.rank}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 border border-border dark:border-white/10">
                            <AvatarFallback className="bg-muted dark:bg-white/5 text-[9px] font-bold text-foreground dark:text-white">
                              {getInitials(entry.username)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-black text-foreground dark:text-white text-xs uppercase">{entry.username}</div>
                            <div className="text-[9px] font-bold text-muted-foreground">@{entry.username.toLowerCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-black text-foreground dark:text-white text-xs">{entry.total_trades}</td>
                      <td className="px-4 py-3 text-right font-black text-foreground dark:text-white text-xs">{entry.win_rate.toFixed(1)}%</td>
                      <td className="px-4 py-3 text-right font-black text-emerald-500 text-xs">+{formatCurrency(entry.net_profit)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-muted-foreground font-medium">No more traders yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </UserLayout>
  );
};

interface PodiumCardProps {
  entry: LeaderboardEntry;
  rank: 1 | 2 | 3;
  formatCurrency: (v: number) => string;
  getInitials: (n: string) => string;
  isUser: boolean;
}

const PodiumCard = ({ entry, rank, formatCurrency, getInitials, isUser }: PodiumCardProps) => {
  const rankConfig = {
    1: {
      icon: Crown,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      glow: "shadow-[0_0_30px_-10px_rgba(245,158,11,0.2)]",
      size: "p-4 md:p-5 pt-8 md:pt-10",
      avatarSize: "w-14 h-14 md:w-16 md:h-16"
    },
    2: {
      icon: Medal,
      color: "text-slate-400",
      bg: "bg-slate-400/10",
      border: "border-slate-400/20",
      glow: "",
      size: "p-3 md:p-4 pt-6 md:pt-8",
      avatarSize: "w-12 h-12 md:w-14 md:h-14"
    },
    3: {
      icon: Medal,
      color: "text-amber-700",
      bg: "bg-amber-700/10",
      border: "border-amber-700/20",
      glow: "",
      size: "p-3 md:p-4 pt-6 md:pt-8",
      avatarSize: "w-12 h-12 md:w-14 md:h-14"
    },
  };

  const config = rankConfig[rank];

  return (
    <div className={cn(
      "relative group flex flex-col items-center bg-card dark:bg-[#0a0a0c] border rounded-[1.5rem] transition-all duration-500 hover:scale-[1.02]",
      config.size,
      "border-border dark:border-white/10",
      config.glow,
      isUser && "border-primary/50"
    )}>
      {/* Rank Badge */}
      <div className={cn(
        "absolute -top-3 px-3 py-1 rounded-full flex items-center gap-1.5 border font-black text-[9px] uppercase tracking-widest",
        config.bg,
        config.border,
        config.color
      )}>
        <config.icon className="w-3 h-3" />
        {rank}{rank === 1 ? 'st' : rank === 2 ? 'nd' : 'rd'}
      </div>

      {/* Avatar */}
      <div className="relative mb-3">
        <div className={cn(
          "absolute inset-0 rounded-full blur-lg opacity-20",
          rank === 1 ? "bg-amber-500" : "bg-primary/30"
        )} />
        <Avatar className={cn("border-2 border-border dark:border-white/10 ring-2 ring-background dark:ring-black", config.avatarSize)}>
          <AvatarFallback className="bg-muted dark:bg-[#1a1a1e] text-xs font-black text-foreground dark:text-white">
            {getInitials(entry.username)}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Info */}
      <div className="text-center space-y-2.5 w-full">
        <div>
          <h3 className={cn("font-black text-foreground dark:text-white uppercase tracking-tight", rank === 1 ? "text-sm md:text-base" : "text-xs")}>{entry.username}</h3>
          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">@{entry.username.toLowerCase()}</p>
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-border dark:border-white/5">
          <div className="text-center">
            <div className={cn("font-black text-foreground dark:text-white", rank === 1 ? "text-base" : "text-sm")}>{entry.total_trades}</div>
            <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Trades</div>
          </div>
          <div className="text-center">
            <div className={cn("font-black text-foreground dark:text-white", rank === 1 ? "text-base" : "text-sm")}>{entry.win_rate.toFixed(0)}%</div>
            <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Win Rate</div>
          </div>
        </div>

        <div className={cn("font-black text-emerald-500 pt-1 tracking-tight", rank === 1 ? "text-xl" : "text-lg")}>
          +{formatCurrency(entry.net_profit)}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
