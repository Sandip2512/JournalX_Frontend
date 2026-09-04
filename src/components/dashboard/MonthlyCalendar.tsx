import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, startOfWeek, endOfWeek, addMonths, subMonths, parseISO, getDay } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trade } from "@/types/trade-types";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface DayData {
    date: string;
    profit: number;
}

interface MonthlyCalendarProps {
    currentDate?: Date;
    onMonthChange?: (date: Date) => void;
    data: DayData[];
    trades?: Trade[];
    className?: string;
    onViewAll?: (date: Date, trades: Trade[]) => void;
}

// Helper to format currency concisely e.g. $1.7k, -$150
function formatCompactCurr(value: number): string {
    const absVal = Math.abs(value);
    const prefix = value < 0 ? "-" : "+";
    if (absVal >= 1000) {
        return `${prefix}$${(absVal / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    }
    return `${prefix}$${absVal.toFixed(0)}`;
}

export function MonthlyCalendar({ currentDate: controlledDate, onMonthChange, data, trades = [], className, onViewAll }: MonthlyCalendarProps) {
    const today = new Date();
    const activeDate = controlledDate || today;
    const monthStart = startOfMonth(activeDate);
    const monthEnd = endOfMonth(activeDate);

    // To generate the calendar grid properly, we need to get the weeks that cover the month
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 0 = Sunday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // Group days into weeks (arrays of 7 days)
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    calendarDays.forEach((day, i) => {
        currentWeek.push(day);
        if ((i + 1) % 7 === 0) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

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
        <div className={cn("glass-card-premium p-4 pb-3 rounded-[1.5rem] relative overflow-hidden h-full flex flex-col", className)}>
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-4">
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none mb-1">Monthly P/L</p>
                        <h3 className="text-xl font-bold text-foreground dark:text-white tracking-tight leading-none">{format(activeDate, "MMMM yyyy")}</h3>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onMonthChange?.(subMonths(activeDate, 1))}
                        className="p-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors text-muted-foreground hover:text-white"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onMonthChange?.(addMonths(activeDate, 1))}
                        className="p-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors text-muted-foreground hover:text-white"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                {/* Headers: 7 days + 1 Weekly column */}
                <div className="grid grid-cols-8 gap-1 mb-1 shrink-0 px-1">
                    {["S", "M", "T", "W", "T", "F", "S", "Weekly"].map((day, i) => (
                        <div key={i} className={cn(
                            "text-center text-[9px] font-black uppercase tracking-widest",
                            i === 7 ? "text-muted-foreground/40" : "text-muted-foreground/60 dark:text-muted-foreground/40"
                        )}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Body */}
                <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                    {weeks.map((week, weekIdx) => {
                        // Calculate weekly profit and active trading days
                        let weeklyProfit = 0;
                        let activeDays = 0;

                        week.forEach(day => {
                            // Only include days that belong to the current month in the weekly total
                            if (isSameMonth(day, monthStart)) {
                                const dateStr = format(day, "yyyy-MM-dd");
                                const p = profitByDate[dateStr];
                                if (p !== undefined) {
                                    weeklyProfit += p;
                                    activeDays += 1;
                                }
                            }
                        });

                        return (
                            <div key={weekIdx} className="flex-1 grid grid-cols-8 gap-2 min-h-0">
                                {/* 7 Daily Cells */}
                                {week.map((day, dayIdx) => {
                                    const dateStr = format(day, "yyyy-MM-dd");
                                    const isCurrentMonth = isSameMonth(day, monthStart);

                                    // If day is outside current month, render empty placeholder
                                    if (!isCurrentMonth) {
                                        return <div key={dateStr} className="rounded-xl bg-transparent" />;
                                    }

                                    const profit = profitByDate[dateStr];
                                    const dayTrades = tradesByDate[dateStr] || [];
                                    const hasData = profit !== undefined || dayTrades.length > 0;
                                    const isProfit = profit > 0;
                                    const isLoss = profit < 0;

                                    const cell = (
                                        <div
                                            className={cn(
                                                "h-full rounded-xl relative group/day transition-all duration-300 border overflow-hidden p-1",
                                                isProfit ? "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25" :
                                                    isLoss ? "bg-red-500/10 border-red-500/20 hover:bg-red-500/20 dark:bg-red-500/15 dark:hover:bg-red-500/25" :
                                                        isToday(day) ? "bg-primary/5 border-primary/20" : "bg-muted/10 border-white/5 hover:bg-muted dark:hover:bg-white/5",
                                                hasData && !isProfit && !isLoss ? "cursor-pointer border-white/10 hover:border-white/20" : hasData ? "cursor-pointer" : ""
                                            )}
                                        >
                                            <span className={cn(
                                                "absolute top-1 left-1.5 text-[10px] font-bold z-10 transition-colors leading-none",
                                                isProfit ? "text-emerald-700 dark:text-emerald-100/70" :
                                                    isLoss ? "text-red-700 dark:text-red-100/70" :
                                                        isToday(day) ? "text-primary" : "text-muted-foreground/60"
                                            )}>
                                                {format(day, "d")}
                                            </span>

                                            {hasData && profit !== undefined && (
                                                <span className={cn(
                                                    "absolute bottom-0.5 left-0 w-full px-0.5 text-center text-[11px] lg:text-[12px] font-black tracking-tight drop-shadow-sm truncate transition-colors z-0",
                                                    isProfit ? "text-emerald-600 dark:text-emerald-400" :
                                                        isLoss ? "text-red-600 dark:text-red-400" :
                                                            "text-muted-foreground"
                                                )}>
                                                    {formatCompactCurr(profit)}
                                                </span>
                                            )}
                                        </div>
                                    );

                                    if (!hasData) return <div key={dateStr} className="h-full">{cell}</div>;

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

                                                    <div className="space-y-2">
                                                        {dayTrades.slice(0, 3).map((t, idx) => (
                                                            <div key={idx} className="flex items-center justify-between group/trade">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="space-y-0.5">
                                                                        <p className="text-[10px] font-black text-foreground dark:text-white tracking-tight uppercase">{t.symbol}</p>
                                                                    </div>
                                                                </div>
                                                                <p className={cn(
                                                                    "text-[10px] font-black tracking-tight",
                                                                    t.net_profit >= 0 ? "text-emerald-500" : "text-red-500"
                                                                )}>
                                                                    {t.net_profit >= 0 ? "+" : ""}${Math.abs(t.net_profit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>

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

                                {/* Weekly Summary Cell (8th Column) */}
                                <div className="h-full rounded-xl bg-muted/20 dark:bg-white/[0.02] border border-white/5 relative opacity-80 overflow-hidden group/weekly hover:opacity-100 transition-all hover:bg-muted/40 p-1">
                                    <span className="absolute top-1 left-1.5 text-[7px] leading-none font-black text-muted-foreground/40 uppercase tracking-widest hidden xl:block shrink-0">
                                        WEEKLY
                                    </span>
                                    <span className="absolute top-1 left-1.5 text-[8px] leading-none font-bold text-muted-foreground/40 xl:hidden shrink-0">
                                        W
                                    </span>

                                    <span className={cn(
                                        "absolute bottom-0.5 left-0 w-full px-0.5 text-center text-[11px] lg:text-[12px] font-black tracking-tight drop-shadow-sm truncate transition-colors z-0",
                                        weeklyProfit > 0 ? "text-primary" :
                                            weeklyProfit < 0 ? "text-red-500" :
                                                "text-muted-foreground"
                                    )}>
                                        {formatCompactCurr(weeklyProfit)}
                                    </span>

                                    <span className="absolute top-1 right-1.5 text-[7px] lg:text-[8px] leading-none font-bold text-muted-foreground/30 whitespace-nowrap hidden lg:block shrink-0">
                                        {activeDays} trd
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 shrink-0 flex items-center justify-center gap-4 border-t border-border dark:border-white/5 pt-3">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Profit</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Loss</span>
                </div>
            </div>
        </div>
    );
}
