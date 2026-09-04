import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TradesSummaryCardProps {
  type: "winning" | "losing";
  count: number;
  amount: number;
  animationDelay?: string;
  className?: string;
}

export function TradesSummaryCard({
  type,
  count,
  amount,
  animationDelay = "0s",
  className
}: TradesSummaryCardProps) {
  const isWinning = type === "winning";

  return (
    <div
      className={cn(
        "glass-card-premium p-6 rounded-3xl relative overflow-hidden opacity-0 animate-fade-up group transition-all duration-500 hover:-translate-y-2 border border-white/5",
        isWinning ? "hover:border-emerald-500/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(16,185,129,0.1)]" : "hover:border-red-500/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(239,68,68,0.1)]",
        className
      )}
      style={{ animationDelay }}
    >
      {/* 3D Convex Lighting & Inner Glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />

      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className={cn(
          "p-3 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-500",
          isWinning ? "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20" : "bg-red-500/10 text-red-400 group-hover:bg-red-500/20"
        )}>
          {isWinning ? <TrendingUp className="w-6 h-6 animate-pulse" /> : <TrendingDown className="w-6 h-6 animate-pulse" />}
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-md shadow-inner transition-colors duration-500",
          isWinning ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5 group-hover:bg-emerald-500/10" : "border-red-500/20 text-red-400 bg-red-500/5 group-hover:bg-red-500/10"
        )}>
          {isWinning ? "Profit" : "Loss"}
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div>
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.25em] mb-1 group-hover:text-foreground transition-colors duration-500">
            {isWinning ? "Winning Trades" : "Losing Trades"}
          </p>
          <div className="flex items-baseline gap-2">
            <span className={cn(
              "text-4xl lg:text-5xl font-black tracking-tighter drop-shadow-2xl transition-all duration-500",
              isWinning ? "text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-300" : "text-red-600 dark:text-red-400 group-hover:text-red-500 dark:group-hover:text-red-300"
            )}>{count}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 group-hover:opacity-60 transition-opacity">trades</span>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex justify-between items-center group/item">
          <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest group-hover/item:text-primary transition-colors">Volume</span>
          <span className={cn(
            "text-2xl font-black tracking-tighter transition-all duration-500",
            isWinning ? "text-emerald-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" : "text-red-500 group-hover:text-red-600 dark:group-hover:text-red-400"
          )}>
            ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Decorative Blur Blobs */}
      <div className={cn(
        "absolute -bottom-16 -right-16 w-32 h-32 rounded-full blur-[60px] opacity-20 transition-all duration-1000 group-hover:scale-150 group-hover:opacity-30",
        isWinning ? "bg-emerald-500" : "bg-red-500"
      )} />
    </div>
  );
}
