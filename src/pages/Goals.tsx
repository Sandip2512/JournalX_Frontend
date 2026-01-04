
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Header } from "@/components/layout/Header";
import {
    Target,
    TrendingUp,
    CheckCircle2,
    Calendar,
    Trophy,
    AlertCircle,
    Activity,
    RotateCcw,
    Settings,
    Trash2
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import api from '../lib/api';
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';

interface AnalyticsData {
    beginner: {
        total_pl: number;
        weekly_profit: number;
        monthly_profit: number;
        yearly_profit: number;
        win_rate: number;
        total_trades: number;
        avg_risk: number;
        equity_curve: { time: string; equity: number }[];
    };
}

interface Goal {
    id: string;
    goal_type: 'weekly' | 'monthly' | 'yearly';
    target_amount: number;
    is_active: boolean;
}

const Goals = () => {
    const { user, updateUser } = useAuth(); // Assuming updateUser updates the context
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const [goals, setGoals] = useState<Record<string, Goal>>({});
    const [currentStats, setCurrentStats] = useState<AnalyticsData['beginner']>({
        total_pl: 0,
        weekly_profit: 0,
        monthly_profit: 0,
        yearly_profit: 0,
        win_rate: 0,
        total_trades: 0,
        avg_risk: 0,
        equity_curve: [],
    });

    // Form State
    const [formData, setFormData] = useState({
        weeklyTarget: '',
        monthlyTarget: '',
        yearlyTarget: '',
        dailyLossLimit: '',
        maxTrades: ''
    });

    useEffect(() => {
        fetchData();
    }, [user?.user_id]);

    const fetchData = async () => {
        if (!user?.user_id) return;

        try {
            const [goalsRes, analyticsRes] = await Promise.all([
                api.get(`/api/goals/user/${user.user_id}`),
                api.get(`/api/analytics/user/${user.user_id}`)
            ]);

            // Process Goals
            console.log("🏆 GOALS PAGE RAW:", goalsRes.data);
            const goalsMap: Record<string, Goal> = {};
            if (Array.isArray(goalsRes.data)) {
                goalsRes.data.forEach((g: Goal) => {
                    console.log(`🏆 Checking goal ${g.goal_type}: active=${g.is_active}, target=${g.target_amount}`);
                    if (g.is_active) goalsMap[g.goal_type] = g;
                });
            }
            console.log("🏆 GOALS MAP:", goalsMap);
            setGoals(goalsMap);

            // Process Analytics
            let stats = analyticsRes.data?.beginner || currentStats;

            // Sync Weekly Profit calculation with Dashboard (Sunday start)
            try {
                const now = new Date();
                const calendarRes = await api.get(`/api/analytics/calendar?user_id=${user.user_id}&month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
                const monthData = calendarRes.data;

                const getLocalDateStr = (d: Date) => {
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${y}-${m}-${day}`;
                };

                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                weekStart.setHours(0, 0, 0, 0);

                let weekData = [...monthData];
                if (weekStart.getMonth() !== now.getMonth()) {
                    try {
                        const prevMonthRes = await api.get(`/api/analytics/calendar?user_id=${user.user_id}&month=${weekStart.getMonth() + 1}&year=${weekStart.getFullYear()}`);
                        weekData = [...weekData, ...prevMonthRes.data];
                    } catch (e) { }
                }

                let totalWeekly = 0;
                for (let i = 0; i < 7; i++) {
                    const checkDate = new Date(weekStart);
                    checkDate.setDate(weekStart.getDate() + i);
                    const dayStr = getLocalDateStr(checkDate);
                    const dayData = weekData.find((d: any) => d.date === dayStr);
                    if (dayData) totalWeekly += dayData.profit;
                }

                // Also Sync Monthly Profit for perfect parity
                const totalMonthly = monthData.reduce((sum: number, day: any) => sum + (day.profit || 0), 0);

                // Override both weekly and monthly profit
                stats = {
                    ...stats,
                    weekly_profit: totalWeekly,
                    monthly_profit: totalMonthly
                };
            } catch (e) {
                console.warn("Failed to sync stats in Goals page", e);
            }

            setCurrentStats(stats);

            // Sync Form Data
            setFormData({
                weeklyTarget: goalsMap['weekly']?.target_amount.toString() || '',
                monthlyTarget: goalsMap['monthly']?.target_amount.toString() || '',
                yearlyTarget: goalsMap['yearly']?.target_amount.toString() || '',
                dailyLossLimit: user.daily_loss_limit?.toString() || '',
                maxTrades: user.max_daily_trades?.toString() || ''
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // 1. Update User Settings (Risk)
            const updateData = {
                daily_loss_limit: Number(formData.dailyLossLimit) || 0,
                max_daily_trades: Number(formData.maxTrades) || 0
            };

            await api.put('/api/auth/profile', updateData);

            // Update context
            if (user) {
                updateUser({ ...user, ...updateData });
            }

            // 2. Update Goals (Sequentially or Parallel)
            const goalTypes = ['weekly', 'monthly', 'yearly'] as const;
            const promises = goalTypes.map(type => {
                const target = Number(formData[`${type}Target` as keyof typeof formData]);
                if (target > 0) {
                    return api.post(`/api/goals/?user_id=${user?.user_id}`, {
                        goal_type: type,
                        target_amount: target
                    });
                }
                return Promise.resolve();
            });

            await Promise.all(promises);

            toast({
                title: "Settings Saved",
                description: "Your goals and rules have been updated successfully.",
            });

            fetchData(); // Refresh UI
            setOpen(false); // Close dialog

        } catch (error) {
            console.error('Error saving settings:', error);
            toast({
                variant: 'destructive',
                title: "Save Failed",
                description: "Could not update settings. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const ProgressCard = ({ type, title, icon: Icon, current, target }: { type: string, title: string, icon: any, current: number, target: number }) => {
        const progress = target > 0 ? Math.min(Math.max((current / target) * 100, 0), 100) : 0;
        const safeCurrent = current || 0;
        const isAchieved = safeCurrent >= target && target > 0;

        const isWeekly = type.toLowerCase() === 'weekly';
        const isMonthly = type.toLowerCase() === 'monthly';

        const config = isWeekly
            ? {
                gradient: "from-cyan-400 via-blue-500 to-indigo-600",
                glow: "bg-cyan-500/20",
                iconColor: "text-cyan-500",
                bgColor: "bg-cyan-500/10"
            }
            : isMonthly
                ? {
                    gradient: "from-violet-400 via-fuchsia-500 to-rose-500",
                    glow: "bg-fuchsia-500/20",
                    iconColor: "text-fuchsia-500",
                    bgColor: "bg-fuchsia-500/10"
                }
                : {
                    gradient: "from-amber-400 via-orange-500 to-red-600",
                    glow: "bg-orange-500/20",
                    iconColor: "text-amber-500",
                    bgColor: "bg-amber-500/10"
                };

        return (
            <Card className="hover:shadow-xl transition-all duration-500 border-white/10 group overflow-hidden relative">
                <div className={cn("absolute -top-12 -right-12 w-24 h-24 blur-[60px] rounded-full pointer-events-none opacity-50", config.glow)} />

                <CardContent className="pt-6 relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-xl transition-colors duration-300", isAchieved ? "bg-emerald-500/10 text-emerald-500" : config.bgColor, config.iconColor)}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-xl tracking-tight">{title}</h3>
                                {isAchieved && (
                                    <span className="text-[10px] text-emerald-500 font-black flex items-center gap-1 uppercase tracking-widest mt-0.5 animate-pulse">
                                        Goal Crushed <CheckCircle2 className="w-3 h-3" />
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">{type} Target</div>
                            <div className="font-black text-2xl tracking-tighter tabular-nums">${target.toLocaleString()}</div>
                        </div>
                    </div>

                    {/* 3D Solid Prism Progress Bar */}
                    <div className="relative h-4 w-full mb-8 group/progress mt-4">
                        {/* High-Contrast Track */}
                        <div className="absolute inset-0 bg-secondary/50 rounded-sm border border-black/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] overflow-hidden" />

                        {/* 3D Solid Prism Progress Fill */}
                        <div
                            className={cn(
                                "absolute inset-y-0 left-0 rounded-l-sm transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] border-r border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.3)]",
                                isWeekly
                                    ? "bg-[#1e3a8a]" // Deep Blue (Solid)
                                    : isMonthly
                                        ? "bg-[#064e3b]" // Dark Emerald (Solid)
                                        : "bg-[#78350f]" // Saturated Amber (Solid)
                            )}
                            style={{
                                width: `${progress}%`,
                            }}
                        >
                            {/* 3D Convex Lighting Highlights */}
                            <div className="absolute top-0 left-0 right-0 h-[40%] bg-white/10 rounded-t-sm blur-[0.5px]" />
                            <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-black/20 rounded-b-sm blur-[0.5px]" />

                            {/* Traveling Sheen Animation (on hover) */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full opacity-0 group-hover/progress:opacity-100 transition-opacity duration-300 animate-[shimmer_2s_infinite]" style={{ backgroundSize: '50% 100%' }} />

                            {/* Floating Value Badge at the Tip (End) */}
                            <div
                                className="absolute right-[-10px] top-[-30px] bg-foreground text-background text-[10px] font-black px-2 py-0.5 rounded-md shadow-xl pointer-events-none whitespace-nowrap opacity-0 group-hover/progress:opacity-100 transition-all duration-300 transform translate-x-1/2 group-hover/progress:translate-y-[-2px]"
                            >
                                {progress.toFixed(0)}%
                                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-foreground" />
                            </div>

                            {/* Edge Sparkle */}
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-full bg-white/10 blur-[1px]" />
                        </div>
                    </div>

                    <div className="flex justify-between items-center tabular-nums">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Current P/L</span>
                            <span className={cn("font-black text-lg", safeCurrent >= 0 ? "text-emerald-500" : "text-red-500")}>
                                ${safeCurrent.toLocaleString()}
                            </span>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completion</span>
                            <span className={cn("font-black text-2xl tracking-tighter", isAchieved ? "text-emerald-500" : config.iconColor)}>
                                {progress.toFixed(0)}%
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <div className="absolute inset-0 aurora-bg pointer-events-none" />
            <div className="absolute inset-0 bg-grid-white/5 pointer-events-none" />

            <div className="relative z-10">
                <Header />
                <main className="container mx-auto px-4 lg:px-6 py-8">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
                                <Target className="w-8 h-8 text-primary" />
                                Goals & Discipline
                            </h1>
                            <p className="text-muted-foreground">Track your targets and maintain your trading rules.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                                        <Settings className="w-4 h-4 mr-2" /> Set Goals & Rules
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Define Your Rules</DialogTitle>
                                        <DialogDescription>
                                            Set your profit targets and risk limits to maintain discipline.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-6 py-4">
                                        {/* Goals Section */}
                                        <div className="space-y-4">
                                            <Label className="text-base font-semibold">Goal Targets</Label>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {['weekly', 'monthly', 'yearly'].map((type) => (
                                                    <div key={type} className="space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <Label className="flex items-center gap-2 capitalize">
                                                                {type === 'weekly' && <Activity className="w-3 h-3 text-blue-500" />}
                                                                {type === 'monthly' && <Target className="w-3 h-3 text-emerald-500" />}
                                                                {type === 'yearly' && <TrendingUp className="w-3 h-3 text-purple-500" />}
                                                                {type} ($)
                                                            </Label>
                                                            {/* Delete button always visible to ensure accessibility */}
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-muted-foreground hover:text-red-500"
                                                                title="Delete Goal"
                                                                onClick={async () => {
                                                                    if (!user?.user_id) return;
                                                                    try {
                                                                        // Only call API if there was a real value to delete
                                                                        if (formData[`${type}Target` as keyof typeof formData]) {
                                                                            await api.delete(`/api/goals/user/${user.user_id}?goal_type=${type}`);
                                                                            toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} Goal Deleted` });
                                                                            fetchData();
                                                                        }
                                                                        // Always clear the form
                                                                        setFormData(prev => ({ ...prev, [`${type}Target`]: '' }));
                                                                    } catch (e) {
                                                                        toast({ title: "Delete Failed", variant: "destructive" });
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                        <Input
                                                            type="number"
                                                            placeholder={type === 'weekly' ? "200" : type === 'monthly' ? "1000" : "10000"}
                                                            value={formData[`${type}Target` as keyof typeof formData]}
                                                            onChange={(e) => setFormData({ ...formData, [`${type}Target`]: e.target.value })}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="h-px bg-border" />

                                        {/* Risk Section */}
                                        <div className="space-y-4">
                                            <Label className="text-base font-semibold text-red-500">Risk Management</Label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label>Max Daily Loss ($)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="50"
                                                        value={formData.dailyLossLimit}
                                                        onChange={(e) => setFormData({ ...formData, dailyLossLimit: e.target.value })}
                                                        className="border-red-200 focus-visible:ring-red-500"
                                                    />
                                                    <p className="text-[10px] text-muted-foreground">Stop trading at this loss.</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Max Trades Per Day</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="3"
                                                        value={formData.maxTrades}
                                                        onChange={(e) => setFormData({ ...formData, maxTrades: e.target.value })}
                                                    />
                                                    <p className="text-[10px] text-muted-foreground">Hard limit on trade count.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex items-center justify-between gap-4">
                                            <Button
                                                className="w-full"
                                                onClick={handleSave}
                                                disabled={loading}
                                            >
                                                {loading ? <Activity className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                                Save Settings
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Button
                                variant="outline"
                                onClick={() => navigate('/discipline-diary')}
                            >
                                <Calendar className="w-4 h-4 mr-2" /> Discipline Diary
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Left Column: Progress Cards */}
                        <div className="space-y-6">
                            <ProgressCard
                                type="Weekly"
                                title="Weekly Progress"
                                icon={Activity}
                                current={currentStats.weekly_profit}
                                target={goals['weekly']?.target_amount || 0}
                            />
                            <ProgressCard
                                type="Monthly"
                                title="Monthly Progress"
                                icon={Target}
                                current={currentStats.monthly_profit}
                                target={goals['monthly']?.target_amount || 0}
                            />
                            <ProgressCard
                                type="Yearly"
                                title="Yearly Progress"
                                icon={TrendingUp}
                                current={currentStats.yearly_profit}
                                target={goals['yearly']?.target_amount || 0}
                            />
                        </div>

                        {/* Right Column: Total Account Growth */}
                        <Card className="h-full flex flex-col justify-center items-center relative overflow-hidden border-none shadow-lg bg-background/50 backdrop-blur-sm p-8">
                            {/* Large Trophy Icon Background */}
                            <Trophy className="absolute top-4 right-4 w-32 h-32 text-muted/5 -rotate-12" />

                            <CardHeader className="text-center relative z-10 p-0 mb-8">
                                <CardTitle className="text-xl flex items-center gap-2 justify-center text-muted-foreground">
                                    <Trophy className="w-5 h-5 text-yellow-500" /> Total Account Growth
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center relative z-10 space-y-6 p-0">
                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground uppercase tracking-wider">All-Time Net P/L</div>
                                    <div className={cn(
                                        "text-6xl font-black tracking-tight",
                                        currentStats.total_pl >= 0 ? "text-emerald-500" : "text-red-500"
                                    )}>
                                        ${currentStats.total_pl.toLocaleString()}
                                    </div>
                                    <div className={cn(
                                        "inline-flex px-4 py-1.5 rounded-full text-sm font-semibold",
                                        currentStats.total_pl >= 0
                                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                            : "bg-red-500/10 text-red-600 border border-red-500/20"
                                    )}>
                                        {currentStats.total_pl >= 0 ? '🚀 Profitable' : '📉 In Loss'}
                                    </div>
                                </div>
                                <div className="text-sm text-muted-foreground">Total profit/loss across all trades</div>
                            </CardContent>
                        </Card>
                    </div>


                </main>
            </div>
        </div>
    );
};

export default Goals;
