import React, { useState, useEffect } from "react";
import { GoalCard } from "./GoalCard";
import { SetGoalModal } from "./SetGoalModal";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Target, Sparkles, Trophy, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalyticsGoalsTabProps {
    stats: any;
}

export function AnalyticsGoalsTab({ stats }: AnalyticsGoalsTabProps) {
    const { user } = useAuth();
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<any>(null);

    const fetchGoals = async () => {
        if (!user?.user_id) return;
        try {
            const res = await api.get(`/api/goals/user/${user.user_id}`);
            setGoals(res.data);
        } catch (error) {
            console.error("Error fetching goals:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, [user?.user_id]);

    const handleEditGoal = (goal: any) => {
        setSelectedGoal(goal);
        setIsModalOpen(true);
    };

    const handleCreateGoal = () => {
        setSelectedGoal(null);
        setIsModalOpen(true);
    };

    // Map stats to goal types
    const isFree = user?.subscription_tier === 'free' || !user?.subscription_tier;

    const currentProfits = {
        weekly: stats?.weekly_profit || 0,
        monthly: stats?.monthly_profit || 0,
        yearly: isFree ? 0 : (stats?.yearly_profit || stats?.total_pl || 0)
    };

    // Filter goal types for free users
    const goalTypes: ("weekly" | "monthly" | "yearly")[] = isFree ? ["weekly", "monthly"] : ["weekly", "monthly", "yearly"];

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-foreground dark:text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Growth Progress
                    </h2>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-50">Track your trading milestones</p>
                </div>
                <Button
                    onClick={handleCreateGoal}
                    className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl px-4 py-2 font-black text-[10px] uppercase tracking-widest gap-2 transition-all shadow-glow-blue"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Set New Target
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goalTypes.map(type => {
                    const goal = goals.find(g => g.goal_type === type);
                    return (
                        <GoalCard
                            key={type}
                            type={type}
                            target={goal?.target_amount || 0}
                            current={currentProfits[type]}
                            onEdit={() => handleEditGoal(goal)}
                        />
                    );
                })}
            </div>

            {/* Achievements Banner */}
            <div className="glass-card-premium p-8 rounded-[2rem] border border-border dark:border-white/5 relative overflow-hidden group mt-12">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center relative">
                        <Trophy className="w-10 h-10 text-primary animate-float" />
                        <div className="absolute inset-0 bg-primary/20 blur-[30px] rounded-full animate-pulse-slow" />
                    </div>
                    <div className="space-y-2 text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <h3 className="text-xl font-black text-foreground dark:text-white">Your Path to Consistency</h3>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed font-medium">
                            Setting goals is the first step in turning the invisible into the visible.
                            Progress is measured by discipline, not just profit. Maintain your edge and the targets will follow.
                        </p>
                    </div>
                    <div className="hidden lg:grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted dark:bg-white/5 rounded-2xl border border-border dark:border-white/5 text-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Goals</p>
                            <p className="text-xl font-black text-foreground dark:text-white">{goals.length}</p>
                        </div>
                        <div className="p-4 bg-muted dark:bg-white/5 rounded-2xl border border-border dark:border-white/5 text-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Achieved</p>
                            <p className="text-xl font-black text-emerald-500">{goals.filter(g => g.achieved).length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <SetGoalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchGoals}
                initialData={selectedGoal}
            />
        </div>
    );
}
