import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Target, ShieldAlert, Zap, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export default function Goals() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [goals, setGoals] = useState({
        monthly_profit_target: 0,
        max_daily_loss: 0,
        max_trades_per_day: 0
    });

    // Real-time stats (mocked for now, strictly should fetch)
    const [currentStats, setCurrentStats] = useState({
        current_profit: 0,
        today_loss: 0,
        today_trades: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            if (user?.user_id) {
                try {
                    // Fetch Goals - but don't populate the form, just check if they exist
                    try {
                        await api.get(`/api/goals/user/${user.user_id}`);
                        // Goals exist but we don't populate the form - form stays empty
                    } catch (goalError: any) {
                        // If 404, user hasn't set goals yet - keep default empty state
                        if (goalError.response?.status !== 404) {
                            throw goalError;
                        }
                    }

                    // Fetch Real-time stats (Using calendar/stats endpoint logic roughly)
                    // Simplified: We need daily stats for today and monthly total
                    const today = new Date();
                    const calendarRes = await api.get(`/api/analytics/calendar`, {
                        params: {
                            user_id: user.user_id,
                            month: today.getMonth() + 1,
                            year: today.getFullYear()
                        }
                    });

                    const dailyData = calendarRes.data;
                    const totalProfit = dailyData.reduce((acc: number, d: any) => acc + d.profit, 0);

                    const dateStr = today.toISOString().split('T')[0];
                    const todayData = dailyData.find((d: any) => d.date === dateStr);

                    setCurrentStats({
                        current_profit: totalProfit,
                        today_loss: todayData && todayData.profit < 0 ? Math.abs(todayData.profit) : 0,
                        today_trades: todayData ? todayData.trades : 0
                    });

                } catch (error) {
                    console.error("Error fetching data", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchData();
    }, [user?.user_id]);

    const handleChange = (field: string, value: string) => {
        setGoals(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.user_id) return;

        setSaving(true);
        try {
            const response = await api.post(`/api/goals/`, goals, {
                params: { user_id: user.user_id }
            });
            setGoals({
                monthly_profit_target: 0,
                max_daily_loss: 0,
                max_trades_per_day: 0
            });
            toast({
                title: "Goals Updated",
                description: "Your trading goals and limits have been saved."
            });
        } catch (error) {
            console.error("Error saving goals:", error);
            toast({
                title: "Error",
                description: "Failed to save goals. Please try again.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    // Calculate progress
    const profitProgress = goals.monthly_profit_target > 0
        ? Math.min(100, Math.max(0, (currentStats.current_profit / goals.monthly_profit_target) * 100))
        : 0;

    return (
        <div className="min-h-screen bg-background pb-20">
            <Header />
            <main className="container mx-auto px-4 lg:px-6 py-8 md:py-12">
                <div className="flex items-center gap-3 mb-8 opacity-0 animate-fade-up">
                    <Target className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold">Goals & Discipline</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Tracking Section */}
                    <div className="space-y-8 opacity-0 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                        <div className="glass-card p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Target className="w-24 h-24" />
                            </div>
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500" />
                                Monthly Progress
                            </h2>

                            <div className="space-y-2 mb-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>Profit Goal</span>
                                    <span>${goals.monthly_profit_target.toFixed(2)}</span>
                                </div>
                                <Progress value={profitProgress} className="h-3" />
                                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                                    <span>Current: ${currentStats.current_profit.toFixed(2)}</span>
                                    <span>{profitProgress.toFixed(0)}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-card p-6 border-l-4 border-l-destructive/50">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Daily Loss Limit</h3>
                                <div className="text-2xl font-bold mb-1">
                                    ${currentStats.today_loss.toFixed(2)} <span className="text-muted-foreground text-base font-normal">/ ${goals.max_daily_loss.toFixed(2)}</span>
                                </div>
                                {goals.max_daily_loss > 0 && currentStats.today_loss >= goals.max_daily_loss && (
                                    <div className="text-destructive text-sm font-bold flex items-center gap-1 mt-2">
                                        <ShieldAlert className="w-4 h-4" /> STOP TRADING
                                    </div>
                                )}
                            </div>

                            <div className="glass-card p-6">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Daily Trades</h3>
                                <div className="text-2xl font-bold mb-1">
                                    {currentStats.today_trades} <span className="text-muted-foreground text-base font-normal">/ {goals.max_trades_per_day}</span>
                                </div>
                                {goals.max_trades_per_day > 0 && currentStats.today_trades >= goals.max_trades_per_day && (
                                    <div className="text-yellow-500 text-sm font-bold flex items-center gap-1 mt-2">
                                        <ShieldAlert className="w-4 h-4" /> LIMIT REACHED
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Settings Form */}
                    <div className="glass-card p-8 opacity-0 animate-fade-up" style={{ animationDelay: '0.2s' }}>
                        <h2 className="text-xl font-semibold mb-6">Define Your Rules</h2>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="target">Monthly Profit Target ($)</Label>
                                <Input
                                    id="target"
                                    type="number"
                                    value={goals.monthly_profit_target || ''}
                                    onChange={(e) => handleChange("monthly_profit_target", e.target.value)}
                                    className="bg-muted/50"
                                    placeholder="Enter monthly profit target"
                                />
                                <p className="text-xs text-muted-foreground">What is your realistic profit goal for this month?</p>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="loss_limit">Max Daily Loss ($)</Label>
                                <Input
                                    id="loss_limit"
                                    type="number"
                                    value={goals.max_daily_loss || ''}
                                    onChange={(e) => handleChange("max_daily_loss", e.target.value)}
                                    className="bg-muted/50 border-destructive/20 focus:border-destructive"
                                    placeholder="Enter max daily loss"
                                />
                                <p className="text-xs text-muted-foreground">At what loss amount will you stop trading for the day?</p>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="trade_limit">Max Trades Per Day</Label>
                                <Input
                                    id="trade_limit"
                                    type="number"
                                    value={goals.max_trades_per_day || ''}
                                    onChange={(e) => handleChange("max_trades_per_day", e.target.value)}
                                    className="bg-muted/50"
                                    placeholder="Enter max trades per day"
                                />
                                <p className="text-xs text-muted-foreground">To prevent overtrading, set a hard limit on trade count.</p>
                            </div>

                            <Button type="submit" className="w-full" disabled={saving}>
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                Save Goals
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
