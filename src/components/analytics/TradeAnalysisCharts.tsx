import React from "react";
import { TrendingUp, TrendingDown, Clock, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LongVsShort({ data }: { data: any }) {
    const longData = data?.long || { trades: 0, pl: 0, winRate: 0 };
    const shortData = data?.short || { trades: 0, pl: 0, winRate: 0 };

    // Metric calculation for volume ratio bar
    const totalTrades = (longData.trades + shortData.trades) || 1;
    const longRatio = (longData.trades / totalTrades) * 100;
    const shortRatio = (shortData.trades / totalTrades) * 100;

    return (
        <div className="glass-card-premium p-6 rounded-3xl border border-white/5 space-y-6 hover:-translate-y-2 transition-all duration-500 hover:border-primary/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(11,102,228,0.1)]">
            <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-xs font-bold text-foreground dark:text-white uppercase tracking-wider">Position Distribution</h3>
            </div>

            <div className="space-y-6">
                {/* Battle Arena View */}
                <div className="relative flex justify-between items-stretch gap-4">
                    {/* VS Center Badge */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/95 backdrop-blur-md border border-white/10 flex items-center justify-center text-[9px] font-black italic text-muted-foreground z-20 shadow-2xl">
                        VS
                    </div>

                    {/* Long Wing */}
                    <div className="flex-1 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/30 transition-all duration-700" />

                        <div className="relative z-10 flex items-center justify-between mb-4">
                            <span className="text-sm font-black text-foreground dark:text-white uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary" /> Long
                            </span>
                        </div>

                        <div className="relative z-10 space-y-1 mb-4 border-b border-primary/20 pb-4">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Win Rate</p>
                            <p className="text-3xl font-black text-primary drop-shadow-[0_0_10px_rgba(11,102,228,0.3)]">
                                {longData.winRate.toFixed(1)}%
                            </p>
                        </div>

                        <div className="relative z-10 flex justify-between items-end">
                            <div>
                                <p className="text-[9px] text-muted-foreground uppercase font-bold">Trades</p>
                                <p className="text-sm font-black text-foreground dark:text-white">{longData.trades}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] text-muted-foreground uppercase font-bold">Net P&L</p>
                                <p className={cn("text-sm font-black", longData.pl >= 0 ? "text-primary" : "text-red-500")}>
                                    ${longData.pl.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Short Wing */}
                    <div className="flex-1 bg-gradient-to-bl from-orange-500/10 to-transparent border border-orange-500/20 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/20 blur-3xl rounded-full -ml-16 -mt-16 group-hover:bg-orange-500/30 transition-all duration-700" />

                        <div className="relative z-10 flex items-center justify-end mb-4">
                            <span className="text-sm font-black text-foreground dark:text-white uppercase tracking-widest flex items-center gap-2">
                                Short <TrendingDown className="w-4 h-4 text-orange-500" />
                            </span>
                        </div>

                        <div className="relative z-10 space-y-1 mb-4 border-b border-orange-500/20 pb-4 text-right">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Win Rate</p>
                            <p className="text-3xl font-black text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]">
                                {shortData.winRate.toFixed(1)}%
                            </p>
                        </div>

                        <div className="relative z-10 flex justify-between items-end">
                            <div>
                                <p className="text-[9px] text-muted-foreground uppercase font-bold">Net P&L</p>
                                <p className={cn("text-sm font-black", shortData.pl >= 0 ? "text-primary" : "text-red-500")}>
                                    ${shortData.pl.toFixed(2)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] text-muted-foreground uppercase font-bold">Trades</p>
                                <p className="text-sm font-black text-foreground dark:text-white">{shortData.trades}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Distribution Ratio Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                        <span>{longRatio.toFixed(0)}% Long Bias</span>
                        <span>{shortRatio.toFixed(0)}% Short Bias</span>
                    </div>
                    <div className="w-full h-2 bg-muted dark:bg-white/5 rounded-full flex overflow-hidden shadow-inner">
                        <div style={{ width: `${longRatio}%` }} className="h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_rgba(11,102,228,0.8)]" />
                        <div style={{ width: `${shortRatio}%` }} className="h-full bg-orange-500 transition-all duration-1000 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                    </div>
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
        <div className="glass-card-premium p-6 rounded-3xl border border-white/5 space-y-6 hover:-translate-y-2 transition-all duration-500 hover:border-primary/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(11,102,228,0.1)]">
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
        <div className="glass-card-premium p-6 rounded-3xl border border-white/5 space-y-6 hover:-translate-y-2 transition-all duration-500 hover:border-primary/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(11,102,228,0.1)]">
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
