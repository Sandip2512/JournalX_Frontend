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
        "p-4 rounded-xl border opacity-0 animate-fade-up transition-all duration-300 hover:scale-[1.02]",
        isWinning ? "glass-card-success" : "glass-card-danger",
        className
      )}
      style={{ animationDelay }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={cn(
          "p-1.5 rounded-lg",
          isWinning ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
        )}>
          {isWinning ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
        </div>
        <span className={cn(
          "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border",
          isWinning ? "border-emerald-500/20 text-emerald-500" : "border-red-500/20 text-red-500"
        )}>
          {isWinning ? "Profit" : "Loss"}
        </span>
      </div>

      <div className="space-y-0.5">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          {isWinning ? "Winning Trades" : "Losing Trades"}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-foreground">{count}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">trades</span>
        </div>

        <div className="pt-2 mt-2 border-t border-border/10 flex justify-between items-center">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Volume</span>
          <span className={cn(
            "text-base font-black",
            isWinning ? "text-emerald-500" : "text-red-500"
          )}>
            ${amount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
