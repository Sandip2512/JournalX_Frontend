import { useState, useEffect } from "react";
import UserLayout from "@/components/layout/UserLayout";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
    Loader2, ChevronLeft, ChevronRight, TrendingUp, TrendingDown,
    Medal, Trophy, Calendar as CalendarIcon, Wallet,
    ArrowUpRight, ArrowDownRight, Activity, Zap, Info, Search, Filter, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    format, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
    startOfYear, endOfYear, subWeeks, addWeeks, subMonths,
    addMonths, subYears, addYears, getDaysInMonth, startOfDay,
    isSameDay, isToday
} from "date-fns";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FeatureGate } from "@/components/auth/FeatureGate";
import { Badge } from "@/components/ui/badge";

type PeriodType = "week" | "month" | "year";

export default function TradersDiary() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [periodType, setPeriodType] = useState<PeriodType>("month"); // Default to month as per screenshot usually
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    useEffect(() => {
        const fetchDiary = async () => {
            if (user?.user_id) {
                setLoading(true);
                try {
                    let startDate: Date;
                    let endDate: Date;

                    if (periodType === "week") {
                        startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
                        endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
                    } else if (periodType === "month") {
                        startDate = startOfMonth(currentDate);
                        endDate = endOfMonth(currentDate);
                    } else {
                        startDate = startOfYear(currentDate);
                        endDate = endOfYear(currentDate);
                    }

                    const response = await api.get(`/api/analytics/diary`, {
                        params: {
                            user_id: user.user_id,
                            start_date: format(startDate, 'yyyy-MM-dd'),
                            end_date: format(endDate, 'yyyy-MM-dd')
                        }
                    });
                    setStats(response.data);
                } catch (error) {
                    console.error("Error fetching diary", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchDiary();
        setSelectedDate(null); // Reset selection when period/date changes
    }, [user?.user_id, periodType, currentDate]);

    const handlePrev = () => {
        // Free Tier Restriction: Cannot go back past 30 days from today
        if (user?.subscription_tier === 'free' || !user?.subscription_tier) {
            const thirtyDaysAgo = subWeeks(new Date(), 4); // Roughly 30 days
            const targetDate = periodType === "week" ? subWeeks(currentDate, 1) :
                periodType === "month" ? subMonths(currentDate, 1) : subYears(currentDate, 1);

            if (targetDate < startOfDay(thirtyDaysAgo)) {
                return; // Prevent going back further than 30 days
            }
        }

        if (periodType === "week") setCurrentDate(subWeeks(currentDate, 1));
        else if (periodType === "month") setCurrentDate(subMonths(currentDate, 1));
        else setCurrentDate(subYears(currentDate, 1));
    };

    const handleNext = () => {
        const nextDate = periodType === "week" ? addWeeks(currentDate, 1) :
            periodType === "month" ? addMonths(currentDate, 1) : addYears(currentDate, 1);

        // Don't allow going into future
        if (nextDate > new Date()) return;

        if (periodType === "week") setCurrentDate(addWeeks(currentDate, 1));
        else if (periodType === "month") setCurrentDate(addMonths(currentDate, 1));
        else setCurrentDate(addYears(currentDate, 1));
    };

    const currentPeriodLabel = () => {
        if (periodType === "week") return `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d")} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d")}`;
        if (periodType === "month") return format(currentDate, "MMMM yyyy");
        return format(currentDate, "yyyy");
    }

    // Helper to get color class based on profit
    const getProfitColor = (val: number) => {
        if (val > 0) return "text-primary";
        if (val < 0) return "text-red-500";
        return "text-muted-foreground";
    };

    const getBgProfitColor = (val: number) => {
        if (val > 0) return "bg-primary/10 border-primary/20";
        if (val < 0) return "bg-red-500/10 border-red-500/20";
        return "bg-muted dark:bg-white/5 border-border dark:border-white/5";
    }

    // Heatmap intensity helper
    const getHeatmapStyle = (profit: number) => {
        if (profit === 0) return "bg-muted dark:bg-white/5 border-border dark:border-white/5";

        if (profit > 0) {
            const intensity = Math.min(Math.floor((profit / 1000) * 10), 9); // Scale based on profit
            const opacities = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7];
            return `bg-primary/${Math.floor(opacities[intensity] * 100)} border-primary/20 shadow-[0_0_15px_rgba(11,102,228,${opacities[intensity] * 0.5})]`;
        } else {
            const intensity = Math.min(Math.floor((Math.abs(profit) / 1000) * 10), 9);
            const opacities = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7];
            return `bg-red-500/${Math.floor(opacities[intensity] * 100)} border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,${opacities[intensity] * 0.5})]`;
        }
    }

    // Render Grid View
    const renderGrid = () => {
        if (!stats) return null;

        if (periodType === "month" || periodType === "week") {
            const monthStart = startOfMonth(currentDate);
            const daysInMonth = getDaysInMonth(currentDate);
            // offset for Mon-Sun grid: (getDay() + 6) % 7
            const offset = (monthStart.getDay() + 6) % 7;

            const gridCells = [];

            // Empty cells for the start of the month
            for (let i = 0; i < offset; i++) {
                gridCells.push(<div key={`empty-${i}`} className="h-24 bg-card dark:bg-white/[0.01] border border-border dark:border-white/5 rounded-md m-1" />);
            }

            const dailyDataMap: any = {};
            stats.grid_data.forEach((d: any) => {
                dailyDataMap[d.date] = d;
            });

            for (let d = 1; d <= daysInMonth; d++) {
                const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
                const dateStr = format(dayDate, 'yyyy-MM-dd');
                const data = dailyDataMap[dateStr];
                const isSelected = isToday(dayDate);

                gridCells.push(
                    <TooltipProvider key={d}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    onClick={() => setSelectedDate(dateStr)}
                                    className={cn(
                                        "h-24 p-2 border transition-all duration-300 rounded-lg m-1 flex flex-col items-center justify-center relative cursor-pointer group hover:scale-[1.1] hover:z-20",
                                        data ? getHeatmapStyle(data.profit) : "bg-card dark:bg-white/[0.02] border-border dark:border-white/5 hover:border-primary/50 dark:hover:border-white/10",
                                        (isSelected || selectedDate === dateStr) && "ring-1 ring-primary ring-offset-2 ring-offset-background"
                                    )}
                                >
                                    <span className={cn(
                                        "absolute top-1.5 left-2 text-[10px] font-bold transition-colors",
                                        data ? "text-foreground/60 dark:text-white/60" : "text-muted-foreground/30 group-hover:text-muted-foreground"
                                    )}>{d}</span>
                                    {data && (
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span className={cn(
                                                "font-black text-[12px] sm:text-[14px] leading-none transition-colors",
                                                data.profit > 0 ? "text-primary shadow-sm" : data.profit < 0 ? "text-red-400" : "text-foreground dark:text-white/80"
                                            )}>
                                                {data.profit > 0 ? `+$${Math.abs(data.profit).toFixed(0)}` : data.profit < 0 ? `-$${Math.abs(data.profit).toFixed(0)}` : `$${data.profit.toFixed(0)}`}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-card dark:bg-[#111114] border-border dark:border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-xl">
                                <div className="space-y-3 min-w-[160px]">
                                    <div className="flex items-center justify-between border-b border-border dark:border-white/5 pb-2">
                                        <span className="text-xs font-bold text-foreground dark:text-white">{format(dayDate, "EEEE, MMM d")}</span>
                                        {data && <Badge variant={data.profit >= 0 ? "default" : "destructive"} className="h-5 text-[9px] uppercase tracking-tighter">{data.profit >= 0 ? "Profit" : "Loss"}</Badge>}
                                    </div>
                                    {data ? (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Net P&L</span>
                                                <span className={cn("text-sm font-bold", getProfitColor(data.profit))}>
                                                    {data.profit > 0 ? "+" : ""}{data.profit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Trades Count</span>
                                                <span className="text-sm font-bold text-foreground dark:text-white">{data.trades}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-muted-foreground">No trading activity recorded for this day.</p>
                                    )}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            }

            return (
                <div className="max-w-6xl mx-auto rounded-xl border border-border dark:border-white/5 bg-card/50 dark:bg-[#111114]/50 backdrop-blur-xl overflow-hidden shadow-2xl p-6">
                    <div className="grid grid-cols-7 mb-4 px-1">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                            <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{day}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7">
                        {gridCells}
                    </div>
                </div>
            );
        } else {
            // Yearly View
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthlyData = new Array(12).fill(0).map(() => ({ profit: 0, trades: 0, active: false }));

            stats.grid_data.forEach((d: any) => {
                const mIndex = new Date(d.date).getMonth();
                monthlyData[mIndex].profit += d.profit;
                monthlyData[mIndex].trades += d.trades;
                monthlyData[mIndex].active = true;
            });

            return (
                <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {months.map((m, idx) => {
                        const data = monthlyData[idx];
                        return (
                            <div key={m} className={cn(
                                "group h-32 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center p-4 cursor-pointer relative overflow-hidden",
                                data.active ? getHeatmapStyle(data.profit) : "bg-muted dark:bg-white/[0.03] border-border dark:border-white/5 grayscale"
                            )}>
                                <div className="absolute top-2 right-3 opacity-20 group-hover:opacity-40 transition-opacity">
                                    <Activity className="w-8 h-8" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest mb-1 text-foreground/50 dark:text-white/50">{m}</span>
                                {data.active ? (
                                    <>
                                        <span className={cn(
                                            "text-2xl font-black leading-none transition-colors",
                                            data.profit > 0 ? "text-primary shadow-sm" : data.profit < 0 ? "text-red-400" : "text-foreground dark:text-white"
                                        )}>
                                            {data.profit > 0 ? `+$${Math.abs(data.profit).toFixed(0)}` : data.profit < 0 ? `-$${Math.abs(data.profit).toFixed(0)}` : `$${data.profit.toFixed(0)}`}
                                        </span>
                                        <span className="text-[10px] font-bold text-foreground/40 dark:text-white/40 mt-1">{data.trades} Trades</span>
                                    </>
                                ) : (
                                    <span className="text-[10px] text-muted-foreground/40 font-bold italic">INACTIVE</span>
                                )}
                            </div>
                        )
                    })}
                </div>
            )
        }
    };

    // Filter trades based on selected date
    const filteredTrades = () => {
        if (!stats?.trades_list || stats.trades_list.length === 0) return [];

        let targetDate = selectedDate;

        // If no date selected, find the most recent date from the trades list
        if (!targetDate) {
            const sortedDates = [...stats.trades_list]
                .map((t: any) => t.iso_date || (t.close_time ? format(new Date(t.close_time), 'yyyy-MM-dd') : null))
                .filter(Boolean)
                .sort((a, b) => b.localeCompare(a));
            targetDate = sortedDates[0] || null;
        }

        if (!targetDate) return stats.trades_list;

        return stats.trades_list.filter((t: any) => {
            const tDate = t.iso_date || (t.close_time ? format(new Date(t.close_time), 'yyyy-MM-dd') : null);
            return tDate === targetDate;
        });
    };

    const getDisplayDateLabel = () => {
        let targetDate = selectedDate;
        if (!targetDate && stats?.trades_list?.length > 0) {
            const sortedDates = [...stats.trades_list]
                .map((t: any) => t.iso_date || (t.close_time ? format(new Date(t.close_time), 'yyyy-MM-dd') : null))
                .filter(Boolean)
                .sort((a, b) => b.localeCompare(a));
            targetDate = sortedDates[0] || null;
        }
        return targetDate ? format(new Date(targetDate), "MMM d, yyyy") : "Recent Activity";
    }

    const tradesToShow = filteredTrades();

    if (loading) return <UserLayout><div className="flex h-[calc(100vh-80px)] items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div></UserLayout>;

    return (
        <UserLayout>
            <div className="min-h-screen bg-transparent relative overflow-hidden">
                {/* Aurora Effects */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-red-500/5 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
                </div>

                <main className="container mx-auto px-4 lg:px-8 py-8 space-y-8 relative z-10">
                    {/* Free Tier Banner */}
                    {(user?.subscription_tier === 'free' || !user?.subscription_tier) && (
                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between animate-fade-in">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Info className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-foreground dark:text-white">Free Plan History Limit</h4>
                                    <p className="text-xs text-muted-foreground font-medium">You are viewing 30 days of trade history. Upgrade to Pro for unlimited history.</p>
                                </div>
                            </div>
                            <Button size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest px-6" onClick={() => window.location.href = '/plans'}>Upgrade</Button>
                        </div>
                    )}

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black tracking-tighter text-foreground dark:text-white flex items-center gap-3">
                                <CalendarIcon className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(11,102,228,0.5)]" />
                                Trader's Diary
                            </h1>
                            <p className="text-muted-foreground text-sm font-medium tracking-tight">Track your daily performance and equity growth</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Tabs value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)} className="bg-muted dark:bg-white/5 p-1 rounded-xl border border-border dark:border-white/5">
                                <TabsList className="bg-transparent h-9 gap-1">
                                    <TabsTrigger value="week" className="text-[11px] font-black uppercase tracking-tighter data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-white rounded-lg px-4 transition-all">
                                        week
                                    </TabsTrigger>
                                    <TabsTrigger value="month" className="text-[11px] font-black uppercase tracking-tighter data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-white rounded-lg px-4 transition-all">
                                        month
                                    </TabsTrigger>
                                    <TabsTrigger value="year" className="text-[11px] font-black uppercase tracking-tighter data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-white rounded-lg px-4 transition-all gap-2" disabled={user?.subscription_tier === 'free'}>
                                        year
                                        {user?.subscription_tier === 'free' && <Lock className="w-3 h-3 text-muted-foreground" />}
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="flex items-center bg-card dark:bg-[#111114] rounded-xl border border-border dark:border-white/5 p-1 shadow-inner">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handlePrev}
                                    disabled={(user?.subscription_tier === 'free' || !user?.subscription_tier) && (
                                        (periodType === 'month' && isSameDay(startOfMonth(currentDate), startOfMonth(new Date()))) ||
                                        (periodType === 'week' && isSameDay(startOfWeek(currentDate), startOfWeek(new Date())))
                                    )}
                                    className="h-8 w-8 hover:bg-muted dark:hover:bg-white/5 rounded-lg disabled:opacity-30"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="px-4 text-[11px] font-black uppercase tracking-widest text-primary min-w-[140px] text-center">
                                    {currentPeriodLabel()}
                                </span>
                                <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8 hover:bg-muted dark:hover:bg-white/5 rounded-lg">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Huge P&L Card */}
                        <div className="lg:col-span-2 group relative overflow-hidden rounded-[2rem] border border-border dark:border-white/5 bg-card/50 dark:bg-[#111114]/50 backdrop-blur-3xl p-8 transition-all duration-500 hover:border-primary/20 hover:shadow-[0_0_50px_rgba(11,102,228,0.15)] flex flex-col justify-between h-auto min-h-[220px]">
                            <div className="absolute top-0 right-0 p-8 text-primary/10 group-hover:text-primary/20 transition-colors">
                                <Wallet className="w-24 h-24 rotate-12" />
                            </div>

                            <div className="space-y-1 relative z-10">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                                    <Activity className="w-3 h-3 text-primary" /> Net Realized P&L
                                </span>
                                <div className="flex items-baseline gap-2">
                                    <span className={cn(
                                        "text-5xl md:text-6xl font-black tracking-tighter transition-all duration-500",
                                        stats?.net_pl >= 0 ? "text-primary drop-shadow-[0_0_20px_rgba(11,102,228,0.4)]" : "text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                                    )}>
                                        {stats?.net_pl >= 0 ? "+" : ""}{stats?.net_pl?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-8 relative z-10">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Traded Days</span>
                                    <span className="text-lg font-black text-foreground dark:text-white">{stats?.traded_on || 0}<span className="text-xs text-muted-foreground/50 ml-1">/ {stats?.trading_days || 0}</span></span>
                                </div>
                                <div className="h-8 w-px bg-border dark:bg-white/5 mx-2" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Efficiency</span>
                                    <span className="text-lg font-black text-primary">
                                        {((stats?.in_profit_days / (stats?.traded_on || 1)) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Best/Worst/Streaks Grid */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                {
                                    label: "Max Green Day",
                                    value: stats?.most_profitable_period?.profit,
                                    date: stats?.most_profitable_period?.date,
                                    icon: Trophy,
                                    color: "text-primary",
                                    bg: "bg-primary/5",
                                    currency: true
                                },
                                {
                                    label: "Current Streak",
                                    value: stats?.current_streak,
                                    suffix: " Days",
                                    icon: Zap,
                                    color: "text-amber-500",
                                    bg: "bg-amber-500/5"
                                },
                                {
                                    label: "Winning Streak",
                                    value: stats?.winning_streak,
                                    suffix: " Days",
                                    icon: Medal,
                                    color: "text-primary",
                                    bg: "bg-primary/5"
                                },
                                {
                                    label: "Weekly Avg",
                                    value: (stats?.net_pl / (stats?.trading_days / 5 || 1)),
                                    icon: TrendingUp,
                                    color: "text-primary",
                                    bg: "bg-primary/5",
                                    currency: true
                                }
                            ].map((item, i) => (
                                <div key={i} className="group rounded-2xl border border-border dark:border-white/5 bg-card/30 dark:bg-[#111114]/30 p-5 flex items-center justify-between hover:border-border/80 dark:hover:border-white/10 transition-all">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 block">{item.label}</span>
                                        <span className={cn("text-xl font-black tracking-tight", item.color)}>
                                            {item.currency ? (item.value >= 0 ? "+" : "-") : ""}{item.currency ? Math.abs(item.value).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : item.value}{item.suffix}
                                        </span>
                                        {item.date && <span className="block text-[8px] text-muted-foreground/40 font-bold uppercase tracking-tighter">On {format(new Date(item.date), "MMM d, yyyy")}</span>}
                                    </div>
                                    <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110", item.bg)}>
                                        <item.icon className={cn("w-5 h-5", item.color)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Heatmap Grid */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(11,102,228,0.8)]" />
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/70 dark:text-white/70">Performance Heatmap</h2>
                        </div>
                        {renderGrid()}
                    </div>

                    {/* Trades Table Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/70 dark:text-white/70">
                                Journal Entries {selectedDate ? `- ${getDisplayDateLabel()}` : `(${getDisplayDateLabel()})`}
                            </h2>
                            <div className="flex items-center gap-3">
                                {selectedDate && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedDate(null)}
                                        className="text-[10px] font-black uppercase text-primary/60 hover:text-primary transition-colors"
                                    >
                                        Show All
                                    </Button>
                                )}
                                <div className="flex items-center gap-2 text-[10px] text-primary font-bold bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
                                    <Activity className="w-3 h-3" />
                                    {tradesToShow.length} Trades
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[1.5rem] border border-border dark:border-white/5 bg-card/50 dark:bg-[#111114]/50 backdrop-blur-xl overflow-hidden shadow-2xl">
                            <div className="bg-muted dark:bg-white/[0.02] p-4 grid grid-cols-12 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border dark:border-white/5">
                                <div className="col-span-3">Time / Date</div>
                                <div className="col-span-3">Symbol / Type</div>
                                <div className="col-span-2 text-center">Reference</div>
                                <div className="col-span-2 text-right">Net P&L</div>
                                <div className="col-span-2 text-right px-4">Result</div>
                            </div>

                            <ScrollArea className="h-[500px]">
                                {tradesToShow.length > 0 ? (
                                    tradesToShow.map((trade: any) => (
                                        <div key={trade.id} className="p-4 grid grid-cols-12 text-sm border-b border-border dark:border-white/[0.03] hover:bg-muted dark:hover:bg-white/[0.02] items-center transition-colors group">
                                            <div className="col-span-3 flex flex-col">
                                                <span className="text-[11px] font-bold text-foreground dark:text-white group-hover:text-primary transition-colors">
                                                    {trade.close_time ? format(new Date(trade.close_time), "MMM d, yyyy") : trade.date}
                                                </span>
                                                <span className="text-[9px] text-muted-foreground/60 font-medium">
                                                    {trade.close_time ? format(new Date(trade.close_time), "HH:mm:ss") : "00:00:00"}
                                                </span>
                                            </div>

                                            <div className="col-span-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-[10px] border border-primary/20">
                                                        {trade.name?.[0]}
                                                    </div>
                                                    <span className="font-black tracking-tight text-foreground/90 dark:text-white/90">{trade.name}</span>
                                                </div>
                                            </div>

                                            <div className="col-span-2 text-center">
                                                <span className="bg-muted dark:bg-white/5 px-2 py-1 rounded text-[9px] font-mono text-muted-foreground group-hover:text-foreground dark:group-hover:text-white transition-colors">#{trade.trade_no}</span>
                                            </div>

                                            <div className="col-span-2 text-right">
                                                <span className={cn("text-[13px] font-black tracking-tighter", getProfitColor(trade.net_profit))}>
                                                    {trade.net_profit > 0 ? "+" : ""}{trade.net_profit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                                </span>
                                            </div>

                                            <div className="col-span-2 text-right px-4">
                                                <Badge className={cn(
                                                    "h-5 text-[9px] font-black uppercase tracking-tighter px-3 rounded-full border-0",
                                                    trade.net_profit >= 0
                                                        ? "bg-primary/20 text-primary shadow-[0_0_10px_rgba(11,102,228,0.3)]"
                                                        : "bg-red-500/20 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                                                )}>
                                                    {trade.result}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-20 flex flex-col items-center justify-center gap-4 group">
                                        <div className="h-16 w-16 rounded-full bg-muted dark:bg-white/[0.02] border border-border dark:border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:border-primary/20 transition-all duration-500">
                                            <Search className="w-6 h-6 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                        </div>
                                        <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase opacity-40">Zero trading activity found</p>
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>
                </main>
            </div>
        </UserLayout>
    );
}
