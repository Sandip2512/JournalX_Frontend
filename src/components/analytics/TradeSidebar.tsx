import React from "react";
import { Search, Filter, SortDesc, TrendingUp, TrendingDown, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Trade {
    trade_no: number;
    symbol: string;
    type: string;
    net_profit: number;
    open_time: string | Date;
    is_journaled?: boolean;
}

interface TradeSidebarProps {
    trades: Trade[];
    selectedTradeNo: number | null;
    onSelectTrade: (tradeNo: number) => void;
    className?: string;
}

export function TradeSidebar({ trades, selectedTradeNo, onSelectTrade, className }: TradeSidebarProps) {
    const [filter, setFilter] = React.useState<"all" | "winners" | "losers">("all");
    const [timeFilter, setTimeFilter] = React.useState("All Time");
    const [sortBy, setSortBy] = React.useState("By Date");

    const filteredTrades = React.useMemo(() => {
        let result = [...trades];

        if (filter === "winners") {
            result = result.filter(t => t.net_profit > 0);
        } else if (filter === "losers") {
            result = result.filter(t => t.net_profit <= 0);
        }

        // Sort - for now just by date desc
        result.sort((a, b) => new Date(b.open_time).getTime() - new Date(a.open_time).getTime());

        return result;
    }, [trades, filter]);

    return (
        <div className={cn("flex flex-col h-full bg-background dark:bg-[#030711]/50 border-r border-border dark:border-white/5", className)}>
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground dark:text-white uppercase tracking-wider">Trade Analysis</h3>
                    <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">
                        {filteredTrades.length} trades
                    </span>
                </div>

                {/* Filter Tabs */}
                <div className="flex p-1 bg-muted dark:bg-white/5 rounded-xl border border-border dark:border-white/5">
                    {(["all", "winners", "losers"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all",
                                filter === f
                                    ? "bg-card dark:bg-white/10 text-foreground dark:text-white shadow-lg"
                                    : "text-muted-foreground hover:text-foreground dark:hover:text-white"
                            )}
                        >
                            {f} {f === "all" ? "" : filter === f ? filteredTrades.length : ""}
                        </button>
                    ))}
                </div>

                {/* Dropdowns */}
                <div className="grid grid-cols-2 gap-2">
                    <select
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="bg-muted dark:bg-white/5 border border-border dark:border-white/5 rounded-xl px-3 py-2 text-[10px] font-bold text-foreground dark:text-white outline-none cursor-pointer hover:bg-muted/80 dark:hover:bg-white/10 transition-colors appearance-none"
                    >
                        <option value="All Time">All Time</option>
                        <option value="This Month">This Month</option>
                        <option value="Today">Today</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-muted dark:bg-white/5 border border-border dark:border-white/5 rounded-xl px-3 py-2 text-[10px] font-bold text-foreground dark:text-white outline-none cursor-pointer hover:bg-muted/80 dark:hover:bg-white/10 transition-colors appearance-none"
                    >
                        <option value="By Date">By Date</option>
                        <option value="By Profit">By Profit</option>
                    </select>
                </div>
            </div>

            {/* Trade List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {filteredTrades.map((trade) => (
                    <button
                        key={trade.trade_no}
                        onClick={() => onSelectTrade(trade.trade_no)}
                        className={cn(
                            "w-full text-left p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden",
                            selectedTradeNo === trade.trade_no
                                ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(59,130,246,0.1)] scale-[1.02]"
                                : "bg-muted/50 dark:bg-white/5 border-border dark:border-white/5 hover:bg-muted dark:hover:bg-white/10 hover:border-border dark:hover:border-white/10"
                        )}
                    >
                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black",
                                        trade.net_profit > 0 ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"
                                    )}>
                                        {trade.symbol.substring(0, 1)}
                                    </div>
                                    <span className="text-sm font-black text-foreground dark:text-white">{trade.symbol}</span>
                                    {trade.is_journaled && (
                                        <span className="text-[8px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase">
                                            Journaled
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                                    <span className={trade.type === "BUY" ? "text-primary" : "text-red-500"}>{trade.type}</span>
                                    <span>•</span>
                                    <span>{format(new Date(trade.open_time), "MMM d, hh:mm aa")}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={cn(
                                    "text-sm font-black",
                                    trade.net_profit > 0 ? "text-emerald-500" : "text-red-500"
                                )}>
                                    {trade.net_profit > 0 ? "+" : ""}${Math.abs(trade.net_profit).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {/* Background Accent */}
                        <div className={cn(
                            "absolute inset-0 bg-gradient-to-r transition-opacity duration-300 pointer-events-none opacity-0 group-hover:opacity-100",
                            trade.net_profit > 0 ? "from-emerald-500/5 to-transparent" : "from-red-500/5 to-transparent"
                        )} />
                    </button>
                ))}

                {filteredTrades.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-50">
                        <Target className="w-8 h-8 text-muted-foreground" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No trades found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
