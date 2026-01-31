import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  badge?: string;
  badgeClassName?: string;
  icon?: LucideIcon;
  className?: string;
  valueClassName?: string;
  animationDelay?: string;
  glowColor?: "primary" | "emerald" | "amber" | "red";
  children?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  subtitle,
  badge,
  badgeClassName,
  icon: Icon,
  className,
  valueClassName,
  animationDelay = "0s",
  glowColor = "primary",
  children
}: StatCardProps) {
  const glowVariants = {
    primary: "bg-primary/10 group-hover:bg-primary/20",
    emerald: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
    amber: "bg-amber-500/10 group-hover:bg-amber-500/20",
    red: "bg-red-500/10 group-hover:bg-red-500/20",
  };

  const dotVariants = {
    primary: "bg-primary/20 group-hover:bg-primary group-hover:shadow-[0_0_8px_rgba(11,102,228,0.8)]",
    emerald: "bg-emerald-500/20 group-hover:bg-emerald-500 group-hover:shadow-[0_0_8px_rgba(16,185,129,0.8)]",
    amber: "bg-amber-500/20 group-hover:bg-amber-500 group-hover:shadow-[0_0_8px_rgba(245,158,11,0.8)]",
    red: "bg-red-500/20 group-hover:bg-red-500 group-hover:shadow-[0_0_8px_rgba(239,68,68,0.8)]",
  };

  return (
    <div
      className={cn(
        "glass-card-premium p-6 rounded-3xl relative overflow-hidden opacity-0 animate-fade-up group transition-all duration-500 hover:-translate-y-2 border border-white/5",
        glowColor === "primary" && "hover:border-primary/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(11,102,228,0.1)]",
        glowColor === "emerald" && "hover:border-emerald-500/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(16,185,129,0.1)]",
        glowColor === "amber" && "hover:border-amber-500/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(245,158,11,0.1)]",
        glowColor === "red" && "hover:border-red-500/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(239,68,68,0.1)]",
        className
      )}
      style={{ animationDelay }}
    >
      {/* 3D Convex Lighting & Inner Glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border dark:via-white/10 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-border dark:via-white/5 to-transparent pointer-events-none" />

      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon className={cn("w-4 h-4 text-muted-foreground/60 transition-colors duration-500",
              glowColor === "primary" && "group-hover:text-primary",
              glowColor === "emerald" && "group-hover:text-emerald-400",
              glowColor === "amber" && "group-hover:text-amber-400",
              glowColor === "red" && "group-hover:text-red-400"
            )} />}
            <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.25em] transition-colors duration-500">
              {label}
            </p>
          </div>
          {badge ? (
            <Badge className={cn("text-[8px] px-2 py-0 border-none font-bold uppercase tracking-widest", badgeClassName)}>
              {badge}
            </Badge>
          ) : (
            <div className={cn("w-1.5 h-1.5 rounded-full transition-all duration-500", dotVariants[glowColor])} />
          )}
        </div>

        <div className="flex flex-col">
          <p className={cn(
            "text-3xl lg:text-4xl font-black tracking-tighter text-foreground dark:text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-colors duration-500",
            valueClassName
          )}>
            {value}
          </p>
          {subtitle && (
            <p className="text-[10px] font-medium text-muted-foreground/60 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Subtle trend or status line */}
        <div className={cn("h-1 w-8 rounded-full transition-all duration-700 group-hover:w-16",
          glowColor === "primary" && "bg-primary/10 group-hover:bg-primary/30",
          glowColor === "emerald" && "bg-emerald-500/10 group-hover:bg-emerald-500/30",
          glowColor === "amber" && "bg-amber-500/10 group-hover:bg-amber-500/30",
          glowColor === "red" && "bg-red-500/10 group-hover:bg-red-500/30"
        )} />

        {children}
      </div>

      {/* Modern Gradient Blob with Pulse */}
      <div className={cn("absolute -top-16 -right-16 w-40 h-40 rounded-full blur-[60px] group-hover:scale-125 transition-all duration-1000 opacity-40 animate-pulse-slow", glowVariants[glowColor])} />

      {/* Corner Reflective Shine */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-foreground/[0.02] dark:from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </div>
  );
}
