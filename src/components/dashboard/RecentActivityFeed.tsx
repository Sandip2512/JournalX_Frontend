import React from "react";
import { ArrowUpRight, ArrowDownRight, Activity, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

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
        <div className="glass-card-premium p-4 rounded-3xl flex flex-col h-full animate-fade-up relative overflow-hidden group border border-border dark:border-white/5 shadow-xl" style={{ animationDelay: "0.2s" }}>
            {/* Inner Glow/Shine */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
                <h3 className="text-sm font-bold text-foreground dark:text-white tracking-tight leading-none pt-1">
                    Recent Activity
                </h3>
                <span className="text-[9px] text-muted-foreground/40 font-bold bg-white/[0.02] px-2.5 py-1 rounded-md border border-white/5">
                    {trades.length} trades
                </span>
            </div>

            <div className="space-y-1 relative z-10 flex-1 mt-3">
                {trades.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-[10px] flex flex-col items-center gap-2 opacity-50 flex-1 justify-center">
                        <Activity className="w-8 h-8 text-primary/10" />
                        <p className="font-medium tracking-wide">Awaiting market activity...</p>
                    </div>
                ) : (
                    trades.slice(0, 3).map((trade, idx) => {
                        const isProfit = (trade.profit ?? 0) >= 0;
                        return (
                            <div
                                key={trade.id || idx}
                                className="group/row flex flex-col justify-center p-3 rounded-2xl bg-white/[0.02] border border-white/5"
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        {trade.symbol.includes('XAU') ? (
                                            <img src="/gold.png" alt="Gold" className="w-4 h-4 object-contain shrink-0 drop-shadow-md" />
                                        ) : (
                                            <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                                                <span className="text-[7px] font-bold">{trade.symbol.substring(0, 1)}</span>
                                            </div>
                                        )}
                                        <span className="font-bold text-foreground dark:text-white text-[12px] tracking-tight">{trade.symbol}</span>
                                        <span className={cn(
                                            "text-[8px] px-1.5 py-0.5 rounded border font-black uppercase tracking-wider",
                                            trade.type === "BUY"
                                                ? "bg-blue-500/10 border-blue-500/20 text-blue-500"
                                                : "bg-red-500/10 border-red-500/20 text-red-500"
                                        )}>
                                            {trade.type === "BUY" ? "LONG" : "SHORT"}
                                        </span>
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                        <span className="text-[10px] text-muted-foreground/60 font-medium">0.1 lots</span>
                                        <p className={cn(
                                            "text-sm font-black tracking-tight",
                                            (trade.net_profit ?? 0) >= 0 ? "text-blue-500" : "text-white text-opacity-90"
                                        )}>
                                            {(trade.net_profit ?? 0) >= 0 ? `+$${(trade.net_profit ?? 0).toFixed(2)}` : `-$${Math.abs(trade.net_profit ?? 0).toFixed(2)}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-1">
                                    <span className="text-[10px] text-muted-foreground/40 font-medium">{new Date(trade.close_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {trades.length > 0 && (
                <div className="pt-2 relative z-10 w-full mt-auto">
                    <Link
                        to="/trades"
                        className="w-full flex items-center justify-center gap-1.5 py-1 text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors"
                    >
                        View All Activity
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </Link>
                </div>
            )}

            {/* Bottom Glow */}
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
}
