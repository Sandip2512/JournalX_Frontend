import React from "react";
import { cn } from "@/lib/utils";

interface QuickStatsProps {
    stats: any;
    className?: string;
}

export function QuickStats({ stats, className }: QuickStatsProps) {
    const items = [
        { label: "Avg Winner", value: `$${(stats?.avg_win || 0).toFixed(2)}`, color: "text-primary" },
        { label: "Avg Loser", value: `-$${(Math.abs(stats?.avg_loss || 0)).toFixed(2)}`, color: "text-red-500" },
        { label: "Best Trade", value: `$${(stats?.max_win || 0).toFixed(2)}`, color: "text-primary" },
        { label: "Worst Trade", value: `$${(stats?.max_loss || 0).toFixed(2)}`, color: "text-red-500" },
        { label: "Profit Factor", value: `${stats?.profit_factor || "0.00"}`, color: "text-foreground dark:text-white" },
        { label: "Total Trades", value: `${stats?.total_trades || 0}`, color: "text-foreground dark:text-white" },
        { label: "Win Rate", value: `${(stats?.win_rate || 0).toFixed(1)}%`, color: "text-primary" },
        { label: "Net P/L", value: `$${(stats?.net_profit || 0).toFixed(2)}`, color: "text-foreground dark:text-white" },
    ];

    return (
        <div className={cn("glass-card-premium p-6 rounded-3xl border border-white/5", className)}>
            <div className="flex items-center gap-2 mb-6">
                <div className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                    <div className="w-2 h-2 grid grid-cols-2 gap-0.5">
                        <div className="bg-white/40 rounded-full" />
                        <div className="bg-white/40 rounded-full" />
                        <div className="bg-white/40 rounded-full" />
                        <div className="bg-white/40 rounded-full" />
                    </div>
                </div>
                <h3 className="text-xs font-bold text-foreground dark:text-white uppercase tracking-wider">Quick Stats</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {items.map((item, i) => (
                    <div key={i} className="p-3 rounded-xl bg-muted dark:bg-white/5 border border-border dark:border-white/5 space-y-1 hover:-translate-y-1 hover:bg-muted/80 dark:hover:bg-white/10 transition-all duration-300 cursor-default">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.label}</p>
                        <p className={cn("text-sm font-black", item.color)}>{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
