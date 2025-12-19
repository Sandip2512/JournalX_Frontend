import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Loader2, Calendar, TrendingUp, TrendingDown, CheckCircle2, XCircle, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DisciplineDay {
    date: string;
    followed_loss_limit: boolean;
    followed_trade_limit: boolean;
    on_track_profit: boolean;
    total_trades: number;
    daily_pnl: number;
    all_rules_followed: boolean;
}

interface DisciplineStats {
    total_days: number;
    compliant_days: number;
    violation_days: number;
    compliance_rate: number;
    current_streak: number;
    best_streak: number;
    worst_streak: number;
}

export default function DisciplineDiary() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<DisciplineDay[]>([]);
    const [stats, setStats] = useState<DisciplineStats | null>(null);
    const [selectedDay, setSelectedDay] = useState<DisciplineDay | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (user?.user_id) {
                try {
                    const [historyRes, statsRes] = await Promise.all([
                        api.get(`/api/discipline/history/${user.user_id}?days=30`),
                        api.get(`/api/discipline/stats/${user.user_id}?days=30`)
                    ]);
                    setHistory(historyRes.data);
                    setStats(statsRes.data);
                } catch (error) {
                    console.error("Error fetching discipline data", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchData();
    }, [user?.user_id]);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-background pb-20">
            <Header />
            <main className="container mx-auto px-4 lg:px-6 py-8 md:py-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 opacity-0 animate-fade-up">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold">Discipline Diary</h1>
                    </div>
                    <button
                        onClick={() => navigate('/goals')}
                        className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                    >
                        ← Back to Goals
                    </button>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 opacity-0 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-sm text-muted-foreground">Compliance Rate</span>
                            </div>
                            <div className="text-3xl font-bold">{stats.compliance_rate}%</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {stats.compliant_days}/{stats.compliant_days + stats.violation_days} active days
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-success/10 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-success" />
                                </div>
                                <span className="text-sm text-muted-foreground">Current Streak</span>
                            </div>
                            <div className="text-3xl font-bold text-success">{stats.current_streak}</div>
                            <div className="text-xs text-muted-foreground mt-1">days in a row ✅</div>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-warning/10 rounded-lg">
                                    <Award className="w-5 h-5 text-warning" />
                                </div>
                                <span className="text-sm text-muted-foreground">Best Streak</span>
                            </div>
                            <div className="text-3xl font-bold text-warning">{stats.best_streak}</div>
                            <div className="text-xs text-muted-foreground mt-1">personal record 🔥</div>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-destructive/10 rounded-lg">
                                    <TrendingDown className="w-5 h-5 text-destructive" />
                                </div>
                                <span className="text-sm text-muted-foreground">Violations</span>
                            </div>
                            <div className="text-3xl font-bold text-destructive">{stats.violation_days}</div>
                            <div className="text-xs text-muted-foreground mt-1">days with issues</div>
                        </div>
                    </div>
                )}

                {/* Enhanced Calendar Grid */}
                <div className="glass-card p-4 opacity-0 animate-fade-up max-w-2xl mx-auto" style={{ animationDelay: '0.2s' }}>
                    <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        Last 30 Days
                    </h2>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                            <div key={i} className="text-center text-[10px] font-bold text-primary py-1 bg-primary/5 rounded">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-1">
                        {history.slice().reverse().map((day, index) => {
                            const date = new Date(day.date);
                            const isToday = new Date().toDateString() === date.toDateString();
                            const hasNoTrades = day.total_trades === 0;

                            return (
                                <div
                                    key={index}
                                    className={`
                                        group relative aspect-square rounded cursor-pointer transition-all duration-200
                                        ${hasNoTrades
                                            ? 'bg-muted/20 border border-muted/40 hover:border-muted'
                                            : day.all_rules_followed
                                                ? 'bg-gradient-to-br from-success/20 to-success/10 border border-success/40 hover:border-success'
                                                : 'bg-gradient-to-br from-destructive/20 to-destructive/10 border border-destructive/40 hover:border-destructive'
                                        }
                                        ${selectedDay?.date === day.date ? 'ring-1 ring-primary scale-105' : 'hover:scale-105'}
                                        ${isToday ? 'ring-1 ring-warning' : ''}
                                    `}
                                    onClick={() => setSelectedDay(day)}
                                >
                                    {/* Content */}
                                    <div className="relative h-full flex flex-col items-center justify-center gap-0.5">
                                        {/* Date */}
                                        <div className={`text-[11px] font-bold ${isToday ? 'text-warning' : hasNoTrades ? 'text-muted-foreground' : ''}`}>
                                            {date.getDate()}
                                        </div>

                                        {/* Icon - only show if there are trades */}
                                        {!hasNoTrades && (
                                            day.all_rules_followed ? (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                                            ) : (
                                                <XCircle className="w-3.5 h-3.5 text-destructive" />
                                            )
                                        )}
                                    </div>

                                    {/* Today indicator */}
                                    {isToday && (
                                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-warning rounded-full" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="mt-3 flex items-center justify-center gap-4 p-2 bg-muted/30 rounded text-[10px]">
                        <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-success" />
                            <span>Followed</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-destructive" />
                            <span>Violated</span>
                        </div>
                    </div>
                </div>

                {/* Day Detail */}
                {selectedDay && (
                    <div className="glass-card p-8 mt-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.3s' }}>
                        <h2 className="text-xl font-semibold mb-6">
                            {new Date(selectedDay.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </h2>

                        {selectedDay.total_trades === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-up">
                                <div className="p-4 bg-muted/20 rounded-full mb-4">
                                    <Calendar className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-medium text-muted-foreground">No Trades Recorded</h3>
                                <p className="text-muted-foreground/60 mt-2">
                                    There is no trading activity recorded for this date.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className={`p-4 rounded-lg border-2 ${selectedDay.followed_loss_limit ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            {selectedDay.followed_loss_limit ? (
                                                <CheckCircle2 className="w-5 h-5 text-success" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-destructive" />
                                            )}
                                            <span className="font-medium">Daily Loss Limit</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            P&L: ${selectedDay.daily_pnl.toFixed(2)}
                                        </div>
                                    </div>

                                    <div className={`p-4 rounded-lg border-2 ${selectedDay.followed_trade_limit ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            {selectedDay.followed_trade_limit ? (
                                                <CheckCircle2 className="w-5 h-5 text-success" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-destructive" />
                                            )}
                                            <span className="font-medium">Trade Limit</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Trades: {selectedDay.total_trades}
                                        </div>
                                    </div>

                                    <div className={`p-4 rounded-lg border-2 ${selectedDay.on_track_profit ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            {selectedDay.on_track_profit ? (
                                                <CheckCircle2 className="w-5 h-5 text-success" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-destructive" />
                                            )}
                                            <span className="font-medium">Profitable Day</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {selectedDay.on_track_profit ? 'Positive' : 'Negative'}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                                    <div className="text-center">
                                        <span className="text-lg font-semibold">
                                            Overall: {[selectedDay.followed_loss_limit, selectedDay.followed_trade_limit, selectedDay.on_track_profit].filter(Boolean).length}/3 Rules Followed
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
