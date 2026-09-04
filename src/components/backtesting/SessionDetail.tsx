import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
    Play, Pause, FastForward, RotateCcw, 
    ChevronRight, TrendingUp, TrendingDown,
    DollarSign, Activity, Percent, ShieldCheck,
    History as HistoryIcon, BarChart2
} from "lucide-react";
import api from "@/lib/api";
import { TVSyncView } from "./TVSyncView";
import { useToast } from "@/hooks/use-toast";

import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

interface SessionDetailProps {
    sessionId: string;
}

export const SessionDetail = ({ sessionId }: SessionDetailProps) => {
    const [session, setSession] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [trades, setTrades] = useState<any[]>([]);
    const [openTrade, setOpenTrade] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchSessionData = async () => {
        try {
            setLoading(true);
            const [sessionRes, tradesRes, statsRes] = await Promise.all([
                api.get(`/api/backtest/sessions/${sessionId}`),
                api.get(`/api/backtest/sessions/${sessionId}/trades`),
                api.get(`/api/backtest/sessions/${sessionId}/stats`),
            ]);
            setSession(sessionRes.data);
            setTrades(tradesRes.data);
            setStats(statsRes.data);
            
            // Find the open trade in this session
            const open = tradesRes.data.find((t: any) => t.status === 'open');
            setOpenTrade(open || null);
        } catch (error) {
            console.error("Error fetching session detail:", error);
            toast({
                title: "Error",
                description: "Failed to load session data.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessionData();
    }, [sessionId]);

    if (loading || !session) {
        return <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-end justify-between gap-6 pb-6 border-b border-white/5">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase mb-4">
                        <Activity className="w-3 h-3" />
                        Session Analysis
                    </div>
                    <h2 className="text-4xl font-black text-foreground tracking-tighter leading-none">{session.strategy_name}</h2>
                    <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 uppercase tracking-widest font-black border border-blue-500/20">
                            {session.mode === 'tv_sync' ? 'TradingView Sync' : session.mode}
                        </span>
                        <div className="h-4 w-[1px] bg-white/10" />
                        <p className="text-muted-foreground text-sm font-medium">{session.pairs.join(", ")} • {session.timeframe}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end px-4 border-r border-white/10">
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.1em]">Started</span>
                        <span className="text-sm font-bold text-foreground">{format(new Date(session.created_at), 'MMM d, h:mm a')}</span>
                    </div>
                    {/* Add more session-wide controls if needed */}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Column - Chart and Controls (3/4 width) */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-primary/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                        <div className="relative glass-card-premium p-1 rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-2xl overflow-hidden min-h-[600px]">
                            <TVSyncView session={session} />
                        </div>
                    </div>

                    {/* Simulated Trades List */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-foreground/90 flex items-center gap-2 px-2">
                            <HistoryIcon className="w-5 h-5 text-primary" />
                            Bridge History
                        </h3>
                        
                        <div className="glass-card-premium rounded-2xl border border-white/5 bg-black/20 overflow-hidden divide-y divide-white/5 text-sm">
                            {trades.length === 0 ? (
                                <div className="py-20 text-center">
                                    <Activity className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                    <p className="text-muted-foreground font-medium">Listening for TradingView alerts...</p>
                                    <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest mt-2">Setup your webhook to see trades here</p>
                                </div>
                            ) : (
                                trades.map((trade) => (
                                    <div key={trade._id} className="group flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${trade.trade_type?.toLowerCase() === 'buy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-400'}`}>
                                                {trade.trade_type?.toLowerCase() === 'buy' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black tracking-tight text-foreground">{trade.pair}</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">@{trade.entry_price}</span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground/40 font-bold uppercase">{format(new Date(trade.entry_time), 'MMM d, HH:mm:ss')}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-8">
                                            <div className="text-right flex flex-col items-end">
                                                <span className={`font-mono font-black text-lg ${trade.profit_loss >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                                                    {trade.profit_loss >= 0 ? '+' : ''}{trade.profit_loss.toFixed(2)}
                                                </span>
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${trade.status === 'open' ? 'text-blue-400' : 'text-muted-foreground/40'}`}>
                                                    {trade.status}
                                                </span>
                                            </div>
                                            <div className="w-6 h-6 flex items-center justify-center">
                                                <ChevronRight className="w-4 h-4 text-muted-foreground/20" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Stats (1/4 width) */}
                <div className="space-y-6">
                    <div className="glass-card-premium p-8 rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl space-y-8">
                        <div>
                            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <BarChart2 className="w-4 h-4 text-primary" />
                                Real-time Stats
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="relative group/stat">
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1.5 opacity-60">Win Rate</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-4xl font-black text-primary tracking-tighter">{stats?.win_rate || 0}<span className="text-xl font-medium opacity-40">%</span></p>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden">
                                        <div 
                                            className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)]" 
                                            style={{ width: `${stats?.win_rate || 0}%` }} 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Trades</p>
                                        <p className="text-xl font-black text-foreground">{stats?.total_trades || 0}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Profit Factor</p>
                                        <p className="text-xl font-black text-emerald-400">1.42</p>
                                    </div>
                                </div>

                                <div className="p-6 rounded-[1.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 relative overflow-hidden">
                                    <div className="absolute -right-4 -bottom-4 opacity-5">
                                        <TrendingUp className="w-24 h-24" />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Net PnL</p>
                                    <p className={`text-3xl font-black tracking-tighter ${ (stats?.net_pnl || 0) >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                                        ${stats?.net_pnl?.toLocaleString() || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-muted-foreground/60 uppercase">Max Drawdown</span>
                                <span className="text-red-400/80">{stats?.max_drawdown || 0}%</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-muted-foreground/60 uppercase">Starting Seed</span>
                                <span className="text-foreground/80">${session.starting_balance.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                        <div className="flex items-center gap-3 text-blue-400 mb-3">
                            <ShieldCheck className="w-5 h-5 text-blue-500" />
                            <span className="text-sm font-bold tracking-tight">Sync Status</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Webhook is listening for payloads at your unique URL. Open TradingView to start syncing live paper trades.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

