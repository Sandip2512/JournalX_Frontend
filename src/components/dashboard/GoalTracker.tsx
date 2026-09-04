import React from "react";
import { Target, Trophy, TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalInfo {
    current: number;
    target: number;
    label: string;
}

interface GoalTrackerProps {
    goals: GoalInfo[];
}

export function GoalTracker({ goals }: GoalTrackerProps) {
    if (!goals || goals.length === 0) return null;

    return (
        <div className="glass-card-premium p-6 rounded-2xl h-full animate-fade-up flex flex-col gap-6 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-500 hover:shadow-primary/5 cursor-default relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="flex justify-between items-center relative z-10">
                <h3 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 flex items-center gap-3 tracking-tight">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    Growth Targets
                </h3>
                <div className="px-3 py-1 bg-secondary/50 rounded-full border border-white/5 backdrop-blur-sm">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Live Data</span>
                </div>
            </div>

            <div className="space-y-8 relative z-10">
                {goals.map((goal, idx) => {
                    const percentage = goal.target > 0 ? Math.min(Math.max((goal.current / goal.target) * 100, 0), 100) : 0;
                    const isWeekly = goal.label.toLowerCase().includes('weekly');
                    const isMonthly = goal.label.toLowerCase().includes('monthly');

                    // Define Gradients & Icons
                    const config = isWeekly
                        ? {
                            gradient: "from-cyan-400 via-blue-500 to-indigo-600",
                            glow: "bg-cyan-500/20",
                            icon: Activity,
                            iconColor: "text-cyan-400"
                        }
                        : isMonthly
                            ? {
                                gradient: "from-violet-400 via-fuchsia-500 to-rose-500",
                                glow: "bg-fuchsia-500/20",
                                icon: Target,
                                iconColor: "text-fuchsia-400"
                            }
                            : {
                                gradient: "from-amber-400 via-orange-500 to-red-600",
                                glow: "bg-orange-500/20",
                                icon: TrendingUp,
                                iconColor: "text-amber-400"
                            };

                    const Icon = config.icon;

                    return (
                        <div key={idx} className="group space-y-3">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("p-1 rounded-md bg-secondary/30", config.iconColor)}>
                                            <Icon className="w-3 h-3" />
                                        </div>
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                                            {goal.label}
                                        </p>
                                    </div>
                                    <p className={cn(
                                        "text-lg font-black tabular-nums",
                                        goal.current >= 0 ? "text-emerald-500" : "text-red-500"
                                    )}>
                                        <span className="opacity-60 text-sm font-medium mr-0.5">$</span>
                                        {goal.current.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        <span className="text-muted-foreground/40 font-bold mx-2 text-xs">/</span>
                                        <span className="text-muted-foreground/50 text-xs font-bold">
                                            ${goal.target.toLocaleString()}
                                        </span>
                                    </p>
                                </div>
                                <div className="text-right space-y-0.5">
                                    <div className={cn("text-sm font-black tracking-tighter", config.iconColor)}>
                                        {percentage.toFixed(0)}%
                                    </div>
                                    {percentage < 100 ? (
                                        <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                                            ${(goal.target - goal.current).toLocaleString()} to target
                                        </p>
                                    ) : (
                                        <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest animate-pulse">
                                            Crushed it!
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="relative h-4 mt-2 group/progress perspective-1000">
                                {/* High-Contrast Track */}
                                <div className="absolute inset-0 bg-secondary/40 rounded-sm border border-white/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] overflow-hidden" />

                                {/* 3D Solid Prism Progress Bar */}
                                <div
                                    className={cn(
                                        "absolute inset-y-0 left-0 rounded-l-sm transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] border-r border-white/20 shadow-[0_4px_10px_rgba(0,0,0,0.4)]",
                                        isWeekly
                                            ? "bg-[#1e3a8a]" // Deep Blue (Solid)
                                            : isMonthly
                                                ? "bg-[#064e3b]" // Dark Emerald (Solid)
                                                : "bg-[#78350f]" // Saturated Amber (Solid)
                                    )}
                                    style={{
                                        width: `${percentage}%`,
                                    }}
                                >
                                    {/* 3D Convex Lighting Effects */}
                                    <div className="absolute top-0 left-0 right-0 h-[40%] bg-white/10 rounded-t-sm blur-[0.5px]" />
                                    <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-black/20 rounded-b-sm blur-[0.5px]" />

                                    {/* Traveling Sheen Animation (on hover) */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity duration-300 animate-[shimmer_2s_infinite]" style={{ backgroundSize: '100% 100%' }} />

                                    {/* Value Badge at the Tip (Dynamic Position) */}
                                    <div
                                        className="absolute right-[-10px] top-[-26px] bg-foreground text-background text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-lg pointer-events-none whitespace-nowrap opacity-0 group-hover/progress:opacity-100 transition-opacity duration-300"
                                        style={{ transform: 'translateX(50%)' }}
                                    >
                                        {percentage.toFixed(0)}%
                                        <div className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-foreground" />
                                    </div>

                                    {/* Tip Sparkle */}
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-full bg-white/20 blur-[1px]" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {goals.every(g => (g.current / g.target) >= 1) && (
                <div className="mt-2 py-2 px-4 bg-emerald-500/10 rounded-xl text-center border border-emerald-500/20 animate-bounce shadow-lg shadow-emerald-500/5 relative z-10">
                    <span className="text-xs text-emerald-500 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                        <Trophy className="w-3 h-3" /> All Goals Achieved
                    </span>
                </div>
            )}
        </div>
    );
}

