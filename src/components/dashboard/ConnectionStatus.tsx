import { Plug, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  isConnected: boolean;
  accountId: string;
  server: string;
  lastFetch: string;
  variant?: "default" | "compact";
}

export function ConnectionStatus({
  isConnected,
  accountId,
  server,
  lastFetch,
  variant = "default",
}: ConnectionStatusProps) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "glass-card-premium px-3 py-1.5 rounded-full flex items-center gap-3 animate-fade-up border shadow-sm",
          isConnected ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"
        )}
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            isConnected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
          )} />
          <span className="text-xs font-semibold text-foreground">
            {isConnected ? "MT5 Live" : "MT5 Offline"}
          </span>
        </div>

        <div className="h-3 w-px bg-border/50" />

        {isConnected ? (
          <span className="text-[10px] text-muted-foreground font-medium tabular-nums">
            {accountId}
          </span>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 hover:bg-transparent text-primary hover:text-primary/80"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="glass-card-premium p-6 rounded-2xl opacity-0 animate-fade-up" style={{ animationDelay: "0.3s" }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] animate-pulse",
            isConnected ? "bg-emerald-500 text-emerald-500" : "bg-red-500 text-red-500"
          )} />

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              MT5 Connection
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider border",
                isConnected
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                  : "bg-red-500/10 border-red-500/20 text-red-500"
              )}>
                {isConnected ? "Live" : "Offline"}
              </span>
            </h3>
            <p className="text-sm text-muted-foreground">
              {isConnected ? (
                <>Connected to <span className="text-foreground font-medium">{server}</span> as <span className="text-foreground font-medium">{accountId}</span></>
              ) : (
                "Trading functionality unavailable"
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isConnected && (
            <div className="text-xs text-muted-foreground hidden md:block">
              Last attempt: {lastFetch}
            </div>
          )}
          <Button
            variant={isConnected ? "outline" : "default"}
            size="sm"
            className={cn(
              "gap-2 transition-all",
              !isConnected && "animate-pulse shadow-lg shadow-primary/20"
            )}
          >
            <RefreshCw className={cn("w-4 h-4", isConnected && "animate-spin-once")} />
            {isConnected ? "Sync" : "Connect"}
          </Button>
        </div>
      </div>
    </div>
  );
}
