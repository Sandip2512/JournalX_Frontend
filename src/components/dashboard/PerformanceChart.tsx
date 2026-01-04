import React from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PerformanceChartProps {
    data: { date: string; value: number }[];
    totalProfit: number;
}

export function PerformanceChart({ data, totalProfit }: PerformanceChartProps) {
    const isPositive = totalProfit >= 0;

    // Generate fallback data if empty to prevent empty chart uglyness
    const chartData = data && data.length > 0 ? data : [
        { date: "M", value: 0 },
        { date: "T", value: 120 },
        { date: "W", value: 50 },
        { date: "T", value: 240 },
        { date: "F", value: 180 },
        { date: "S", value: 310 },
        { date: "S", value: totalProfit || 420 },
    ];

    return (
        <div className="glass-card-premium p-6 rounded-xl relative overflow-hidden h-full min-h-[160px] animate-fade-up transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5" style={{ animationDelay: "0.1s" }}>
            {/* Ambient Glow */}
            <div className={cn(
                "absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[100px] opacity-20 transition-colors duration-500 pointer-events-none",
                isPositive ? "bg-emerald-500" : "bg-red-500"
            )} />
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        Net Profit (7d)
                    </p>
                    <div className="flex items-baseline gap-2">
                        <h3 className={cn(
                            "text-3xl font-bold tracking-tight",
                            isPositive ? "text-emerald-500" : "text-red-500"
                        )}>
                            ${Math.abs(totalProfit).toFixed(2)}
                        </h3>
                        <div className={cn(
                            "flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full",
                            isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                        )}>
                            {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                            {isPositive ? "+12.5%" : "-2.1%"}
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-[100px] z-0 opacity-50">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} onMouseMove={(e) => {
                        if (e.activePayload) {
                            // You could use this to update a state for a large number display if desired
                        }
                    }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="glass-card-premium px-3 py-2 rounded-lg text-xs font-medium border border-white/10 shadow-xl backdrop-blur-md">
                                            <p className="text-muted-foreground mb-1">{payload[0].payload.date}</p>
                                            <p className={cn(
                                                "text-sm font-bold",
                                                (payload[0].value as number) >= 0 ? "text-emerald-500" : "text-red-500"
                                            )}>
                                                ${Math.abs(payload[0].value as number).toFixed(2)}
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
                            stroke={isPositive ? "#10b981" : "#ef4444"}
                            strokeWidth={2}
                            fill="url(#colorValue)"
                            activeDot={{ r: 4, strokeWidth: 0, fill: isPositive ? "#10b981" : "#ef4444" }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
