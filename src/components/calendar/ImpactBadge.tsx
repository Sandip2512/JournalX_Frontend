import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ImpactBadgeProps {
    impact: 'low' | 'medium' | 'high';
    className?: string;
}

export function ImpactBadge({ impact, className }: ImpactBadgeProps) {
    const variants = {
        high: "bg-red-500/20 text-red-500 border-red-500/20 hover:bg-red-500/30",
        medium: "bg-amber-500/20 text-amber-500 border-amber-500/20 hover:bg-amber-500/30",
        low: "bg-emerald-500/20 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/30",
        none: "bg-muted text-muted-foreground border-border"
    };

    const labels = {
        high: "HIGH",
        medium: "MED",
        low: "LOW",
        none: "NONE"
    };

    return (
        <Badge
            variant="outline"
            className={cn(
                "uppercase text-[10px] font-black px-2 py-1 min-w-[65px] justify-center tracking-[0.1em] border-none rounded-md flex items-center gap-1.5",
                impact === 'high' && "bg-red-500/10 text-red-500",
                impact === 'medium' && "bg-amber-500/10 text-amber-500",
                impact === 'low' && "bg-emerald-500/10 text-emerald-500",
                className
            )}
        >
            <div className={cn(
                "w-1.5 h-1.5 rounded-full ring-2 ring-white/5",
                impact === 'high' && "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
                impact === 'medium' && "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
                impact === 'low' && "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            )} />
            {labels[impact as keyof typeof labels] || impact}
        </Badge>
    );
}
