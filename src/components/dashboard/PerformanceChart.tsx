import React from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine, ReferenceDot } from "recharts";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

import { useTheme } from "@/context/ThemeContext";

interface PerformanceChartProps {
    analyticsData: {
        starting_balance: number;
        total_pl: number;
        weekly_profit: number;
        monthly_profit: number;
        three_month_profit: number;
        six_month_profit: number;
        yearly_profit: number;
        equity_curve: { time: string; equity: number }[];
    } | null;
}

export function PerformanceChart({ analyticsData, className }: PerformanceChartProps & { className?: string }) {
    const [period, setPeriod] = React.useState<string>("1M");
    const { theme } = useTheme();

    // Determine if it's dark mode (including system preference)
    const isDark = React.useMemo(() => {
        if (theme === "dark") return true;
        if (theme === "system") {
            return window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
        return false;
    }, [theme]);

    // Filter data based on period
    const getFilteredData = () => {
        if (!analyticsData || !analyticsData.equity_curve) return [];

        const now = new Date();
        let startDate: Date | null = new Date();

        switch (period) {
            case "1D": startDate.setHours(now.getHours() - 24); break;
            case "1W": startDate.setDate(now.getDate() - 7); break;
            case "1M": startDate.setMonth(now.getMonth() - 1); break;
            case "3M": startDate.setMonth(now.getMonth() - 3); break;
            case "ALL": startDate = null; break;
            default: startDate.setMonth(now.getMonth() - 1);
        }

        const filtered = startDate
            ? analyticsData.equity_curve.filter(p => new Date(p.time) >= startDate!)
            : analyticsData.equity_curve;

        const result = filtered.map(p => ({
            date: new Date(p.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            value: p.equity,
            time: new Date(p.time).getTime()
        }));

        // Add the baseline point (equity just before the period started)
        if (startDate && analyticsData.equity_curve.length > 0) {
            const beforePoints = analyticsData.equity_curve.filter(p => new Date(p.time) < startDate!);
            if (beforePoints.length > 0) {
                const lastBefore = beforePoints[beforePoints.length - 1];
                result.unshift({
                    date: new Date(lastBefore.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    value: lastBefore.equity,
                    time: new Date(lastBefore.time).getTime()
                });
            } else {
                // If no data before, add a 0 point at the start date if we're showing ALL or if it's the very first trade
                result.unshift({
                    date: startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    value: 0,
                    time: startDate.getTime()
                });
            }
        } else if (!startDate && analyticsData.equity_curve.length > 0) {
            // For "ALL", add a 0 point before the first trade
            const firstTrade = analyticsData.equity_curve[0];
            const startTime = new Date(new Date(firstTrade.time).getTime() - 86400000); // 1 day before
            result.unshift({
                date: startTime.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                value: 0,
                time: startTime.getTime()
            });
        }

        return result;
    };

    const chartData = getFilteredData();
    const hasData = chartData.length >= 2;

    const displayProfit = React.useMemo(() => {
        if (!hasData) return 0;
        const first = chartData[0].value;
        const last = chartData[chartData.length - 1].value;
        return last - first;
    }, [chartData, hasData]);

    // Calculate base equity (equity before this period started)
    const baseEquity = React.useMemo(() => {
        if (!analyticsData || !analyticsData.equity_curve || analyticsData.equity_curve.length === 0) return 0;

        const now = new Date();
        let startDate: Date | null = new Date();
        switch (period) {
            case "7D": startDate.setDate(now.getDate() - 7); break;
            case "1M": startDate.setMonth(now.getMonth() - 1); break;
            case "3M": startDate.setMonth(now.getMonth() - 3); break;
            case "6M": startDate.setMonth(now.getMonth() - 6); break;
            case "1Y": startDate.setFullYear(now.getFullYear() - 1); break;
            case "ALL": startDate = null; break;
            default: startDate.setFullYear(now.getFullYear() - 1);
        }

        if (!startDate) return 0;

        // Find the last point BEFORE startDate
        const beforePoints = analyticsData.equity_curve.filter(p => new Date(p.time) < startDate!);
        if (beforePoints.length === 0) return 0;
        return beforePoints[beforePoints.length - 1].equity;
    }, [analyticsData, period]);

    // Calculate live percentage change (ROI)
    let percentage = 0;
    if (analyticsData) {
        const capitalAtStart = (analyticsData.starting_balance || 10000) + baseEquity;
        if (capitalAtStart > 0) {
            percentage = (displayProfit / capitalAtStart) * 100;
        } else if (displayProfit > 0) {
            // If capital is somehow 0 or less, we can't show a proper %, 
            // but we can fallback to a visual indicator
            percentage = 100;
        }
    }

    const isPositive = displayProfit >= 0;

    // Gradient offset calculation for multi-color line (Green/Red)
    const getGradientOffset = () => {
        if (!hasData) return 0;
        const values = chartData.map(v => v.value);
        const max = Math.max(...values);
        const min = Math.min(...values);
        const baseline = chartData[0].value;

        if (max <= min) return 0;
        if (baseline >= max) return 0;
        if (baseline <= min) return 1;

        return (max - baseline) / (max - min);
    };

    const off = getGradientOffset();

    return (
        <div className={cn(
            "glass-card-premium card-glow-blue p-6 rounded-2xl relative overflow-hidden h-full min-h-[350px] animate-fade-up transition-all duration-300",
            className
        )} style={{ animationDelay: "0.1s" }}>
            {/* Ambient Glow */}
            <div className={cn(
                "absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[100px] opacity-20 transition-colors duration-500 pointer-events-none",
                isPositive ? "bg-emerald-500" : "bg-primary"
            )} />
            {/* Header Content */}
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                        Performance
                    </p>
                    <div className="flex items-center gap-3">
                        <h3 className={cn(
                            "text-4xl font-extrabold tracking-tight",
                            isPositive ? "text-emerald-500" : "text-red-500"
                        )}>
                            {isPositive ? "+" : "-"}${Math.abs(displayProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                        {hasData && (
                            <div className={cn(
                                "flex items-center text-[10px] font-black px-2 py-1 rounded-lg",
                                isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                            )}>
                                {percentage >= 0 ? "+" : ""}{percentage.toFixed(1)}%
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                    {["1D", "1W", "1M", "3M", "ALL"].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={cn(
                                "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200",
                                period === p
                                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart Area */}
            <div className="absolute inset-x-4 bottom-4 top-28 z-0">
                {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 40, left: 0, bottom: 0 }}>
                            <defs>
                                <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                                <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset={off} stopColor="#3b82f6" stopOpacity={0.15} />
                                    <stop offset={off} stopColor="#ef4444" stopOpacity={0.15} />
                                </linearGradient>
                                <linearGradient id="splitStroke" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset={off} stopColor="#3b82f6" stopOpacity={1} />
                                    <stop offset={off} stopColor="#ef4444" stopOpacity={1} />
                                </linearGradient>
                            </defs>
                            {!isDark && <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="rgba(255,255,255,0.05)" />}
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                dy={10}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                orientation="right"
                                axisLine={false}
                                tickLine={false}
                                tick={({ x, y, payload }) => (
                                    <text
                                        x={x}
                                        y={y}
                                        fontSize={10}
                                        textAnchor="start"
                                        fill={payload.value >= chartData[0].value ? '#10b981' : '#ef4444'}
                                        dx={10}
                                    >
                                        ${payload.value.toLocaleString()}
                                    </text>
                                )}
                                width={50}
                                domain={['auto', 'auto']}
                            />
                            <ReferenceLine y={chartData[0].value} stroke="#94a3b8" strokeDasharray="3 3" strokeOpacity={0.2} />
                            <ReferenceDot
                                x={chartData[chartData.length - 1].date}
                                y={chartData[chartData.length - 1].value}
                                r={4}
                                fill={chartData[chartData.length - 1].value >= chartData[0].value ? "#10b981" : "#ef4444"}
                                stroke="none"
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const value = payload[0].value as number;
                                        const baseline = chartData[0].value;
                                        const isPointPositive = value >= baseline;
                                        return (
                                            <div className="glass-card-premium px-3 py-2 rounded-lg text-xs font-medium border border-white/10 shadow-xl backdrop-blur-md">
                                                <p className="text-muted-foreground mb-1">{payload[0].payload.date}</p>
                                                <p className={cn(
                                                    "text-sm font-bold",
                                                    isPointPositive ? "text-emerald-500" : "text-red-500"
                                                )}>
                                                    ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="url(#splitStroke)"
                                strokeWidth={4}
                                fill="url(#splitColor)"
                                filter="url(#lineGlow)"
                                activeDot={({ cx, cy, payload }) => (
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={6}
                                        fill={payload.value >= chartData[0].value ? "#3b82f6" : "#ef4444"}
                                        stroke="#fff"
                                        strokeWidth={2}
                                        className="animate-pulse"
                                    />
                                )}
                                animationDuration={1000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm font-medium border-2 border-dashed border-white/5 rounded-2xl">
                        No Data available for the selected period
                    </div>
                )}
            </div>
        </div>
    );
}
