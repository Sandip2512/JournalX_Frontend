import React from "react";
import UserLayout from "@/components/layout/UserLayout";
import { Target, Trophy, TrendingUp, Calendar } from "lucide-react";

const Goals = () => {
    return (
        <UserLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Target className="w-8 h-8" />
                            </div>
                            <h1 className="text-3xl font-extrabold text-foreground dark:text-white">Growth Targets</h1>
                        </div>
                        <p className="text-muted-foreground">Set and track your trading goals to maintain discipline and progress.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: "Weekly Goal", icon: Calendar, color: "blue", progress: 65, target: "$500.00" },
                            { title: "Monthly Goal", icon: TrendingUp, color: "emerald", progress: 42, target: "$2,000.00" },
                            { title: "Yearly Milestone", icon: Trophy, color: "amber", progress: 15, target: "$25,000.00" },
                        ].map((goal, i) => (
                            <div key={i} className="glass-card-premium p-6 rounded-2xl border border-border dark:border-white/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className={`p-2 rounded-lg bg-${goal.color}-500/10 text-${goal.color}-500`}>
                                        <goal.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-bold text-foreground dark:text-white">{goal.target}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground dark:text-white">{goal.title}</h3>
                                    <div className="mt-4 space-y-2">
                                        <div className="flex justify-between text-xs text-muted-foreground font-medium">
                                            <span>Progress</span>
                                            <span>{goal.progress}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted dark:bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-${goal.color}-500 shadow-[0_0_10px_rgba(var(--${goal.color}-rgb),0.5)]`}
                                                style={{ width: `${goal.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="glass-card-premium p-12 rounded-3xl border border-border dark:border-white/5 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                            <Target className="w-10 h-10 text-primary animate-bounce-slow" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-foreground dark:text-white">Goal Management System</h2>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Define your path to excellence. This module will allow you to set specific, measurable targets for profit, win rate, and risk management.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
};

export default Goals;
