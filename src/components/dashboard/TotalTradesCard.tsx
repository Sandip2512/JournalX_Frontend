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
                "glass-card-premium relative group overflow-hidden rounded-3xl p-6 transition-all duration-500 hover:-translate-y-2 opacity-0 animate-fade-up border border-white/5 hover:border-primary/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(11,102,228,0.1)]",
                className
            )}
            style={{
                animationDelay,
            }}
        >
            {/* 3D Convex Lighting & Inner Glow */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />

            {/* Traveling Sheen */}
            <div className="absolute inset-x-0 top-0 h-full w-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black text-primary/50 uppercase tracking-[0.25em] group-hover:text-primary transition-colors duration-500">
                            Volume Analytics
                        </p>
                        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-500">
                            <Hash className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl lg:text-5xl font-black text-foreground dark:text-white tracking-tighter drop-shadow-2xl group-hover:text-primary transition-colors duration-500">
                            {count}
                        </span>
                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] pb-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            Volume
                        </span>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-between pt-5 border-t border-white/5">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/10 dark:border-emerald-500/10 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all duration-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400/80 uppercase tracking-widest">Live Verified</span>
                    </div>

                    <div className="text-[9px] font-black text-primary/30 uppercase tracking-widest group-hover:text-primary/60 transition-colors">
                        MT5 Data
                    </div>
                </div>
            </div>

            {/* Subtle Gradient Blob */}
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-[50px] group-hover:bg-primary/20 group-hover:scale-150 transition-all duration-1000 opacity-40" />
        </div>
    );
}
