import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

interface TraderRadarChartProps {
    stats: any;
    className?: string;
}

export function TraderRadarChart({ stats, className }: TraderRadarChartProps) {
    const data = React.useMemo(() => {
        if (!stats) return [];

        // Normalize metrics into 0-100 scores

        // 1. Accuracy: Direct win rate
        const accuracy = stats.win_rate || 0;

        // 2. Efficiency: Profit Factor normalized (Score 100 at PF 3.0)
        const pf = stats.profit_factor || 0;
        const efficiency = Math.min((pf / 3.0) * 100, 100);

        // 3. Risk/Reward: Avg Win / Avg Loss (Score 100 at R:R 3.0)
        const avgWin = stats.avg_win || 0;
        const avgLoss = Math.abs(stats.avg_loss || 1); // Avoid division by zero
        const rr = avgWin / (avgLoss === 0 ? 1 : avgLoss);
        const riskReward = Math.min((rr / 3.0) * 100, 100);

        // 4. Discipline: How close is Max Loss to Avg Loss? (Closer = Higher Discipline)
        const maxLoss = Math.abs(stats.max_loss || 0);
        let discipline = 100;
        if (avgLoss > 0 && maxLoss > 0) {
            const lossRatio = maxLoss / avgLoss;
            discipline = Math.max(100 - ((lossRatio - 1) * 15), 10);
        }

        // 5. Experience/Activity: Number of trades (Max score at 100+ trades)
        const activity = Math.min(((stats.total_trades || 0) / 100) * 100, 100);

        return [
            { subject: 'Accuracy', score: Math.round(accuracy), fullMark: 100 },
            { subject: 'Efficiency', score: Math.round(efficiency), fullMark: 100 },
            { subject: 'R:R', score: Math.round(riskReward), fullMark: 100 },
            { subject: 'Discipline', score: Math.round(discipline), fullMark: 100 },
            { subject: 'Activity', score: Math.round(activity), fullMark: 100 },
        ];
    }, [stats]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card/95 backdrop-blur-xl border border-white/10 p-3 rounded-lg shadow-2xl">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{payload[0].payload.subject}</p>
                    <p className="text-sm font-black text-primary">
                        Score: {payload[0].value} <span className="opacity-50 text-[10px]">/ 100</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomTick = ({ payload, x, y, textAnchor }: any) => {
        return (
            <g className="recharts-layer recharts-polar-angle-axis-tick">
                <text
                    x={x}
                    y={y + (y > 150 ? 5 : -5)}
                    className="recharts-text recharts-polar-angle-axis-tick-value drop-shadow-md"
                    textAnchor={textAnchor}
                    fill="rgba(255,255,255,0.8)"
                    fontSize="10px"
                    fontWeight="800"
                    letterSpacing="1px"
                >
                    <tspan x={x} dy="0em">{payload.value}</tspan>
                </text>
            </g>
        );
    };

    return (
        <div className={cn("glass-card-premium p-6 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col group", className)}>
            {/* Background Animations */}
            <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-20 blur-2xl transition-opacity duration-700 group-hover:opacity-40">
                <div className="w-24 h-24 bg-primary rounded-full animate-pulse" />
            </div>
            {/* Center Core Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none mix-blend-screen" />

            <div className="flex items-center gap-2 mb-2 relative z-10">
                <div className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center shadow-lg shadow-black/20">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary drop-shadow-[0_0_5px_rgba(11,102,228,0.5)]">
                        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                    </svg>
                </div>
                <h3 className="text-xs font-bold text-foreground dark:text-white uppercase tracking-wider text-glow">Trader Profile</h3>
            </div>

            <p className="text-[9px] text-muted-foreground font-semibold mb-4 uppercase tracking-widest relative z-10">Behavioral Axis Mapping</p>

            <div className="flex-1 w-full min-h-[310px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
                        <PolarGrid
                            stroke="rgba(255,255,255,0.08)"
                            gridType="polygon"
                        />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={<CustomTick />}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Radar
                            name="Trader"
                            dataKey="score"
                            stroke="#0b66e4"
                            strokeWidth={3}
                            fill="url(#colorRadar)"
                            fillOpacity={1}
                            dot={{ r: 4, fill: "rgba(11, 102, 228, 0.4)", stroke: "transparent" }}
                            activeDot={{ r: 6, fill: "#0b66e4", stroke: "#ffffff", strokeWidth: 2 }}
                            style={{ filter: "drop-shadow(0 0 10px rgba(11, 102, 228, 0.5))" }}
                        />
                        <defs>
                            <linearGradient id="colorRadar" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0b66e4" stopOpacity={0.7} />
                                <stop offset="100%" stopColor="#0b66e4" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
