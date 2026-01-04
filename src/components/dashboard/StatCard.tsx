import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  className?: string;
  valueClassName?: string;
  animationDelay?: string;
}

export function StatCard({
  label,
  value,
  className,
  valueClassName,
  animationDelay = "0s"
}: StatCardProps) {
  return (
    <div
      className={cn(
        "glass-card-premium p-4 rounded-xl relative overflow-hidden opacity-0 animate-fade-up group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-white/20",
        className
      )}
      style={{ animationDelay }}
    >
      <div className="relative z-10">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <div className="flex items-baseline gap-1">
          <p className={cn(
            "text-2xl lg:text-3xl font-black text-foreground tracking-tight",
            valueClassName
          )}>
            {value}
          </p>
        </div>
      </div>
      {/* Decorative gradient blob */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 opacity-20" />
    </div>
  );
}
