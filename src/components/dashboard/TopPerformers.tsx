import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Target } from "lucide-react";

interface Performer {
    symbol: string;
    profit: number;
    trades: number;
    winRate?: number;
}

interface TopPerformersProps {
    data: Performer[];
    className?: string;
}

export function TopPerformers({ data, className }: TopPerformersProps) {
    return (
        <div className={cn("glass-card-premium p-6 rounded-3xl relative overflow-hidden flex flex-col", className)}>
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Top Performers</p>
                    <h3 className="text-xl font-bold text-foreground dark:text-white tracking-tight">Best Symbols</h3>
                </div>
            </div>

            <div className="flex-1 space-y-4">
                {data.length > 0 ? (
                    data.map((item, index) => (
                        <div key={item.symbol} className="flex items-center justify-between group/item">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover/item:scale-110 transition-transform duration-500">
                                    <span className="text-xs font-black text-primary uppercase">{item.symbol.substring(0, 2)}</span>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-black text-foreground dark:text-white tracking-tight uppercase">{item.symbol}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground/60">{item.trades} trades</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={cn(
                                    "text-sm font-black tracking-tight",
                                    item.profit >= 0 ? "text-emerald-500" : "text-red-500"
                                )}>
                                    {item.profit >= 0 ? "+" : ""}${item.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <div className="flex items-center justify-end gap-1 mt-0.5">
                                    <TrendingUp className="w-3 h-3 text-emerald-500/50" />
                                    <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">{item.winRate || 100}% WR</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-20 py-8">
                        <Target className="w-8 h-8 text-primary" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No Performance Data</p>
                    </div>
                )}
            </div>
        </div>
    );
}
