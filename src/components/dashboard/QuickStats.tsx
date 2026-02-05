import React from "react";
import { cn } from "@/lib/utils";

interface QuickStatsProps {
    stats: {
        avgWin: number;
        avgLoss: number;
        bestTrade: number;
        worstTrade: number;
        profitFactor: string | number;
    };
    className?: string;
}

export function QuickStats({ stats, className }: QuickStatsProps) {
    const statItems = [
        { label: "Avg Win", value: `$${stats.avgWin.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: "emerald" },
        { label: "Avg Loss", value: `$${Math.abs(stats.avgLoss).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: "red" },
        { label: "Best Trade", value: `$${stats.bestTrade.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: "emerald" },
        { label: "Worst Trade", value: `$${Math.abs(stats.worstTrade).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: "red" },
        { label: "Profit Factor", value: stats.profitFactor, color: "primary" },
    ];

    return (
        <div className={cn("glass-card-premium p-5 rounded-3xl relative overflow-hidden flex flex-col", className)}>
            <div className="flex items-center justify-between mb-4">
                <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Quick Stats</p>
                    <h3 className="text-lg font-bold text-foreground dark:text-white tracking-tight">Key Metrics</h3>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {statItems.map((item, index) => (
                    <div key={item.label} className={cn(
                        "p-3 rounded-2xl bg-muted dark:bg-white/5 border border-border dark:border-white/5 space-y-1.5 group/stat",
                        index === 4 && "col-span-2"
                    )}>
                        <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] group-hover/stat:text-foreground dark:group-hover/stat:text-white transition-colors">
                            {item.label}
                        </p>
                        <p className={cn(
                            "text-base font-black tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]",
                            item.color === "emerald" && "text-emerald-500",
                            item.color === "red" && "text-red-500",
                            item.color === "primary" && "text-primary"
                        )}>
                            {item.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
