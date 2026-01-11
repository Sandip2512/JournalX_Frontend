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
            <div className="glass-card-premium p-6 rounded-xl animate-pulse space-y-4">
                <div className="h-6 w-1/3 bg-white/10 rounded" />
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-white/5 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card-premium p-6 rounded-xl space-y-6 h-full animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Recent Activity
                </h3>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Last 5 Trades</span>
            </div>

            <div className="space-y-3">
                {trades.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No recent trading activity found.
                    </div>
                ) : (
                    trades.map((trade, idx) => {
                        const isProfit = (trade.profit ?? 0) >= 0;
                        return (
                            <div
                                key={trade.id || idx}
                                className="group flex items-center justify-between p-3 rounded-lg bg-white/0 hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10 hover:shadow-lg hover:-translate-x-[-4px]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br shadow-inner",
                                        isProfit
                                            ? "from-emerald-500/20 to-emerald-500/5 text-emerald-500"
                                            : "from-red-500/20 to-red-500/5 text-red-500"
                                    )}>
                                        {trade.type === "BUY" ? (
                                            <ArrowUpRight className="w-5 h-5" />
                                        ) : (
                                            <ArrowDownRight className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-foreground">{trade.symbol}</span>
                                            <span className={cn(
                                                "text-[10px] px-1.5 py-0.5 rounded border font-medium uppercase",
                                                trade.type === "BUY"
                                                    ? "bg-blue-500/10 border-blue-500/20 text-blue-500"
                                                    : "bg-orange-500/10 border-orange-500/20 text-orange-500"
                                            )}>
                                                {trade.type}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                            <span>{trade.volume} Lot</span>
                                            <span className="w-1 h-1 rounded-full bg-border" />
                                            <span>{new Date(trade.close_time).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className={cn(
                                        "text-sm font-bold tabular-nums",
                                        (trade.net_profit ?? 0) >= 0 ? "text-emerald-500" : "text-red-500"
                                    )}>
                                        {(trade.net_profit ?? 0).toFixed(2) === "0.00" && (trade.net_profit ?? 0) !== 0
                                            ? (trade.net_profit ?? 0).toFixed(4)
                                            : (trade.net_profit ?? 0) >= 0
                                                ? `+${(trade.net_profit ?? 0).toFixed(2)}`
                                                : (trade.net_profit ?? 0).toFixed(2)}
                                    </p>
                                    <div className="text-xs text-muted-foreground tabular-nums">
                                        {trade.close_price}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
