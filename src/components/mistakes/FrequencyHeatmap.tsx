import { FrequencyData } from "@/types/mistake-types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface FrequencyHeatmapProps {
    data: FrequencyData[];
}

export function FrequencyHeatmap({ data }: FrequencyHeatmapProps) {
    // Get max count for color intensity calculation
    const maxCount = Math.max(...data.map(d => d.count), 1);

    // Get color intensity based on count - Updated to Blue shades with Light Mode support
    const getColorIntensity = (count: number) => {
        if (count === 0) return "bg-slate-100 border border-slate-200 dark:bg-[#1e293b]/50 dark:border-white/5"; // Empty state
        const intensity = Math.min((count / maxCount) * 100, 100);

        if (intensity > 75) return "bg-blue-600 dark:bg-blue-500 border border-blue-500/50";
        if (intensity > 50) return "bg-blue-500 dark:bg-blue-600 border border-blue-500/50";
        if (intensity > 25) return "bg-blue-400 dark:bg-blue-700 border border-blue-400/50";
        return "bg-blue-300 dark:bg-blue-800/80 border border-blue-300/50";
    };

    // Group data by weeks (7 days per week, 5 weeks)
    const weeks: FrequencyData[][] = [];
    for (let i = 0; i < 5; i++) {
        weeks.push(data.slice(i * 7, (i + 1) * 7));
    }

    const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

    return (
        <TooltipProvider>
            <div className="space-y-6">
                <div className="flex flex-col items-center gap-6">
                    <h3 className="text-xl font-bold text-foreground tracking-wide">
                        Frequency Heatmap
                    </h3>

                    {/* Pill-shaped Legend - Adaptive Light/Dark */}
                    <div className="flex items-center gap-4 bg-card/50 dark:bg-[#0f172a] px-5 py-2.5 rounded-full border border-border/50 shadow-inner">
                        <span className="text-xs text-muted-foreground font-medium">Less</span>
                        <div className="flex gap-2">
                            <div className="w-3.5 h-3.5 rounded-full bg-slate-100 dark:bg-muted/30 border border-slate-200 dark:border-border/50" />
                            <div className="w-3.5 h-3.5 rounded-full bg-blue-500/30 dark:bg-blue-800/80 border border-blue-500/50" />
                            <div className="w-3.5 h-3.5 rounded-full bg-blue-500/50 dark:bg-blue-700 border border-blue-500/50" />
                            <div className="w-3.5 h-3.5 rounded-full bg-blue-600 dark:bg-blue-600 border border-blue-600/50" />
                            <div className="w-3.5 h-3.5 rounded-full bg-blue-700 dark:bg-blue-500 border border-blue-700/50" />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">More</span>
                    </div>
                </div>

                <div className="flex flex-col items-center mt-2">
                    {/* Day labels */}
                    <div className="grid grid-cols-7 gap-3 mb-3 w-full max-w-[320px]">
                        {dayLabels.map((day, i) => (
                            <div key={i} className="flex justify-center">
                                <span className="text-xs font-bold text-muted-foreground">{day}</span>
                            </div>
                        ))}
                    </div>

                    {/* Heatmap grid */}
                    <div className="flex flex-col gap-3 w-full max-w-[320px]">
                        {weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="grid grid-cols-7 gap-3">
                                {week.map((day, dayIndex) => {
                                    const date = new Date(day.date);
                                    const formattedDate = date.toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                    });

                                    return (
                                        <Tooltip key={dayIndex}>
                                            <TooltipTrigger asChild>
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: (weekIndex * 7 + dayIndex) * 0.01 }}
                                                    className="aspect-square flex items-center justify-center"
                                                >
                                                    <div
                                                        className={cn(
                                                            "w-8 h-8 rounded-full transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-blue-500/20",
                                                            "hover:scale-110",
                                                            getColorIntensity(day.count)
                                                        )}
                                                    />
                                                </motion.div>
                                            </TooltipTrigger>
                                            <TooltipContent
                                                side="top"
                                                className="glass-card-premium px-3 py-2 rounded-lg shadow-xl border border-white/10"
                                            >
                                                <div className="text-center">
                                                    <p className="text-xs font-bold text-foreground mb-0.5">{formattedDate}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {day.count} {day.count === 1 ? 'mistake' : 'mistakes'}
                                                    </p>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
