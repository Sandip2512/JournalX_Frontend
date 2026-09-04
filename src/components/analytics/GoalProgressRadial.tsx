import React from "react";
import { cn } from "@/lib/utils";

interface GoalProgressRadialProps {
    progress: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    label?: string;
    className?: string;
}

export function GoalProgressRadial({
    progress,
    size = 120,
    strokeWidth = 8,
    color = "text-primary",
    label,
    className
}: GoalProgressRadialProps) {
    const margin = 10; // Extra space for the glow effect
    const radius = (size - strokeWidth - margin * 2) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

    return (
        <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-90"
            >
                {/* Background Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-muted-foreground/10 dark:text-white/5"
                />
                {/* Progress Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    style={{
                        strokeDashoffset: offset,
                        transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    strokeLinecap="round"
                    className={cn(color, "drop-shadow-[0_0_8px_currentColor]")}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-foreground dark:text-white">{Math.round(progress)}%</span>
                {label && <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>}
            </div>
        </div>
    );
}
