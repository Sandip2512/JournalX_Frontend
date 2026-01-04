import { cn } from "@/lib/utils";
import { Hash } from "lucide-react";

interface TotalTradesCardProps {
    count: number;
    className?: string;
    animationDelay?: string;
}

export function TotalTradesCard({
    count,
    className,
    animationDelay = "0s"
}: TotalTradesCardProps) {
    return (
        <div
            className={cn(
                "relative group overflow-hidden rounded-xl p-4 transition-all duration-500 hover:scale-[1.02] opacity-0 animate-fade-up border border-white/5",
                className
            )}
            style={{
                animationDelay,
                background: "rgba(15, 23, 42, 0.9)",
                backdropFilter: "blur(8px)",
            }}
        >
            {/* 3D Convex Lighting (Matches Progress Bars) */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-black/20 pointer-events-none" />

            {/* Traveling Sheen (Matches Progress Bars) */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-[shimmer_3s_infinite]" style={{ backgroundSize: '50% 100%' }} />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.15em]">
                        Volume Analytics
                    </p>
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:text-white transition-colors duration-300">
                        <Hash className="w-4 h-4" />
                    </div>
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-4xl lg:text-5xl font-black text-white tracking-tighter drop-shadow-lg">
                        {count}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pb-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        Total Trades
                    </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[9px] font-bold text-emerald-400 uppercase">System Active</span>
                    </div>

                    {/* Achievement Badge */}
                    <div className="text-[9px] font-bold text-indigo-300/40 uppercase group-hover:text-indigo-300 transition-colors">
                        Verified Data
                    </div>
                </div>
            </div>

            {/* Corner Shine */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full -mr-12 -mt-12 pointer-events-none" />
        </div>
    );
}
