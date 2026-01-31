import React from "react";
import { TrendingUp, TrendingDown, Clock, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LongVsShort({ data }: { data: any }) {
    const longData = data?.long || { trades: 0, pl: 0, winRate: 0 };
    const shortData = data?.short || { trades: 0, pl: 0, winRate: 0 };

    return (
        <div className="glass-card-premium p-6 rounded-3xl border border-white/5 space-y-6">
            <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-xs font-bold text-foreground dark:text-white uppercase tracking-wider">Long vs Short</h3>
            </div>

            <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-muted dark:bg-white/5 border border-border dark:border-white/5 border-l-2 border-l-primary relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-3 relative z-10">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-foreground dark:text-white">Long</span>
                    </div>
                    <div className="flex justify-between items-end relative z-10">
                        <div className="space-y-1">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase">Trades</p>
                            <p className="text-sm font-black text-foreground dark:text-white">{longData.trades}</p>
                        </div>
                        <div className="space-y-1 text-center">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase">P&L</p>
                            <p className={cn("text-sm font-black", longData.pl >= 0 ? "text-primary" : "text-red-500")}>
                                ${longData.pl.toFixed(2)}
                            </p>
                        </div>
                        <div className="space-y-1 text-right">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase">Win %</p>
                            <p className="text-sm font-black text-emerald-500">{longData.winRate.toFixed(1)}%</p>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 blur-2xl -mr-16 group-hover:bg-primary/10 transition-colors" />
                </div>

                <div className="p-4 rounded-2xl bg-muted dark:bg-white/5 border border-border dark:border-white/5 border-l-2 border-l-red-500 relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-3 relative z-10">
                        <TrendingDown className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-bold text-foreground dark:text-white">Short</span>
                    </div>
                    <div className="flex justify-between items-end relative z-10">
                        <div className="space-y-1">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase">Trades</p>
                            <p className="text-sm font-black text-foreground dark:text-white">{shortData.trades}</p>
                        </div>
                        <div className="space-y-1 text-center">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase">P&L</p>
                            <p className={cn("text-sm font-black", shortData.pl >= 0 ? "text-primary" : "text-red-500")}>
                                ${shortData.pl.toFixed(2)}
                            </p>
                        </div>
                        <div className="space-y-1 text-right">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase">Win %</p>
                            <p className="text-sm font-black text-muted-foreground">{shortData.winRate.toFixed(1)}%</p>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-full bg-red-500/5 blur-2xl -mr-16 group-hover:bg-red-500/10 transition-colors" />
                </div>
            </div>
        </div>
    );
}

export function DayPerformance({ data }: { data: any }) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const displayDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const perf = days.map(day => data?.[day] || 0);
    const max = Math.max(...perf.map(Math.abs), 1);

    return (
        <div className="glass-card-premium p-6 rounded-3xl border border-white/5 space-y-6">
            <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-xs font-bold text-foreground dark:text-white uppercase tracking-wider">Day Performance</h3>
            </div>

            <div className="space-y-3">
                {displayDays.map((day, i) => (
                    <div key={day} className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-muted-foreground w-8 uppercase">{day}</span>
                        <div className="flex-1 h-2 bg-muted dark:bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-1000",
                                    perf[i] > 0 ? "bg-primary" : perf[i] < 0 ? "bg-red-500" : "bg-white/5"
                                )}
                                style={{ width: `${(Math.abs(perf[i]) / max) * 100}%` }}
                            />
                        </div>
                        <span className={cn("text-[10px] font-black w-10 text-right", perf[i] > 0 ? "text-primary" : perf[i] < 0 ? "text-red-500" : "text-muted-foreground")}>
                            {perf[i] !== 0 ? `$${Math.abs(perf[i]).toFixed(1)}` : "—"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function TopSymbols({ data }: { data: any }) {
    const symbols = data || [];

    return (
        <div className="glass-card-premium p-6 rounded-3xl border border-white/5 space-y-6">
            <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-xs font-bold text-foreground dark:text-white uppercase tracking-wider">Top Symbols</h3>
            </div>

            <div className="space-y-3">
                {symbols.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-[10px] font-bold uppercase opacity-50">
                        No trade data available
                    </div>
                ) : (
                    symbols.map((s: any, i: number) => (
                        <div key={s.name} className="flex items-center justify-between p-3 rounded-2xl bg-muted dark:bg-white/5 border border-border dark:border-white/5 border-l-2 border-l-primary group hover:bg-muted/80 dark:hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                    {i + 1}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-black text-foreground dark:text-white">{s.name}</p>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase">{s.trades} trades • {(s.winRate || 0).toFixed(0)}% win</p>
                                </div>
                            </div>
                            <p className={cn("text-sm font-black", (s.pl || 0) >= 0 ? "text-primary" : "text-red-500")}>
                                ${(s.pl || 0).toFixed(2)}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
