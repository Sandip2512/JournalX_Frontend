import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
    BrainCircuit, Loader2, TrendingDown, AlertTriangle, Activity, Target, ShieldAlert,
    CheckCircle2, AlertOctagon, Lightbulb, PlayCircle, X, Zap, ArrowUpRight, ArrowDownRight,
    BarChart3, Crosshair, DollarSign, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- Types ---
interface Trade {
    trade_no: number; symbol: string; type: string; volume: number;
    price_open: number; price_close: number; net_profit: number;
    open_time: string; close_time: string;
}

interface AiReportData {
    headline: { title: string; description: string; status: "break_even" | "profitable" | "losing"; };
    summary: { totalReturn: number; trades: number; winRate: number; profitFactor: number; biggestWin: number; biggestLoss: number; riskReward: string; averageHold: string; };
    distribution: { winningTrades: number; losingTrades: number; netPnL: number; };
    longVsShort: { longWinRate: number; shortWinRate: number; longPnL: number; shortPnL: number; longTrades: number; shortTrades: number; };
    dayOfWeek: { bestDay: string; worstDay: string; data: { day: string, pnl: number, winRate: number }[]; };
    trend: { date: string; winRate: number; profitFactor: number; cumulativePnL: number }[];
    blindspots: { title: string; severity: "critical" | "warning" | "info"; description: string; evidence: string; hardRule: string; }[];
    recurringPatterns: { title: string; type: "danger" | "neutral" | "positive"; frequency: string; description: string; impact: string; }[];
    worstTrades: { pair: string; direction: string; date: string; pnl: number; whatWentWrong: string; lesson: string; }[];
    actionPlan: { title: string; priority: "Do this first" | "Important" | "Nice to have"; description: string; measureSuccess: string; }[];
}

// --- AI Analysis Logic (same as AiReport.tsx) ---
const generateAiInsights = (trades: Trade[]): AiReportData => {
    if (!trades || trades.length === 0) {
        return {
            headline: { title: "No Data Found", description: "You need to log trades before we can analyze.", status: "losing" },
            summary: { totalReturn: 0, trades: 0, winRate: 0, profitFactor: 0, biggestWin: 0, biggestLoss: 0, riskReward: "0:0", averageHold: "0" },
            distribution: { winningTrades: 0, losingTrades: 0, netPnL: 0 },
            longVsShort: { longWinRate: 0, shortWinRate: 0, longPnL: 0, shortPnL: 0, longTrades: 0, shortTrades: 0 },
            dayOfWeek: { bestDay: "N/A", worstDay: "N/A", data: [] },
            trend: [], blindspots: [], recurringPatterns: [], worstTrades: [], actionPlan: []
        };
    }

    const wins = trades.filter(t => t.net_profit > 0);
    const losses = trades.filter(t => t.net_profit < 0);
    const grossProfit = wins.reduce((acc, t) => acc + t.net_profit, 0);
    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + t.net_profit, 0));
    const netPnL = grossProfit - grossLoss;
    const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? "10.0+" : "0.00";
    const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
    const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
    const rr = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : "0.0";
    const biggestWin = Math.max(0, ...wins.map(t => t.net_profit));
    const biggestLoss = Math.min(0, ...losses.map(t => t.net_profit));

    const sortedTradesDate = [...trades].sort((a, b) => new Date(a.open_time).getTime() - new Date(b.open_time).getTime());
    let cumPnL = 0; let runningWins = 0; let runningGrossWin = 0; let runningGrossLoss = 0;
    const trendMap = new Map();
    sortedTradesDate.forEach((t, i) => {
        cumPnL += t.net_profit;
        if (t.net_profit > 0) { runningWins++; runningGrossWin += t.net_profit; }
        else if (t.net_profit < 0) { runningGrossLoss += Math.abs(t.net_profit); }
        const dateStr = new Date(t.open_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        trendMap.set(dateStr, { date: dateStr, winRate: parseFloat(((runningWins / (i + 1)) * 100).toFixed(1)), profitFactor: parseFloat((runningGrossLoss > 0 ? (runningGrossWin / runningGrossLoss) : 0).toFixed(2)), cumulativePnL: parseFloat(cumPnL.toFixed(2)) });
    });
    const trend = Array.from(trendMap.values());

    const longTrades = trades.filter(t => t.type.toLowerCase() === 'buy');
    const shortTrades = trades.filter(t => t.type.toLowerCase() === 'sell');
    const longWins = longTrades.filter(t => t.net_profit > 0);
    const shortWins = shortTrades.filter(t => t.net_profit > 0);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayStats = days.map(d => ({ day: d, pnl: 0, wins: 0, total: 0 }));
    trades.forEach(t => { const d = new Date(t.open_time).getDay(); dayStats[d].pnl += t.net_profit; dayStats[d].total += 1; if (t.net_profit > 0) dayStats[d].wins += 1; });
    const validDays = dayStats.filter(d => d.total > 0).map(d => ({ day: d.day, pnl: parseFloat(d.pnl.toFixed(2)), winRate: parseFloat(((d.wins / d.total) * 100).toFixed(1)) }));
    const bestDayObj = [...validDays].sort((a, b) => b.pnl - a.pnl)[0];
    const worstDayObj = [...validDays].sort((a, b) => a.pnl - b.pnl)[0];

    let headlineStatus: "break_even" | "profitable" | "losing" = "break_even";
    let headlineTitle = "You are consolidating.";
    let headlineDesc = "You need more trades to establish a clear pattern.";
    if (netPnL > 0 && Number(profitFactor) >= 1.5) { headlineStatus = "profitable"; headlineTitle = "You have found a statistical edge."; headlineDesc = `Profit Factor of ${profitFactor} and ${winRate.toFixed(1)}% win rate proves your system works.`; }
    else if (netPnL < 0 && Number(rr) < 0.8) { headlineStatus = "losing"; headlineTitle = "Your math is working against you."; headlineDesc = `Avg loss $${avgLoss.toFixed(2)} vs avg win $${avgWin.toFixed(2)}. A 1:1.5 RR rule fixes this.`; }
    else if (netPnL > 0 && Number(rr) < 1) { headlineStatus = "break_even"; headlineTitle = "You are 'Trading for Free'."; headlineDesc = `${winRate.toFixed(1)}% win rate but negative R:R (1:${rr}) is the anchor.`; }

    const blindspots: AiReportData['blindspots'] = [];
    if (Number(rr) < 1) { blindspots.push({ title: "Negative Expectancy Math", severity: "critical", description: `Avg loss ($${avgLoss.toFixed(2)}) > avg win ($${avgWin.toFixed(2)}). Inverse R:R game.`, evidence: `R:R of 1:${rr}`, hardRule: "Close platform if trade reaches -1R." }); }
    if (losses.length > 3 && (biggestLoss < -(avgLoss * 2.5))) { blindspots.push({ title: "Account Wiper Tail Risk", severity: "critical", description: `1-2 outsized losses destroying weeks of progress.`, evidence: `Biggest loss $${Math.abs(biggestLoss).toFixed(2)} is ${(Math.abs(biggestLoss) / avgLoss).toFixed(1)}x avg.`, hardRule: "Hard stop loss on entry. Never move stop back." }); }
    if (winRate > 60 && Number(profitFactor) > 1.2) { blindspots.push({ title: "Failure to Capitalize", severity: "info", description: "Proven edge but not pressing it. Taking profit too early.", evidence: `Win rate ${winRate.toFixed(1)}% but avg win only $${avgWin.toFixed(2)}.`, hardRule: "Trail stops instead of fixed targets on next 10 wins." }); }
    if (blindspots.length === 0) { blindspots.push({ title: "Low Sample Size", severity: "warning", description: "Risk metrics look OK but sample size is vulnerable.", evidence: `${trades.length} total trades.`, hardRule: "Execute plan exactly for 50 more trades." }); }

    const worstTradesRaw = [...losses].sort((a, b) => a.net_profit - b.net_profit).slice(0, 3);
    const worstTrades = worstTradesRaw.map(t => ({ pair: t.symbol, direction: t.type, date: new Date(t.open_time).toLocaleDateString(), pnl: t.net_profit, whatWentWrong: "Stop loss ignored or oversized position due to emotional trigger.", lesson: "Always risk a fixed percentage. Never double down on a losing position." }));

    const recurringPatterns: AiReportData['recurringPatterns'] = [];
    let maxLossStreak = 0; let currentStreak = 0;
    sortedTradesDate.forEach(t => { if (t.net_profit < 0) { currentStreak++; maxLossStreak = Math.max(maxLossStreak, currentStreak); } else { currentStreak = 0; } });
    if (maxLossStreak >= 3) { recurringPatterns.push({ title: "Consecutive Loss Streaks", type: "danger", frequency: `${maxLossStreak} in a row`, description: `Losing streak of ${maxLossStreak} consecutive trades detected.`, impact: "Consider mandatory cooldown after 3 consecutive losses." }); }
    const symbolCounts: Record<string, number> = {};
    trades.forEach(t => { symbolCounts[t.symbol] = (symbolCounts[t.symbol] || 0) + 1; });
    const topSymbol = Object.entries(symbolCounts).sort((a, b) => b[1] - a[1])[0];
    if (topSymbol && topSymbol[1] / trades.length > 0.6) { recurringPatterns.push({ title: "Symbol Concentration", type: "neutral", frequency: `${((topSymbol[1] / trades.length) * 100).toFixed(0)}% of trades`, description: `${topSymbol[0]} dominates with ${topSymbol[1]}/${trades.length} trades.`, impact: "Diversify across 2-3 instruments to reduce risk." }); }
    const avgVolume = trades.reduce((a, b) => a + b.volume, 0) / trades.length;
    const oversizedTrades = trades.filter(t => t.volume > avgVolume * 2);
    if (oversizedTrades.length > 0) { recurringPatterns.push({ title: "Oversized Positions", type: "danger", frequency: `${oversizedTrades.length} trade(s)`, description: `${oversizedTrades.length} entries at >2x avg lot size.`, impact: "Standardize lot size to eliminate emotional variance." }); }
    if (longTrades.length > 2 && shortTrades.length > 2) {
        const longWR = (longWins.length / longTrades.length) * 100;
        const shortWR = (shortWins.length / shortTrades.length) * 100;
        if (Math.abs(longWR - shortWR) > 25) { const better = longWR > shortWR ? 'Long' : 'Short'; recurringPatterns.push({ title: `Strong ${better} Bias`, type: "positive", frequency: `${Math.abs(longWR - shortWR).toFixed(0)}% gap`, description: `Clear directional edge detected.`, impact: `Increase ${better} allocation.` }); }
    }
    if (recurringPatterns.length === 0) { recurringPatterns.push({ title: "No Patterns Yet", type: "neutral", frequency: "Insufficient data", description: "Keep journaling for deeper detection.", impact: "More data unlocks emotional & timing insights." }); }

    const actionPlan: AiReportData['actionPlan'] = [];
    if (Number(rr) < 1.2) { actionPlan.push({ title: "Adopt min 1:1.5 R:R.", priority: "Do this first", description: `Your ${winRate.toFixed(0)}% win rate with 1.5R yields more profit.`, measureSuccess: "Next 20 trades: Zero below 1.5 R:R." }); }
    if (biggestLoss < -(avgLoss * 2)) { actionPlan.push({ title: "Standardize position sizing.", priority: "Important", description: `Eliminate -$${Math.abs(biggestLoss).toFixed(2)} outlier.`, measureSuccess: "1-2% risk per trade for 14 days." }); }
    if (actionPlan.length === 0) { actionPlan.push({ title: "Keep doing what you're doing.", priority: "Do this first", description: "Positive expectancy. Don't change strategy.", measureSuccess: "Journal psychological state before every entry." }); }

    return {
        headline: { title: headlineTitle, description: headlineDesc, status: headlineStatus },
        summary: { totalReturn: parseFloat(netPnL.toFixed(2)), trades: trades.length, winRate: parseFloat(winRate.toFixed(1)), profitFactor: parseFloat(Number(profitFactor).toFixed(2)), biggestWin: parseFloat(biggestWin.toFixed(2)), biggestLoss: parseFloat(biggestLoss.toFixed(2)), riskReward: `1:${rr}`, averageHold: "2h 15m" },
        distribution: { winningTrades: wins.length, losingTrades: losses.length, netPnL: parseFloat(netPnL.toFixed(2)) },
        longVsShort: { longWinRate: longTrades.length > 0 ? parseFloat(((longWins.length / longTrades.length) * 100).toFixed(1)) : 0, shortWinRate: shortTrades.length > 0 ? parseFloat(((shortWins.length / shortTrades.length) * 100).toFixed(1)) : 0, longPnL: parseFloat(longTrades.reduce((a, b) => a + b.net_profit, 0).toFixed(2)), shortPnL: parseFloat(shortTrades.reduce((a, b) => a + b.net_profit, 0).toFixed(2)), longTrades: longTrades.length, shortTrades: shortTrades.length },
        dayOfWeek: { bestDay: bestDayObj?.day ?? "N/A", worstDay: worstDayObj?.day ?? "N/A", data: validDays },
        trend, blindspots, recurringPatterns, worstTrades, actionPlan: actionPlan.slice(0, 3)
    };
};

// --- Panel Component ---
interface AiReportPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const AiReportPanel: React.FC<AiReportPanelProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [isGenerating, setIsGenerating] = useState(false);
    const [report, setReport] = useState<AiReportData | null>(null);
    const [rawTrades, setRawTrades] = useState<Trade[]>([]);

    useEffect(() => {
        if (isOpen && user?.user_id) {
            const fetchTrades = async () => {
                try {
                    const response = await api.get(`/trades/user/${user.user_id}`);
                    setRawTrades(response.data);
                } catch (error) { console.error("Error fetching trades for AI:", error); }
            };
            fetchTrades();
        }
    }, [isOpen, user?.user_id]);

    const handleGenerate = () => {
        if (rawTrades.length === 0) { toast.error("No trades found. Log trades first."); return; }
        setIsGenerating(true);
        setTimeout(() => {
            setReport(generateAiInsights(rawTrades));
            setIsGenerating(false);
            toast.success("AI Report Generated!", { icon: <BrainCircuit className="w-4 h-4 text-primary" /> });
        }, 2500);
    };

    const getSeverityStyles = (s: string) => {
        switch (s) {
            case "critical": return "border-red-500/30 bg-red-500/5";
            case "warning": return "border-amber-500/30 bg-amber-500/5";
            case "info": return "border-blue-500/30 bg-blue-500/5";
            default: return "border-white/10 bg-white/5";
        }
    };

    const getPriorityStyles = (p: string) => {
        switch (p) {
            case "Do this first": return "text-red-500 border-red-500/50 bg-red-500/5";
            case "Important": return "text-amber-500 border-amber-500/50 bg-amber-500/5";
            default: return "text-blue-500 border-blue-500/50 bg-blue-500/5";
        }
    };

    // Sections for tab navigation within panel
    const [activeSection, setActiveSection] = useState<'overview' | 'blindspots' | 'patterns' | 'trades' | 'action'>('overview');

    const sections = [
        { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
        { id: 'blindspots' as const, label: 'Blindspots', icon: ShieldAlert },
        { id: 'patterns' as const, label: 'Patterns', icon: Activity },
        { id: 'trades' as const, label: 'Worst Trades', icon: TrendingDown },
        { id: 'action' as const, label: 'Action Plan', icon: Target },
    ];

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:bg-transparent lg:backdrop-blur-none" onClick={onClose} />
            )}

            {/* Panel */}
            <div
                className={cn(
                    "fixed top-0 right-0 h-full z-[70] bg-[#0a0a0f] border-l border-white/10 shadow-[-20px_0_60px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out flex flex-col",
                    "w-full sm:w-[520px]",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Panel Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0a0a0f]/90 backdrop-blur-xl flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                            <BrainCircuit className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-base tracking-tight">AI Report</h2>
                            <span className="text-[10px] text-muted-foreground font-mono">{rawTrades.length} trades synced</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Generate State or Report */}
                {!report ? (
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="text-center space-y-6 max-w-xs">
                            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <BrainCircuit className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg mb-2">Generate Intelligence Report</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">Analyze your {rawTrades.length} trades to uncover blindspots, patterns, and actionable insights.</p>
                            </div>
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || rawTrades.length === 0}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(11,102,228,0.3)]"
                            >
                                {isGenerating ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                                ) : (
                                    <><Zap className="w-4 h-4 mr-2" /> Generate Report</>
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Section Tabs */}
                        <div className="flex gap-1 px-3 py-2 border-b border-white/5 bg-[#08080c] overflow-x-auto flex-shrink-0 scrollbar-hide">
                            {sections.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setActiveSection(s.id)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold tracking-tight whitespace-nowrap transition-all",
                                        activeSection === s.id
                                            ? "bg-primary/10 text-primary border border-primary/20"
                                            : "text-muted-foreground hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <s.icon className="w-3.5 h-3.5" />
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">

                            {/* OVERVIEW */}
                            {activeSection === 'overview' && (
                                <div className="space-y-4">
                                    {/* Headline */}
                                    <div className={cn("rounded-xl p-4 border",
                                        report.headline.status === 'profitable' ? 'border-emerald-500/20 bg-emerald-500/5' :
                                            report.headline.status === 'losing' ? 'border-red-500/20 bg-red-500/5' : 'border-amber-500/20 bg-amber-500/5'
                                    )}>
                                        <h3 className="text-white font-bold text-base mb-1">{report.headline.title}</h3>
                                        <p className="text-muted-foreground text-xs leading-relaxed">{report.headline.description}</p>
                                    </div>

                                    {/* Key Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: "Net P/L", value: `$${report.summary.totalReturn.toFixed(2)}`, color: report.summary.totalReturn >= 0 ? 'text-emerald-500' : 'text-red-500', icon: DollarSign },
                                            { label: "Win Rate", value: `${report.summary.winRate}%`, color: report.summary.winRate >= 50 ? 'text-emerald-500' : 'text-red-500', icon: Crosshair },
                                            { label: "Profit Factor", value: `${report.summary.profitFactor}`, color: report.summary.profitFactor >= 1.5 ? 'text-emerald-500' : 'text-amber-500', icon: BarChart3 },
                                            { label: "R:R Ratio", value: report.summary.riskReward, color: 'text-white', icon: Target },
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-[#111116] border border-white/5 rounded-xl p-3">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <stat.icon className="w-3 h-3 text-muted-foreground" />
                                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{stat.label}</span>
                                                </div>
                                                <span className={cn("text-lg font-black tracking-tight", stat.color)}>{stat.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Long vs Short */}
                                    <div className="bg-[#111116] border border-white/5 rounded-xl p-4">
                                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3">Long vs Short</div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex-1">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-emerald-500 font-bold flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> Long</span>
                                                    <span className="text-white font-bold">{report.longVsShort.longWinRate}%</span>
                                                </div>
                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all" style={{ width: `${report.longVsShort.longWinRate}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-orange-500 font-bold flex items-center gap-1"><ArrowDownRight className="w-3 h-3" /> Short</span>
                                                    <span className="text-white font-bold">{report.longVsShort.shortWinRate}%</span>
                                                </div>
                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all" style={{ width: `${report.longVsShort.shortWinRate}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Day of Week */}
                                    <div className="bg-[#111116] border border-white/5 rounded-xl p-4">
                                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3">Day Performance</div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                                                <div className="text-[9px] text-emerald-500 font-bold uppercase mb-1">Best Day</div>
                                                <div className="text-white font-black">{report.dayOfWeek.bestDay}</div>
                                            </div>
                                            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                                                <div className="text-[9px] text-red-500 font-bold uppercase mb-1">Worst Day</div>
                                                <div className="text-white font-black">{report.dayOfWeek.worstDay}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* BLINDSPOTS */}
                            {activeSection === 'blindspots' && (
                                <div className="space-y-3">
                                    {report.blindspots.map((spot, idx) => (
                                        <div key={idx} className={cn("rounded-xl p-4 border", getSeverityStyles(spot.severity))}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={cn("text-[9px] px-2 py-0.5 rounded-full border uppercase font-black",
                                                    spot.severity === 'critical' ? 'border-red-500/50 text-red-500' :
                                                        spot.severity === 'warning' ? 'border-amber-500/50 text-amber-500' : 'border-blue-500/50 text-blue-500'
                                                )}>{spot.severity}</span>
                                            </div>
                                            <h4 className="text-white font-bold text-sm mb-1">{spot.title}</h4>
                                            <p className="text-muted-foreground text-xs leading-relaxed mb-3">{spot.description}</p>
                                            <div className="space-y-2">
                                                <div className="bg-black/30 rounded-lg p-2.5 text-[11px]">
                                                    <span className="font-bold text-red-900/60 uppercase tracking-wider block mb-0.5">Evidence</span>
                                                    <span className="text-white/80">{spot.evidence}</span>
                                                </div>
                                                <div className="bg-black/30 rounded-lg p-2.5 text-[11px]">
                                                    <span className="font-bold text-white/40 uppercase tracking-wider flex items-center gap-1 mb-0.5"><BrainCircuit className="w-3 h-3" /> Hard Rule</span>
                                                    <span className="text-white font-semibold">{spot.hardRule}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* PATTERNS */}
                            {activeSection === 'patterns' && (
                                <div className="space-y-3">
                                    {report.recurringPatterns.map((p, idx) => (
                                        <div key={idx} className={cn("rounded-xl p-4 border",
                                            p.type === 'danger' ? 'border-red-500/20 bg-red-500/5' :
                                                p.type === 'positive' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/10 bg-white/[0.02]'
                                        )}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={cn("text-[9px] px-2 py-0.5 rounded-full border uppercase font-black",
                                                    p.type === 'danger' ? 'border-red-500/30 text-red-500' :
                                                        p.type === 'positive' ? 'border-emerald-500/30 text-emerald-500' : 'border-white/20 text-white/60'
                                                )}>{p.type}</span>
                                                <span className="text-[10px] text-muted-foreground font-medium">{p.frequency}</span>
                                            </div>
                                            <h4 className="text-white font-bold text-sm mb-1">{p.title}</h4>
                                            <p className="text-muted-foreground text-xs leading-relaxed mb-3">{p.description}</p>
                                            <div className="bg-black/30 rounded-lg p-2.5 text-[11px]">
                                                <span className="font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1 mb-0.5"><Zap className="w-3 h-3" /> Impact</span>
                                                <span className="text-white/80">{p.impact}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* WORST TRADES */}
                            {activeSection === 'trades' && (
                                <div className="space-y-3">
                                    {report.worstTrades.length === 0 ? (
                                        <div className="py-8 text-center text-muted-foreground text-sm">No significant losses found.</div>
                                    ) : report.worstTrades.map((t, idx) => (
                                        <div key={idx} className="bg-[#111116] border border-white/5 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white font-bold">{t.pair}</span>
                                                    <span className={cn("text-[8px] px-2 py-0.5 rounded border uppercase font-black",
                                                        t.direction.toLowerCase() === 'buy' ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' : 'bg-orange-500/10 text-orange-500 border-orange-500/30'
                                                    )}>{t.direction}</span>
                                                </div>
                                                <span className="text-red-500 font-black">-${Math.abs(t.pnl).toFixed(2)}</span>
                                            </div>
                                            <div className="space-y-2">
                                                <div>
                                                    <div className="text-[9px] uppercase text-red-900/50 font-black mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> What Went Wrong</div>
                                                    <p className="text-white/80 text-xs leading-relaxed">{t.whatWentWrong}</p>
                                                </div>
                                                <div>
                                                    <div className="text-[9px] uppercase text-emerald-500 font-black mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Lesson</div>
                                                    <p className="text-emerald-500 text-xs leading-relaxed">{t.lesson}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ACTION PLAN */}
                            {activeSection === 'action' && (
                                <div className="space-y-3">
                                    {report.actionPlan.map((step, idx) => (
                                        <div key={idx} className="bg-[#111116] border border-white/10 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/50">
                                                    {idx + 1}
                                                </div>
                                                <span className={cn("text-[8px] uppercase font-black px-2 py-0.5 rounded border", getPriorityStyles(step.priority))}>
                                                    {step.priority}
                                                </span>
                                            </div>
                                            <h4 className="text-white font-bold text-sm mb-1.5">{step.title}</h4>
                                            <p className="text-muted-foreground text-xs leading-relaxed mb-3">{step.description}</p>
                                            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-2.5">
                                                <span className="text-[8px] font-black uppercase text-emerald-500 flex items-center gap-1 mb-0.5">
                                                    <PlayCircle className="w-3 h-3" /> Success Criteria
                                                </span>
                                                <span className="text-white text-xs font-semibold">{step.measureSuccess}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Regenerate Footer */}
                        <div className="px-4 py-3 border-t border-white/5 bg-[#08080c] flex-shrink-0">
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                variant="ghost"
                                className="w-full text-muted-foreground hover:text-white text-xs font-bold"
                            >
                                {isGenerating ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <BrainCircuit className="w-3 h-3 mr-2" />}
                                Regenerate Report
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default AiReportPanel;
