import React from 'react';
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: 'live' | 'next-up' | 'upcoming' | 'released';
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    if (status === 'live') {
        return (
            <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-white/10", className)}>
                <span className="text-[9px] font-black text-[#0A0A0B] uppercase tracking-wider">Live</span>
            </div>
        );
    }

    if (status === 'next-up') {
        return (
            <div className={cn("px-2 py-0.5 rounded-md bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)] ring-1 ring-white/10", className)}>
                <span className="text-[9px] font-black text-white uppercase tracking-wider">Next Up</span>
            </div>
        );
    }

    return null;
}
