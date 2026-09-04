import React from "react";
import { TrendingUp, TrendingDown, Clock, BarChart3, Target, Info, Sparkles, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { JournalEntryForm } from "./JournalEntryForm";
import { TradeQualityScore } from "./TradeQualityScore";
import { TradeChart } from "./TradeChart";

interface TradeDetailViewProps {
    trade: any;
    onUpdate: (updatedTrade: any) => void;
    className?: string;
}

export function TradeDetailView({ trade, onUpdate, className }: TradeDetailViewProps) {
    if (!trade) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-50">
                <Activity className="w-12 h-12 text-muted-foreground animate-pulse" />
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Select a trade to analyze</p>
            </div>
        );
    }

    const isWin = trade.net_profit > 0;
    const holdDuration = trade.close_time && trade.open_time
        ? new Date(trade.close_time).getTime() - new Date(trade.open_time).getTime()
        : 0;

    const formatDuration = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days}d ${hours % 24}h`;
        return `${hours}h ${Math.floor((ms / (1000 * 60)) % 60)}m`;
    };

    return (
        <div className={cn("flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar", className)}>
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-muted dark:bg-white/5 border border-border dark:border-white/10 flex items-center justify-center shadow-2xl">
                            <span className="text-xl font-black text-foreground dark:text-white">{trade.symbol.substring(0, 1)}</span>
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-black text-foreground dark:text-white">{trade.symbol}</h2>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                                    isWin ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                )}>
                                    {isWin ? "Winner" : "Loser"}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider">
                                    Score: {trade.quality_score || 0}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                                <span className={trade.type === "BUY" ? "text-primary" : "text-red-500"}>{trade.type}</span>
                                <span>•</span>
                                <span>{format(new Date(trade.open_time), "MMM d, hh:mm aa")}</span>
                                <span>•</span>
                                <span>{formatDuration(holdDuration)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right space-y-0.5">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">P&L</p>
                        <p className={cn(
                            "text-3xl font-black",
                            isWin ? "text-primary" : "text-red-500"
                        )}>
                            {isWin ? "+" : "-"}${Math.abs(trade.net_profit).toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Entry Price", value: trade.price_open?.toFixed(2) || "0.00", icon: TrendingUp, color: "text-primary" },
                        { label: "Exit Price", value: trade.price_close?.toFixed(2) || "0.00", icon: TrendingDown, color: "text-red-500" },
                        { label: "Quantity", value: trade.volume?.toFixed(2) || "0.00", icon: Target, color: "text-foreground dark:text-white" },
                        {
                            label: "Price Move",
                            value: `${((Math.abs((trade.price_close - trade.price_open) / trade.price_open)) * 100).toFixed(2)}%`,
                            icon: BarChart3,
                            color: isWin ? "text-emerald-500" : "text-red-500"
                        },
                    ].map((m) => (
                        <div key={m.label} className="glass-card-premium p-4 md:p-5 rounded-3xl border border-border dark:border-white/5 space-y-1 relative overflow-hidden group">
                            <div className="flex items-center gap-2 relative z-10">
                                <m.icon className="w-2.5 h-2.5 text-muted-foreground" />
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{m.label}</span>
                            </div>
                            <p className={cn("text-lg font-black relative z-10", m.color)}>{m.value}</p>
                            <div className="absolute top-0 right-0 w-12 h-full bg-muted/20 dark:bg-white/5 blur-xl -mr-6 group-hover:bg-muted/30 dark:group-hover:bg-white/10 transition-colors" />
                        </div>
                    ))}
                </div>

                {/* Chart / Replay Container */}
                <div className="glass-card-premium rounded-3xl border border-border dark:border-white/5 relative overflow-hidden h-[450px]">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#030711] to-transparent opacity-50" />
                    <div className="p-6 flex items-center justify-between border-b border-border dark:border-white/5 relative z-10">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold text-foreground dark:text-white uppercase tracking-wider">Market Analysis</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Binance Data</span>
                        </div>
                    </div>

                    <div className="p-4 relative z-10">
                        <TradeChart
                            symbol={trade.symbol}
                            openTime={trade.open_time}
                            closeTime={trade.close_time}
                            openPrice={trade.price_open}
                            closePrice={trade.price_close}
                            type={trade.type}
                        />
                    </div>
                </div>

                {/* Lower Section: Journal and Quality Score */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <JournalEntryForm trade={trade} onUpdate={onUpdate} />
                    <TradeQualityScore trade={trade} />
                </div>

                {/* Insights Section */}
                <div className="glass-card-premium p-8 rounded-3xl border border-border dark:border-white/5 space-y-6 relative overflow-hidden group">
                    <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-bold text-foreground dark:text-white uppercase tracking-wider">Insights</h3>
                        </div>
                        <span className="text-[10px] font-black bg-muted dark:bg-white/10 text-muted-foreground px-3 py-1.5 rounded-full uppercase tracking-widest">
                            Coming Soon
                        </span>
                    </div>

                    <div className="flex items-center gap-4 bg-muted dark:bg-white/5 p-6 rounded-2xl border border-border dark:border-white/5 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                            <Info className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-foreground/50 dark:text-white/50">AI-Powered Insights</p>
                            <p className="text-xs text-muted-foreground/50">Get personalized trading insights and pattern analysis.</p>
                        </div>
                    </div>
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/5 blur-[100px] rounded-full group-hover:bg-primary/10 transition-colors" />
                </div>

                {/* vs Your Average Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    {[
                        { label: "vs Avg Winner", value: `+${trade.net_profit > 0 ? trade.net_profit.toFixed(2) : "0.00"}`, change: "+0%", color: "text-foreground dark:text-white" },
                        { label: "Hold Duration", value: formatDuration(holdDuration), change: "+0%", color: "text-primary" },
                        { label: "Execution Score", value: "50%", change: "+0%", color: "text-foreground dark:text-white" },
                    ].map((item, i) => (
                        <div key={i} className="glass-card-premium p-8 rounded-3xl border border-border dark:border-white/5 space-y-4">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{item.label}</p>
                            <div className="space-y-1">
                                <p className={cn("text-2xl font-black", item.color)}>${item.value}</p>
                                <p className="text-[10px] font-black text-primary uppercase">{item.change}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div >
    );
}
