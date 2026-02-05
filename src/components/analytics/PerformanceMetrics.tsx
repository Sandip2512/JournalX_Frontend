import React from "react";
import { TrendingUp, Activity, BarChart3, Target } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";

interface PerformanceMetricsProps {
    stats: any;
}

export function PerformanceMetrics({ stats }: PerformanceMetricsProps) {
    const realizedPL = stats?.net_profit || 0;
    const winRate = stats?.win_rate || 0;
    const profitFactor = stats?.profit_factor || 0;
    const isFree = stats?.is_free_tier;

    // expectancy from stats or calc
    const expectancy = stats?.expectancy || (realizedPL / (stats?.total_trades || 1));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                label={isFree ? "30-Day P/L" : "Total P/L"}
                value={`$${Math.abs(realizedPL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                subtitle={isFree ? "Last 30 days" : `From ${stats?.total_trades || 0} closed trades`}
                icon={TrendingUp}
                glowColor="primary"
                valueClassName={realizedPL >= 0 ? "text-primary" : "text-red-500"}
            />
            <StatCard
                label="Win Rate"
                value={`${winRate.toFixed(1)}%`}
                subtitle={`${stats?.winning_trades || 0} wins • ${stats?.losing_trades || 0} losses`}
                icon={Activity}
                glowColor="emerald"
                valueClassName="text-emerald-500"
            >
                <div className="h-1 w-full bg-white/5 rounded-full mt-4 overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 transition-all duration-1000"
                        style={{ width: `${winRate}%` }}
                    />
                </div>
            </StatCard>
            <StatCard
                label="Profit Factor"
                value={profitFactor === Infinity ? "Infinity" : profitFactor.toFixed(2)}
                subtitle={profitFactor > 1.5 ? "Excellent" : "Good"}
                icon={BarChart3}
                glowColor="amber"
                valueClassName="text-amber-500"
            />
            <StatCard
                label="Expectancy"
                value={`$${Math.abs(expectancy).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                subtitle="Average per trade"
                icon={Target}
                glowColor="primary"
                valueClassName="text-primary"
            />
        </div>
    );
}
