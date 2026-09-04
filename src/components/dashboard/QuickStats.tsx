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
        <div className={cn("glass-card-premium p-5 rounded-[1.5rem] relative overflow-hidden flex flex-col shrink-0", className)}>
            <h3 className="text-sm font-bold text-foreground dark:text-white tracking-tight mb-4">Quick Stats</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full text-left">
                {statItems.slice(0, 4).map((item) => (
                    <div key={item.label} className="space-y-1">
                        <p className="text-[9px] font-bold text-muted-foreground/50 transition-colors">
                            {item.label}
                        </p>
                        <p className={cn(
                            "text-base font-black tracking-tighter drop-shadow-sm",
                            item.color === "emerald" && "text-blue-500", // Changing emerald to blue to visually perfectly match TradeFXBook
                            item.color === "red" && "text-white text-opacity-90"
                        )}>
                            {item.color === "emerald" && parseFloat(item.value.replace(/[^0-9.-]+/g, "")) > 0 ? "+" : ""}{item.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
