import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Loader2, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Medal, Trophy, Calendar as CalendarIcon, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, addWeeks, subMonths, addMonths, subYears, addYears, getDaysInMonth, startOfDay } from "date-fns";

type PeriodType = "week" | "month" | "year";

export default function TradersDiary() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [periodType, setPeriodType] = useState<PeriodType>("month"); // Default to month as per screenshot usually
    const [currentDate, setCurrentDate] = useState(new Date());

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
    }, [user?.user_id, periodType, currentDate]);

    const handlePrev = () => {
        if (periodType === "week") setCurrentDate(subWeeks(currentDate, 1));
        else if (periodType === "month") setCurrentDate(subMonths(currentDate, 1));
        else setCurrentDate(subYears(currentDate, 1));
    };

    const handleNext = () => {
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
        if (val > 0) return "text-emerald-500";
        if (val < 0) return "text-red-500";
        return "text-muted-foreground";
    };

    const getBgProfitColor = (val: number) => {
        if (val > 0) return "bg-emerald-500/10 border-emerald-500/20";
        if (val < 0) return "bg-red-500/10 border-red-500/20";
        return "bg-muted/10 border-muted/20";
    }

    // Render Grid View
    const renderGrid = () => {
        if (!stats) return null;

        if (periodType === "month" || periodType === "week") {
            // Calendar Grid
            const monthStart = startOfMonth(currentDate);
            const daysInMonth = getDaysInMonth(currentDate);
            const startDayOfWeek = monthStart.getDay() || 7; // 1 (Mon) - 7 (Sun)
            // Adjust for grid: Mon=1, Sun=7.
            // JS getDay(): Sun=0, Mon=1...Sat=6.
            // We want Mon=1. If 0 (Sun), make it 7.
            const offset = (monthStart.getDay() + 6) % 7;

            const gridCells = [];

            // Empty cells
            for (let i = 0; i < offset; i++) {
                gridCells.push(<div key={`empty-${i}`} className="h-24 bg-card/30 border border-border/40" />);
            }

            // Days
            const dailyDataMap: any = {};
            stats.grid_data.forEach((d: any) => {
                dailyDataMap[d.date] = d;
            });

            for (let d = 1; d <= daysInMonth; d++) {
                const dateStr = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), d), 'yyyy-MM-dd');
                const data = dailyDataMap[dateStr];

                gridCells.push(
                    <div key={d} className={`h-24 p-2 border border-border/40 flex flex-col items-center justify-center relative ${data ? ((data.profit > 0) ? "bg-green-950/20" : (data.profit < 0) ? "bg-red-950/20" : "") : ""}`}>
                        <span className="absolute top-2 left-2 text-xs text-muted-foreground">{d}</span>
                        {data && (
                            <>
                                <span className={`font-bold text-sm ${getProfitColor(data.profit)}`}>
                                    {data.profit > 0 ? "+" : ""}{data.profit.toFixed(0)}
                                </span>
                                <span className="text-[10px] text-muted-foreground">{data.trades} trades</span>
                            </>
                        )}
                    </div>
                );
            }

            return (
                <div className="rounded-lg border border-border bg-card/20 overflow-hidden mb-6">
                    <div className="grid grid-cols-7 text-center bg-muted/20 py-2 text-sm font-medium text-muted-foreground border-b border-border">
                        <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
                    </div>
                    <div className="grid grid-cols-7">
                        {gridCells}
                    </div>
                </div>
            );
        } else {
            // Yearly View (12 Months)
            // This requires grouping daily stats by month which backend currently returns as list of days.
            // Simple aggregation here or backend update. Let's aggregate here for now.
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthlyData = new Array(12).fill(0).map(() => ({ profit: 0, trades: 0, active: false }));

            stats.grid_data.forEach((d: any) => {
                const mIndex = new Date(d.date).getMonth();
                monthlyData[mIndex].profit += d.profit;
                monthlyData[mIndex].trades += d.trades;
                monthlyData[mIndex].active = true;
            });

            return (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                    {months.map((m, idx) => {
                        const data = monthlyData[idx];
                        return (
                            <div key={m} className={`h-32 rounded-lg border flex flex-col items-center justify-center p-4 ${data.active ? getBgProfitColor(data.profit) : "bg-card/20 border-border"}`}>
                                <span className="text-lg font-bold mb-1">{m}</span>
                                {data.active ? (
                                    <>
                                        <span className={`text-xl font-bold ${getProfitColor(data.profit)}`}>
                                            {data.profit.toFixed(0)}
                                        </span>
                                        <span className="text-xs text-muted-foreground mt-1">{data.trades} trades</span>
                                    </>
                                ) : (
                                    <span className="text-xs text-muted-foreground">-</span>
                                )}
                            </div>
                        )
                    })}
                </div>
            )
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
            <Header />
            <main className="container mx-auto px-4 lg:px-8 py-8 space-y-8">

                {/* Top Header - Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main P&L Card */}
                    <div className="lg:col-span-3 rounded-xl border border-border bg-card p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />

                        <div className="z-10 flex flex-col gap-1 min-w-[200px]">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                <Wallet className="w-4 h-4" /> Net Realised P&L
                            </span>
                            <span className={`text-4xl md:text-5xl font-bold tracking-tight ${getProfitColor(stats?.net_pl || 0)}`}>
                                {stats?.net_pl >= 0 ? "+" : ""}{stats?.net_pl?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </span>
                            <span className="text-xs text-muted-foreground mt-1">for {stats?.trading_days || 0} days of {currentPeriodLabel()}</span>
                        </div>

                        <div className="h-12 w-px bg-border hidden md:block" />

                        <div className="flex flex-wrap gap-8 z-10">
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                    <Medal className="w-3 h-3 text-yellow-500" /> Most Profitable (Period)
                                </span>
                                <span className="text-lg font-bold text-emerald-500">
                                    {stats?.most_profitable_period?.profit > 0 ? `+${stats.most_profitable_period.profit.toFixed(2)}` : "0.00"}
                                </span>
                                <span className="text-[10px] text-muted-foreground">on {stats?.most_profitable_period?.date || "-"}</span>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                    <Trophy className="w-3 h-3 text-orange-500" /> Most Profitable (All Time)
                                </span>
                                <span className="text-lg font-bold text-emerald-500">
                                    {stats?.most_profitable_all_time?.profit > 0 ? `+${stats.most_profitable_all_time.profit.toFixed(2)}` : "0.00"}
                                </span>
                                <span className="text-[10px] text-muted-foreground">on {stats?.most_profitable_all_time?.date || "-"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Streak Stats */}
                    <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { label: "Trading Days", val: stats?.trading_days || 0, sub: "Total Days" },
                            { label: "Traded On", val: stats?.traded_on || 0, sub: "Active Days" },
                            { label: "In-Profit Days", val: stats?.in_profit_days || 0, sub: "Green Days", color: "text-emerald-500" },
                            { label: "Winning Streak", val: stats?.winning_streak || 0, sub: "Longest Run", color: "text-emerald-500" },
                            { label: "Current Streak", val: stats?.current_streak || 0, sub: "Active Run", color: "text-emerald-500" },
                        ].map((item, i) => (
                            <div key={i} className="bg-card border border-border rounded-lg p-4 flex flex-col items-center justify-center text-center shadow-sm">
                                <span className={`text-2xl font-bold mb-1 ${item.color || "text-foreground"}`}>{item.val}</span>
                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* View Controls & Grid */}
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                            View {periodType === "month" ? "Monthly" : periodType === "year" ? "Yearly" : "Weekly"} Trades
                        </h2>

                        <div className="flex items-center gap-4 bg-muted/30 p-1 rounded-lg">
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={handlePrev} className="h-8 w-8 hover:bg-muted/50">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="min-w-[150px] text-center font-medium text-sm">{currentPeriodLabel()}</span>
                                <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8 hover:bg-muted/50">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="h-4 w-px bg-border" />

                            <Tabs value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)} className="h-8">
                                <TabsList className="h-8">
                                    <TabsTrigger value="week" className="text-xs px-3">Weekly</TabsTrigger>
                                    <TabsTrigger value="month" className="text-xs px-3">Monthly</TabsTrigger>
                                    <TabsTrigger value="year" className="text-xs px-3">Yearly</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>

                    {renderGrid()}

                    {/* Profitability Bar */}
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/20 p-2 rounded-md border border-border/50">
                        <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                        Total Number of days you are profitable for:
                        <span className="font-bold text-orange-500 ml-1">{stats?.in_profit_days}/{stats?.traded_on} Traded days</span>
                    </div>
                </div>

                {/* Breakdown & List */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Summary Panel */}
                    <div className="lg:col-span-3 bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold">{periodType === "month" ? "Monthly" : "Period"} Summary <span className="text-muted-foreground text-sm font-normal">for {currentPeriodLabel()}</span></h3>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Net P&L</span>
                                <span className={`text-2xl font-bold ${getProfitColor(stats?.net_pl || 0)}`}>
                                    {stats?.net_pl >= 0 ? "+" : ""}{stats?.net_pl?.toFixed(2)}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Total Trades</span>
                                <span className="text-2xl font-bold">{stats?.trades_list?.length || 0}</span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Win Rate</span>
                                <span className="text-2xl font-bold text-emerald-500">{(stats?.in_profit_days / (stats?.traded_on || 1) * 100).toFixed(0)}% <span className="text-xs text-muted-foreground font-normal">(Days)</span></span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Brokerage</span>
                                <span className="text-2xl font-bold text-muted-foreground">0.00</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border text-[10px] text-muted-foreground">
                            Charges excluded as per settings. Realised P&L is Net.
                        </div>
                    </div>

                    {/* Trades List Table */}
                    <div className="lg:col-span-3">
                        <h3 className="text-lg font-semibold mb-4">Trades for {periodType}</h3>
                        <div className="rounded-lg border border-border overflow-hidden">
                            <div className="bg-muted/40 p-3 grid grid-cols-12 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                                <div className="col-span-3">Date</div>
                                <div className="col-span-3">Symbol / Type</div>
                                <div className="col-span-2 text-center">Trade ID</div>
                                <div className="col-span-2 text-right">Net P&L</div>
                                <div className="col-span-2 text-right">Result</div>
                            </div>
                            <ScrollArea className="h-[400px]">
                                {stats?.trades_list?.length > 0 ? (
                                    stats.trades_list.map((trade: any) => (
                                        <div key={trade.id} className="p-3 grid grid-cols-12 text-sm border-b border-border/40 hover:bg-muted/20 items-center">
                                            <div className="col-span-3 text-muted-foreground">
                                                {trade.close_time
                                                    ? new Date(trade.close_time).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
                                                    : trade.date}
                                            </div>
                                            <div className="col-span-3 font-medium">{trade.name}</div>
                                            <div className="col-span-2 text-center text-muted-foreground font-mono text-xs">#{trade.trade_no}</div>
                                            <div className={`col-span-2 text-right font-medium ${getProfitColor(trade.net_profit)}`}>
                                                {trade.net_profit > 0 ? "+" : ""}{trade.net_profit.toFixed(2)}
                                            </div>
                                            <div className="col-span-2 text-right">
                                                <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${trade.net_profit > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                                                    {trade.result}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-muted-foreground">No trades found for this period.</div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
