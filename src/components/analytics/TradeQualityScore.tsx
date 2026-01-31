import React from "react";
import { cn } from "@/lib/utils";
import { Info, CheckCircle2 } from "lucide-react";

interface TradeQualityScoreProps {
    trade: any;
    className?: string;
}

export function TradeQualityScore({ trade, className }: TradeQualityScoreProps) {
    const calculateScore = () => {
        let score = 0;

        // Profitability (30 pts)
        const profit = trade.net_profit || 0;
        if (profit > 0) score += 30;
        else if (profit === 0) score += 15;

        // Execution (40 pts)
        if (trade.followed_plan) score += 10;
        if (trade.proper_risk) score += 10;
        if (trade.good_entry) score += 10;
        if (trade.patient_exit) score += 10;

        // Journal (20 pts)
        if (trade.pre_analysis) score += 5;
        if (trade.post_review) score += 5;
        if (trade.emotion) score += 5;
        if (trade.reason || trade.mistake) score += 5;

        // Rating (10 pts)
        score += (trade.rating || 0);

        return Math.min(score, 100);
    };

    const totalScore = calculateScore();

    const getStatus = (score: number) => {
        if (score >= 80) return { label: "Excellent", color: "text-emerald-500", bg: "bg-emerald-500/10" };
        if (score >= 60) return { label: "Good", color: "text-primary", bg: "bg-primary/10" };
        if (score >= 40) return { label: "Average", color: "text-amber-500", bg: "bg-amber-500/10" };
        return { label: "Needs Work", color: "text-red-500", bg: "bg-red-500/10" };
    };

    const status = getStatus(totalScore);

    const metrics = [
        { label: "Profitability", value: trade.net_profit > 0 ? 30 : trade.net_profit === 0 ? 15 : 0, max: 30, color: "bg-primary" },
        {
            label: "Execution",
            value: (trade.followed_plan ? 10 : 0) + (trade.proper_risk ? 10 : 0) + (trade.good_entry ? 10 : 0) + (trade.patient_exit ? 10 : 0),
            max: 40,
            color: "bg-primary"
        },
        {
            label: "Journal",
            value: (trade.pre_analysis ? 5 : 0) + (trade.post_review ? 5 : 0) + (trade.emotion ? 5 : 0) + (trade.reason || trade.mistake ? 5 : 0),
            max: 20,
            color: "bg-white/20"
        },
        { label: "Rating", value: trade.rating || 0, max: 10, color: "bg-primary" },
    ];

    return (
        <div className={cn("glass-card-premium p-6 rounded-3xl border border-border dark:border-white/5 space-y-6", className)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-bold text-foreground dark:text-white uppercase tracking-wider">Trade Quality</h3>
                </div>
            </div>

            <div className="flex gap-8">
                {/* Circular Progress */}
                <div className="relative w-32 h-32 flex-shrink-0">
                    <svg className="w-full h-full -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r="58"
                            fill="transparent"
                            stroke="currentColor"
                            className="text-foreground dark:text-white opacity-[0.05]"
                            strokeWidth="10"
                        />
                        <circle
                            cx="64"
                            cy="64"
                            r="58"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="10"
                            strokeDasharray={2 * Math.PI * 58}
                            strokeDashoffset={2 * Math.PI * 58 * (1 - totalScore / 100)}
                            className={cn("transition-all duration-1000", status.color)}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-foreground dark:text-white">{totalScore}</span>
                    </div>
                </div>

                {/* Breakdown Bars */}
                <div className="flex-1 space-y-4">
                    {metrics.map((m) => (
                        <div key={m.label} className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                                <span className="text-muted-foreground">{m.label}</span>
                                <span className="text-foreground dark:text-white">{m.value}/{m.max}</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted dark:bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full transition-all duration-1000", m.color)}
                                    style={{ width: `${(m.value / m.max) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Section */}
            <div className="p-4 rounded-2xl bg-muted dark:bg-white/5 border border-border dark:border-white/5 space-y-4">
                <div className="flex items-center gap-2">
                    <Info className="w-3 h-3 text-muted-foreground" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">How is this calculated?</p>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-foreground dark:text-white uppercase">Profitability (30 pts)</p>
                        <p className="text-[9px] text-muted-foreground leading-tight">Win: 30 | Break-even: 15 | Loss: 0</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-foreground dark:text-white uppercase">Execution (40 pts)</p>
                        <p className="text-[9px] text-muted-foreground leading-tight">10 pts each: Followed Plan, Proper Risk, Good Entry, Patient Exit</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-foreground dark:text-white uppercase">Journal (20 pts)</p>
                        <p className="text-[9px] text-muted-foreground leading-tight">5 pts each: Pre-analysis, Post-review, Emotions, Lessons</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-foreground dark:text-white uppercase">Rating (10 pts)</p>
                        <p className="text-[9px] text-muted-foreground leading-tight">Your self-rating (1-10)</p>
                    </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border dark:border-white/5">
                    {["Excellent", "Good", "Average", "Needs Work"].map(s => {
                        const st = getStatus(s === "Excellent" ? 80 : s === "Good" ? 60 : s === "Average" ? 40 : 20);
                        return (
                            <span key={s} className={cn("text-[9px] font-black px-2 py-1 rounded uppercase", st.bg, st.color)}>
                                {s === "Needs Work" ? "<40" : s === "Average" ? "40+" : s === "Good" ? "60+" : "80+"} {s}
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
