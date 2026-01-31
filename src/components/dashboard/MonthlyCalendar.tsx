import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay, parseISO } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trade } from "@/types/trade-types";
import { ArrowRight } from "lucide-react";

interface DayData {
    date: string;
    profit: number;
}

interface MonthlyCalendarProps {
    data: DayData[];
    trades?: Trade[];
    className?: string;
    onViewAll?: (date: Date, trades: Trade[]) => void;
}

export function MonthlyCalendar({ data, trades = [], className, onViewAll }: MonthlyCalendarProps) {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate the number of empty slots before the first day of the month
    const startDay = getDay(monthStart); // 0 (Sun) to 6 (Sat)
    const emptyDays = Array.from({ length: startDay }, (_, i) => i);

    const profitByDate = useMemo(() => {
        const map: Record<string, number> = {};
        data.forEach(d => {
            map[d.date] = d.profit;
        });
        return map;
    }, [data]);

    const tradesByDate = useMemo(() => {
        const map: Record<string, Trade[]> = {};
        trades.forEach(t => {
            const dateStr = format(parseISO(t.close_time), "yyyy-MM-dd");
            if (!map[dateStr]) map[dateStr] = [];
            map[dateStr].push(t);
        });
        return map;
    }, [trades]);

    return (
        <div className={cn("glass-card-premium p-6 rounded-3xl relative overflow-hidden h-full flex flex-col", className)}>
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Monthly P/L</p>
                    <h3 className="text-xl font-bold text-foreground dark:text-white tracking-tight">{format(today, "MMMM yyyy")}</h3>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-7 gap-2">
                {/* Day Headers */}
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                    <div key={i} className="text-center text-[10px] font-black text-muted-foreground/60 dark:text-muted-foreground/40 pb-2">
                        {day}
                    </div>
                ))}

                {/* Empty Days at Start */}
                {emptyDays.map(i => (
                    <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Days of the Month */}
                {daysInMonth.map(day => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const profit = profitByDate[dateStr];
                    const dayTrades = tradesByDate[dateStr] || [];
                    const hasData = profit !== undefined || dayTrades.length > 0;
                    const isProfit = profit > 0;
                    const isLoss = profit < 0;

                    const cell = (
                        <div
                            className={cn(
                                "aspect-square rounded-lg flex flex-col items-center justify-center relative group/day transition-all duration-300",
                                isToday(day) ? "bg-primary/10 border border-primary/30" : "hover:bg-muted dark:hover:bg-white/5",
                                hasData && "cursor-pointer"
                            )}
                        >
                            <span className={cn(
                                "text-[10px] font-bold z-10",
                                isToday(day) ? "text-primary" : "text-muted-foreground"
                            )}>
                                {format(day, "d")}
                            </span>

                            {hasData && (
                                <div className={cn(
                                    "absolute bottom-1 w-1.5 h-1.5 rounded-full",
                                    isProfit ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" :
                                        isLoss ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" :
                                            "bg-slate-500"
                                )} />
                            )}
                        </div>
                    );

                    if (!hasData) return <div key={dateStr}>{cell}</div>;

                    const latestTrade = dayTrades[0];

                    return (
                        <Popover key={dateStr}>
                            <PopoverTrigger asChild>
                                {cell}
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-64 p-4 !bg-popover dark:!bg-[#121214] border-border dark:border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl z-[100]"
                                side="top"
                                align="center"
                                sideOffset={8}
                            >
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <h4 className="text-[13px] font-black text-foreground dark:text-white tracking-tight">
                                                Trades on {format(day, "MMM dd")}
                                            </h4>
                                            <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                                {dayTrades.length} {dayTrades.length === 1 ? 'trade' : 'trades'}
                                            </p>
                                        </div>
                                    </div>

                                    {latestTrade ? (
                                        <div className="flex items-center justify-between group/trade">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                                    <span className="text-[10px] font-black text-amber-500">G</span>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-xs font-black text-foreground dark:text-white tracking-tight uppercase">{latestTrade.symbol}</p>
                                                    <p className={cn(
                                                        "text-[8px] font-black uppercase tracking-widest",
                                                        latestTrade.type.includes("BUY") ? "text-blue-400" : "text-orange-400"
                                                    )}>
                                                        {latestTrade.type}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className={cn(
                                                "text-xs font-black tracking-tight",
                                                latestTrade.net_profit >= 0 ? "text-emerald-500" : "text-red-500"
                                            )}>
                                                {latestTrade.net_profit >= 0 ? "+" : ""}${Math.abs(latestTrade.net_profit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="py-2 text-center text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                            No detailed trades found
                                        </div>
                                    )}

                                    <button
                                        onClick={() => onViewAll?.(day, dayTrades)}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-white/10 hover:text-white hover:border-white/10 transition-all group"
                                    >
                                        View All Trades
                                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                    </button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-4 border-t border-border dark:border-white/5 pt-4">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Profit</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Loss</span>
                </div>
            </div>
        </div>
    );
}
