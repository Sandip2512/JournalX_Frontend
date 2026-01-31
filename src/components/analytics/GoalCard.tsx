import React from "react";
import { cn } from "@/lib/utils";
import { GoalProgressRadial } from "./GoalProgressRadial";
import { Target, TrendingUp, Trophy, Calendar, Pencil } from "lucide-react";

interface GoalCardProps {
    type: "weekly" | "monthly" | "yearly";
    target: number;
    current: number;
    onEdit?: () => void;
    className?: string;
}

export function GoalCard({ type, target, current, onEdit, className }: GoalCardProps) {
    const progress = target > 0 ? (current / target) * 100 : 0;
    const remaining = Math.max(0, target - current);

    const config = {
        weekly: { label: "Weekly Goal", icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
        monthly: { label: "Monthly Goal", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        yearly: { label: "Yearly Milestone", icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" }
    }[type];

    const Icon = config.icon;

    return (
        <div className={cn("glass-card-premium p-6 rounded-3xl border border-border dark:border-white/5 space-y-6 relative overflow-hidden group", className)}>
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl border border-border dark:border-white/5", config.bg, config.color)}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground dark:text-white uppercase tracking-wider">{config.label}</h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-50">Profit Target</p>
                    </div>
                </div>
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="p-2 rounded-lg bg-muted dark:bg-white/5 text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-muted/80 dark:hover:bg-white/10 transition-all"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            <div className="flex items-center justify-between gap-4 relative z-10">
                <div className="space-y-4 flex-1">
                    <div className="space-y-1">
                        <p className="text-2xl font-black text-foreground dark:text-white">${target.toLocaleString()}</p>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Current: ${current.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="p-3 bg-muted dark:bg-white/5 rounded-2xl border border-border dark:border-white/5">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Remaining</p>
                        <p className="text-sm font-black text-foreground dark:text-white">${remaining.toLocaleString()}</p>
                    </div>
                </div>

                <GoalProgressRadial
                    progress={progress}
                    color={config.color}
                    label="Achieved"
                />
            </div>

            {/* Decorative background pulse */}
            <div className={cn("absolute -right-10 -bottom-10 w-32 h-32 blur-[60px] rounded-full opacity-20", config.bg)} />
        </div>
    );
}
