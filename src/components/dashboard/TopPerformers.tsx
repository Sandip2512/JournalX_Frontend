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
        <div className={cn("glass-card-premium p-4 md:p-5 rounded-[1.5rem] relative overflow-hidden flex flex-col h-full", className)}>
            <h3 className="text-sm font-bold text-foreground dark:text-white tracking-tight mb-4">Top Performers</h3>

            <div className="flex-1 flex gap-4 overflow-hidden">
                {data.length > 0 ? (
                    data.slice(0, 1).map((item, index) => (
                        <div key={item.symbol} className="w-32 lg:w-40 bg-white/[0.02] border border-white/5 rounded-2xl p-3 flex flex-col justify-between shrink-0">
                            <div className="flex items-center justify-between mb-3 w-full">
                                <div className="bg-blue-500/20 text-blue-500 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                                    #{index + 1}
                                </div>
                                {item.symbol.includes('XAU') ? (
                                    <img src="/gold.png" alt="Gold" className="w-6 h-6 object-contain shrink-0 drop-shadow-md" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                                        <span className="text-[9px] font-bold">{item.symbol.substring(0, 1)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs font-bold text-foreground dark:text-white tracking-tight">{item.symbol}</p>
                                <p className="text-[10px] font-medium text-muted-foreground/60">{item.trades} trades</p>
                            </div>

                            <p className={cn(
                                "text-sm font-black tracking-tighter mt-3 drop-shadow-sm",
                                item.profit >= 0 ? "text-blue-500" : "text-white opacity-90"
                            )}>
                                {item.profit >= 0 ? "+" : ""}${item.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full w-full text-center space-y-2 opacity-50 py-4 border border-dashed border-white/10 rounded-2xl">
                        <Target className="w-5 h-5 text-muted-foreground" />
                        <p className="text-[10px] font-medium tracking-wide text-muted-foreground">No Performance Data</p>
                    </div>
                )}
            </div>
        </div>
    );
}
