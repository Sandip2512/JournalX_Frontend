import React from "react";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface Trade {
    id: string;
    symbol: string;
    type: "BUY" | "SELL";
    volume: number;
    open_price: number;
    close_price: number;
    profit?: number;
    net_profit?: number; // Added to match backend schema
    close_time: string;
    open_time: string; // Added open_time
    ticket?: number;
}

interface RecentActivityFeedProps {
    trades: Trade[];
    isLoading: boolean;
}

export function RecentActivityFeed({ trades, isLoading }: RecentActivityFeedProps) {
    if (isLoading) {
        return (
            <div className="glass-card-premium p-4 rounded-xl animate-pulse space-y-3">
                <div className="h-5 w-1/3 bg-muted dark:bg-white/10 rounded" />
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-muted/50 dark:bg-white/5 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card-premium p-4 rounded-[2rem] space-y-4 h-full animate-fade-up relative overflow-hidden group border border-border dark:border-white/5 shadow-xl" style={{ animationDelay: "0.2s" }}>
            {/* Inner Glow/Shine */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
                <h3 className="text-sm font-black text-foreground dark:text-white flex items-center gap-2 tracking-tight">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                        <Activity className="w-3.5 h-3.5 group-hover:animate-pulse" />
                    </div>
                    Recent Activity
                </h3>
                <span className="text-[8px] text-muted-foreground/50 uppercase tracking-[0.2em] font-black bg-muted dark:bg-white/5 px-2 py-0.5 rounded-full border border-border dark:border-white/5">
                    Live
                </span>
            </div>

            <div className="space-y-0.5 relative z-10">
                {trades.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-[10px] flex flex-col items-center gap-2 opacity-50">
                        <Activity className="w-8 h-8 text-primary/10" />
                        <p className="font-medium tracking-wide">Awaiting market activity...</p>
                    </div>
                ) : (
                    trades.slice(0, 8).map((trade, idx) => {
                        const isProfit = (trade.profit ?? 0) >= 0;
                        return (
                            <div
                                key={trade.id || idx}
                                className="group/row flex items-center justify-between p-2 rounded-lg bg-transparent hover:bg-muted/50 dark:hover:bg-white/[0.03] transition-all duration-500 border border-transparent hover:border-border dark:hover:border-white/5 hover:translate-x-1"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className={cn(
                                        "w-7 h-7 rounded-md flex items-center justify-center bg-gradient-to-br shadow-sm transition-transform duration-500 group-hover/row:scale-105",
                                        isProfit
                                            ? "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border border-emerald-500/10"
                                            : "from-red-500/20 to-red-500/5 text-red-400 border border-red-500/10"
                                    )}>
                                        {trade.type === "BUY" ? (
                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                        ) : (
                                            <ArrowDownRight className="w-3.5 h-3.5" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-foreground dark:text-white text-[11px] tracking-tight group-hover/row:text-primary transition-colors">{trade.symbol}</span>
                                            <span className={cn(
                                                "text-[6px] px-1 py-0 rounded-full border font-black uppercase tracking-wider",
                                                trade.type === "BUY"
                                                    ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                                    : "bg-orange-500/10 border-orange-500/20 text-orange-400"
                                            )}>
                                                {trade.type}
                                            </span>
                                        </div>
                                        <div className="text-[8px] text-muted-foreground/60 flex items-center gap-1.5 mt-0.5 font-medium">
                                            <span className="text-primary/70">{trade.volume} Lot</span>
                                            <div className="w-0.5 h-0.5 rounded-full bg-border dark:bg-white/10" />
                                            <span>{new Date(trade.close_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className={cn(
                                        "text-[11px] font-black tabular-nums transition-colors",
                                        (trade.net_profit ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"
                                    )}>
                                        {(trade.net_profit ?? 0) >= 0 ? `+${(trade.net_profit ?? 0).toFixed(2)}` : (trade.net_profit ?? 0).toFixed(2)}
                                    </p>
                                    <div className="text-[7px] font-bold text-muted-foreground/30 uppercase tracking-tighter">
                                        @{trade.close_price}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Bottom Glow */}
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
}
