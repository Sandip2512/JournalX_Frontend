import React from "react";
import { cn } from "@/lib/utils";

export function WinLossDistribution({ stats }: { stats: any }) {
    const profit = stats?.total_profit || 0;
    const loss = Math.abs(stats?.total_loss || 0);
    const total = profit + loss || 1;
    const profitWidth = (profit / total) * 100;
    const lossWidth = (loss / total) * 100;

    return (
        <div className="glass-card-premium p-6 rounded-3xl border border-white/5 space-y-6 hover:-translate-y-2 transition-all duration-500 hover:border-primary/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(11,102,228,0.1)]">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <h3 className="text-xs font-bold text-foreground dark:text-white uppercase tracking-wider">Win/Loss Distribution</h3>
            </div>

            <div className="space-y-6">
                <div className="h-12 w-full flex rounded-xl overflow-hidden shadow-inner">
                    <div
                        className="h-full bg-primary flex items-center justify-center text-[10px] font-black text-white relative group"
                        style={{ width: `${profitWidth}%` }}
                    >
                        {profitWidth > 20 && "1W"}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div
                        className="h-full bg-red-500 flex items-center justify-center text-[10px] font-black text-white relative group"
                        style={{ width: `${lossWidth}%` }}
                    >
                        {lossWidth > 20 && "0L"}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>

                <div className="space-y-3 px-1">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Gross Profit</span>
                        </div>
                        <span className="text-xs font-black text-primary">${profit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Gross Loss</span>
                        </div>
                        <span className="text-xs font-black text-red-500">-${loss.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-border dark:border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Net Result</span>
                        </div>
                        <span className="text-xs font-black text-primary">${(profit - loss).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
