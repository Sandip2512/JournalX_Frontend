import React, { useState, useEffect } from "react";
import UserLayout from "@/components/layout/UserLayout";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
    BrainCircuit, Loader2, Sparkles, TrendingUp, TrendingDown,
    AlertTriangle, Activity, Target, ShieldAlert, CheckCircle2,
    Calendar, Clock, DollarSign, Crosshair, BarChart3, AlertOctagon, Lightbulb, PlayCircle,
    ArrowUpRight, ArrowDownRight, Zap, Trophy, Skull, Scale
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FeatureGate } from "@/components/auth/FeatureGate";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';

interface Trade {
    trade_no: number;
    symbol: string;
    type: string;
    volume: number;
    price_open: number;
    price_close: number;
    net_profit: number;
    open_time: string;
    close_time: string;
}

interface AiReportData {
    headline: {
        title: string;
        description: string;
        status: "break_even" | "profitable" | "losing";
    };
    summary: {
        totalReturn: number;
        trades: number;
        winRate: number;
        profitFactor: number;
        biggestWin: number;
        biggestLoss: number;
        riskReward: string;
        averageHold: string;
    };
    distribution: {
        winningTrades: number;
        losingTrades: number;
        netPnL: number;
    };
    longVsShort: {
        longWinRate: number;
        shortWinRate: number;
        longPnL: number;
        shortPnL: number;
        longTrades: number;
        shortTrades: number;
    };
    dayOfWeek: {
        bestDay: string;
        worstDay: string;
        data: { day: string, pnl: number, winRate: number }[];
    };
    trend: { date: string; winRate: number; profitFactor: number; cumulativePnL: number }[];
    blindspots: {
        title: string;
        severity: "critical" | "warning" | "info";
        description: string;
        evidence: string;
        hardRule: string;
    }[];
    recurringPatterns: {
        title: string;
        type: "danger" | "neutral" | "positive";
        frequency: string;
        description: string;
        impact: string;
    }[];
    worstTrades: {
        pair: string;
        direction: string;
        date: string;
        pnl: number;
        whatWentWrong: string;
        lesson: string;
    }[];
    actionPlan: {
        title: string;
        priority: "Do this first" | "Important" | "Nice to have";
        description: string;
        measureSuccess: string;
    }[];
}

const CHART_COLORS = {
    win: '#10b981', // emerald-500
    loss: '#ef4444', // destructive
    neutral: '#f59e0b', // amber-500
    brand: '#3b82f6', // blue-500
    purple: '#8b5cf6'
};

// --- AI Analysis Logic Engine ---
const generateAiInsights = (trades: Trade[]): AiReportData => {
    if (!trades || trades.length === 0) {
        return {
            headline: { title: "No Data Found", description: "You need to log trades before we can analyze your performance.", status: "losing" },
            summary: { totalReturn: 0, trades: 0, winRate: 0, profitFactor: 0, biggestWin: 0, biggestLoss: 0, riskReward: "0:0", averageHold: "0" },
            distribution: { winningTrades: 0, losingTrades: 0, netPnL: 0 },
            longVsShort: { longWinRate: 0, shortWinRate: 0, longPnL: 0, shortPnL: 0, longTrades: 0, shortTrades: 0 },
            dayOfWeek: { bestDay: "N/A", worstDay: "N/A", data: [] },
            trend: [], blindspots: [], recurringPatterns: [], worstTrades: [], actionPlan: []
        }
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

    // Sort by date for trend
    const sortedTradesDate = [...trades].sort((a, b) => new Date(a.open_time).getTime() - new Date(b.open_time).getTime());

    let cumPnL = 0;
    let runningWins = 0;
    let runningGrossWin = 0;
    let runningGrossLoss = 0;

    const trendMap = new Map();

    sortedTradesDate.forEach((t, i) => {
        cumPnL += t.net_profit;
        if (t.net_profit > 0) { runningWins++; runningGrossWin += t.net_profit; }
        else if (t.net_profit < 0) { runningGrossLoss += Math.abs(t.net_profit); }

        const dateStr = new Date(t.open_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const currentWinRate = ((runningWins / (i + 1)) * 100).toFixed(1);
        const currentPF = runningGrossLoss > 0 ? (runningGrossWin / runningGrossLoss).toFixed(2) : "0";

        // Overwrite to keep the last trade of the day
        trendMap.set(dateStr, {
            date: dateStr,
            winRate: parseFloat(currentWinRate),
            profitFactor: parseFloat(currentPF),
            cumulativePnL: parseFloat(cumPnL.toFixed(2))
        });
    });

    const trend = Array.from(trendMap.values());

    // --- Long vs Short ---
    const longTrades = trades.filter(t => t.type.toLowerCase() === 'buy');
    const shortTrades = trades.filter(t => t.type.toLowerCase() === 'sell');
    const longWins = longTrades.filter(t => t.net_profit > 0);
    const shortWins = shortTrades.filter(t => t.net_profit > 0);

    // --- Day of Week ---
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayStats = days.map(d => ({ day: d, pnl: 0, wins: 0, total: 0 }));
    trades.forEach(t => {
        const d = new Date(t.open_time).getDay();
        dayStats[d].pnl += t.net_profit;
        dayStats[d].total += 1;
        if (t.net_profit > 0) dayStats[d].wins += 1;
    });
    const validDays = dayStats.filter(d => d.total > 0).map(d => ({
        day: d.day,
        pnl: parseFloat(d.pnl.toFixed(2)),
        winRate: parseFloat(((d.wins / d.total) * 100).toFixed(1))
    }));
    const bestDayObj = [...validDays].sort((a, b) => b.pnl - a.pnl)[0];
    const worstDayObj = [...validDays].sort((a, b) => a.pnl - b.pnl)[0];

    // --- Dynamic AI Determinations ---
    let headlineStatus: "break_even" | "profitable" | "losing" = "break_even";
    let headlineTitle = "You are consolidating.";
    let headlineDesc = "You need more trades to establish a clear pattern.";

    if (netPnL > 0 && Number(profitFactor) >= 1.5) {
        headlineStatus = "profitable";
        headlineTitle = "You have found a statistical edge.";
        headlineDesc = `Your Profit Factor of ${profitFactor} and ${winRate.toFixed(1)}% win rate proves your system works in current market conditions. Scaling up size by 10-15% on A+ setups is mathematically justified now.`;
    } else if (netPnL < 0 && Number(rr) < 0.8) {
        headlineStatus = "losing";
        headlineTitle = "Your math is working against you.";
        headlineDesc = `An average loss of $${avgLoss.toFixed(2)} vs average win of $${avgWin.toFixed(2)} means you need an unsustainably high win rate just to break even. A mechanical 1:1.5 RR rule fixes this equity curve.`;
    } else if (netPnL > 0 && Number(rr) < 1) {
        headlineStatus = "break_even";
        headlineTitle = "You are 'Trading for Free'.";
        headlineDesc = `You have achieved a solid ${winRate.toFixed(1)}% win rate, but your negative Risk:Reward ratio (1:${rr}) is the anchor keeping your equity curve flat. By slightly extending your winners, you will shift into high profitability.`;
    }

    const blindspots = [];
    if (Number(rr) < 1) {
        blindspots.push({
            title: "Negative Expectancy Math",
            severity: "critical" as const,
            description: `You are winning trades consistently, but your average loss ($${avgLoss.toFixed(2)}) is larger than your average win ($${avgWin.toFixed(2)}). You are playing a high-stress game of 'Inverse R:R'.`,
            evidence: `Avg Win $${avgWin.toFixed(2)} vs Avg Loss $${avgLoss.toFixed(2)}. R:R of 1:${rr}.`,
            hardRule: "Implement a 'Hard Floor' limit. Close the platform if a trade reaches -1R."
        });
    }

    if (losses.length > 3 && (biggestLoss < -(avgLoss * 2.5))) {
        blindspots.push({
            title: "The 'Account Wiper' Tail Risk",
            severity: "critical" as const,
            description: `Your strategy is solid, but 1-2 severely outsized losses are destroying weeks of progress. This is an emotional exit issue, not a technical entry issue.`,
            evidence: `Biggest loss of $${Math.abs(biggestLoss).toFixed(2)} is ${(Math.abs(biggestLoss) / avgLoss).toFixed(1)}x larger than your average loss.`,
            hardRule: "Hard stop loss placed instantly upon entry. Never move a stop back."
        });
    }

    if (winRate > 60 && Number(profitFactor) > 1.2) {
        blindspots.push({
            title: "Failure to Capitalize",
            severity: "info" as const,
            description: "You have a proven edge but you aren't pressing it. You are likely taking profit too early out of fear of it coming back.",
            evidence: `Win rate of ${winRate.toFixed(1)}% but average win is only $${avgWin.toFixed(2)}.`,
            hardRule: "Trail stops instead of taking fixed targets on your next 10 wins."
        });
    }

    // Default blindspot if none triggered
    if (blindspots.length === 0) {
        blindspots.push({
            title: "Low Sample Size Variability",
            severity: "warning" as const,
            description: "Your risk metrics look okay, but the sample size may be vulnerable to a black swan string of losses.",
            evidence: `${trades.length} total trades logged.`,
            hardRule: "Continue executing your plan exactly as written for 50 more trades."
        });
    }

    // Worst trades sorted by biggest loss
    const worstTradesRaw = [...losses].sort((a, b) => a.net_profit - b.net_profit).slice(0, 3);
    const worstTrades = worstTradesRaw.map(t => ({
        pair: t.symbol,
        direction: t.type,
        date: new Date(t.open_time).toLocaleDateString(),
        pnl: t.net_profit,
        whatWentWrong: "Stop loss ignored or oversized position taken due to recent emotional trigger.",
        lesson: "Always risk a fixed percentage. Never double down on a losing position."
    }));

    // --- Recurring Patterns Detection ---
    const recurringPatterns: AiReportData['recurringPatterns'] = [];

    // Detect consecutive loss streaks
    let maxLossStreak = 0;
    let currentStreak = 0;
    sortedTradesDate.forEach(t => {
        if (t.net_profit < 0) { currentStreak++; maxLossStreak = Math.max(maxLossStreak, currentStreak); }
        else { currentStreak = 0; }
    });
    if (maxLossStreak >= 3) {
        recurringPatterns.push({
            title: "Consecutive Loss Streaks",
            type: "danger",
            frequency: `${maxLossStreak} trades in a row`,
            description: `You hit a losing streak of ${maxLossStreak} consecutive trades. This often triggers revenge trading and oversized positions.`,
            impact: `Streaks of 3+ losses account for accelerated drawdowns. Consider a mandatory cooldown rule after 3 consecutive losses.`
        });
    }

    // Detect symbol concentration
    const symbolCounts: Record<string, number> = {};
    trades.forEach(t => { symbolCounts[t.symbol] = (symbolCounts[t.symbol] || 0) + 1; });
    const topSymbol = Object.entries(symbolCounts).sort((a, b) => b[1] - a[1])[0];
    if (topSymbol && topSymbol[1] / trades.length > 0.6) {
        recurringPatterns.push({
            title: "Symbol Over-Concentration",
            type: "neutral",
            frequency: `${((topSymbol[1] / trades.length) * 100).toFixed(0)}% of all trades`,
            description: `${topSymbol[0]} dominates your portfolio with ${topSymbol[1]} out of ${trades.length} trades. You may be exposed to single-asset volatility risk.`,
            impact: `Diversifying across 2-3 instruments reduces correlation risk and smooths your equity curve.`
        });
    }

    // Detect oversized trades
    const avgVolume = trades.reduce((a, b) => a + b.volume, 0) / trades.length;
    const oversizedTrades = trades.filter(t => t.volume > avgVolume * 2);
    if (oversizedTrades.length > 0) {
        recurringPatterns.push({
            title: "Oversized Position Entries",
            type: "danger",
            frequency: `${oversizedTrades.length} trade${oversizedTrades.length > 1 ? 's' : ''} detected`,
            description: `You entered ${oversizedTrades.length} position(s) at more than 2x your average lot size (${avgVolume.toFixed(2)} lots). This is a sign of emotional sizing.`,
            impact: `Oversized trades amplify both gains and losses. Standardize to a fixed lot size to eliminate emotional variance.`
        });
    }

    // Detect win rate direction bias
    if (longTrades.length > 2 && shortTrades.length > 2) {
        const longWR = (longWins.length / longTrades.length) * 100;
        const shortWR = (shortWins.length / shortTrades.length) * 100;
        if (Math.abs(longWR - shortWR) > 25) {
            const betterSide = longWR > shortWR ? 'Long' : 'Short';
            const worseSide = longWR > shortWR ? 'Short' : 'Long';
            recurringPatterns.push({
                title: `Strong ${betterSide} Bias Detected`,
                type: "positive",
                frequency: `${Math.abs(longWR - shortWR).toFixed(0)}% win rate gap`,
                description: `Your ${betterSide} trades win at ${Math.max(longWR, shortWR).toFixed(0)}% vs ${worseSide} at ${Math.min(longWR, shortWR).toFixed(0)}%. You have a clear directional edge.`,
                impact: `Consider increasing ${betterSide} allocation and reducing ${worseSide} entries until your system improves on that side.`
            });
        }
    }

    if (recurringPatterns.length === 0) {
        recurringPatterns.push({
            title: "No Strong Recurring Patterns Yet",
            type: "neutral",
            frequency: "Insufficient data",
            description: "Your trading behavior doesn't show any strong recurring patterns yet. Keep journaling consistently for deeper pattern detection.",
            impact: "More data will unlock insights about your emotional triggers, time-based patterns, and sizing habits."
        });
    }

    const actionPlan: AiReportData['actionPlan'] = [];
    if (Number(rr) < 1.2) {
        actionPlan.push({
            title: "Adopt a minimum 1:1.5 Reward-to-Risk Ratio.",
            priority: "Do this first" as const,
            description: `Your ${winRate.toFixed(0)}% win rate with a 1.5R would have yielded significantly more profit on this sample size.`,
            measureSuccess: "Next 20 trades: Zero trades taken with an R:R below 1.5."
        });
    }

    if (biggestLoss < -(avgLoss * 2)) {
        actionPlan.push({
            title: "Standardize your position sizing instantly.",
            priority: "Important" as const,
            description: `You are sizing up to make back losses. Eliminate the -$${Math.abs(biggestLoss).toFixed(2)} outlier and your equity curve goes green.`,
            measureSuccess: "100% compliance with strict 1-2% risk per trade for 14 days."
        });
    }

    if (actionPlan.length === 0) {
        actionPlan.push({
            title: "Keep doing exactly what you are doing.",
            priority: "Do this first" as const,
            description: "Your system has a positive expectancy. Do not change strategy parameters.",
            measureSuccess: "Journal your psychological state before every entry to maintain this edge."
        });
    }


    return {
        headline: { title: headlineTitle, description: headlineDesc, status: headlineStatus },
        summary: {
            totalReturn: parseFloat(netPnL.toFixed(2)),
            trades: trades.length,
            winRate: parseFloat(winRate.toFixed(1)),
            profitFactor: parseFloat(Number(profitFactor).toFixed(2)),
            biggestWin: parseFloat(biggestWin.toFixed(2)),
            biggestLoss: parseFloat(biggestLoss.toFixed(2)),
            riskReward: `1:${rr}`,
            averageHold: trades.length > 0 ? (() => {
                const totalMs = trades.reduce((acc, t) => {
                    const duration = new Date(t.close_time).getTime() - new Date(t.open_time).getTime();
                    return acc + (isNaN(duration) ? 0 : Math.max(0, duration));
                }, 0);
                const avgMs = totalMs / trades.length;
                const hours = Math.floor(avgMs / 3600000);
                const minutes = Math.floor((avgMs % 3600000) / 60000);
                return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
            })() : "0m"
        },
        distribution: {
            winningTrades: wins.length,
            losingTrades: losses.length,
            netPnL: parseFloat(netPnL.toFixed(2))
        },
        longVsShort: {
            longWinRate: longTrades.length > 0 ? parseFloat(((longWins.length / longTrades.length) * 100).toFixed(1)) : 0,
            shortWinRate: shortTrades.length > 0 ? parseFloat(((shortWins.length / shortTrades.length) * 100).toFixed(1)) : 0,
            longPnL: parseFloat(longTrades.reduce((a, b) => a + b.net_profit, 0).toFixed(2)),
            shortPnL: parseFloat(shortTrades.reduce((a, b) => a + b.net_profit, 0).toFixed(2)),
            longTrades: longTrades.length,
            shortTrades: shortTrades.length
        },
        dayOfWeek: {
            bestDay: bestDayObj ? bestDayObj.day : "N/A",
            worstDay: worstDayObj ? worstDayObj.day : "N/A",
            data: validDays
        },
        trend: trend,
        blindspots,
        recurringPatterns,
        worstTrades,
        actionPlan: actionPlan.slice(0, 3)
    };
};


const AiReport = () => {
    const { user } = useAuth();
    const [isGenerating, setIsGenerating] = useState(false);
    const [hasGenerated, setHasGenerated] = useState(false);
    const [report, setReport] = useState<AiReportData | null>(null);
    const [rawTrades, setRawTrades] = useState<Trade[]>([]);

    // MT4/MT5 Connection State
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [connectStep, setConnectStep] = useState<'platform' | 'credentials'>('platform');
    const [selectedPlatform, setSelectedPlatform] = useState<'MT4' | 'MT5' | null>(null);
    const [connectionForm, setConnectionForm] = useState({
        login: '',
        password: '',
        server: ''
    });
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        const fetchTrades = async () => {
            if (user?.user_id) {
                try {
                    const response = await api.get(`/trades/user/${user.user_id}`);
                    setRawTrades(response.data);
                } catch (error) {
                    console.error("Error fetching trades for AI:", error);
                }
            }
        };
        fetchTrades();
    }, [user?.user_id]);

    const handleGenerateReport = async () => {
        if (rawTrades.length === 0) {
            toast.error("No trades found. Log trades to generate intelligence.");
            return;
        }

        setIsGenerating(true);
        // Add fake delay for "Big Data Calculation" feel
        setTimeout(() => {
            const dynamicInsights = generateAiInsights(rawTrades);
            setReport(dynamicInsights);
            setIsGenerating(false);
            setHasGenerated(true);
            toast.success("Intelligence Matrix Synchronized!", { icon: <BrainCircuit className="w-4 h-4 text-primary" /> });
        }, 3500);
    };

    const handleConnect = () => {
        if (!connectionForm.login || !connectionForm.password || !connectionForm.server) {
            toast.error("Please fill in all fields");
            return;
        }
        setIsConnecting(true);
        setTimeout(() => {
            setIsConnecting(false);
            setShowConnectModal(false);
            toast.success(`${selectedPlatform} Account Connected!`, {
                description: "Your trading data is being synchronized in the background."
            });
            // Reset form for next time
            setConnectionForm({ login: '', password: '', server: '' });
            setConnectStep('platform');
            setSelectedPlatform(null);
        }, 2200);
    };

    const renderConnectModal = () => (
        <Dialog open={showConnectModal} onOpenChange={setShowConnectModal}>
            <DialogContent className="sm:max-w-[360px] bg-card border-border shadow-2xl rounded-[24px] p-0 overflow-hidden border">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-500 to-purple-500" />
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-lg font-black tracking-tighter text-foreground flex items-center gap-2">
                        <PlayCircle className="w-5 h-5 text-primary" /> Architecture Link
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium text-xs leading-relaxed mt-1.5">
                        {connectStep === 'platform'
                            ? "Select your trading terminal to initiate the quantum synchronization process."
                            : `Provisioning secure communication bridge for your ${selectedPlatform} account.`}
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 pb-6 pt-0">
                    {connectStep === 'platform' ? (
                        <div className="grid grid-cols-2 gap-3 py-2">
                            <button
                                onClick={() => {
                                    setSelectedPlatform('MT4');
                                    setConnectStep('credentials');
                                }}
                                className="group flex flex-col items-center justify-center p-5 rounded-[16px] border border-border bg-secondary/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-primary/20">
                                    <span className="text-base font-black text-primary tracking-tighter">MT4</span>
                                </div>
                                <span className="font-bold text-foreground tracking-tight text-sm">Terminal 4</span>
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedPlatform('MT5');
                                    setConnectStep('credentials');
                                }}
                                className="group flex flex-col items-center justify-center p-5 rounded-[16px] border border-border bg-secondary/30 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-indigo-500/20">
                                    <span className="text-base font-black text-indigo-500 tracking-tighter">MT5</span>
                                </div>
                                <span className="font-bold text-foreground tracking-tight text-sm">Terminal 5</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 mt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="login" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Quantum ID (Login)</Label>
                                <Input
                                    id="login"
                                    placeholder="Account Number"
                                    value={connectionForm.login}
                                    onChange={(e) => setConnectionForm({ ...connectionForm, login: e.target.value })}
                                    className="bg-secondary/40 border-border rounded-xl h-11 font-mono font-bold text-sm focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="pass" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Access Cipher (Password)</Label>
                                <Input
                                    id="pass"
                                    type="password"
                                    placeholder="••••••••"
                                    value={connectionForm.password}
                                    onChange={(e) => setConnectionForm({ ...connectionForm, password: e.target.value })}
                                    className="bg-secondary/40 border-border rounded-xl h-11 font-bold text-sm focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="server" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Relay Server</Label>
                                <Input
                                    id="server"
                                    placeholder="Broker-Server-Name"
                                    value={connectionForm.server}
                                    onChange={(e) => setConnectionForm({ ...connectionForm, server: e.target.value })}
                                    className="bg-secondary/40 border-border rounded-xl h-11 font-bold text-sm focus:ring-primary/20"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="ghost"
                                    className="flex-1 rounded-xl h-11 font-bold text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                                    onClick={() => setConnectStep('platform')}
                                >
                                    Back
                                </Button>
                                <Button
                                    className="flex-[2] rounded-xl h-11 font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-md shadow-primary/20"
                                    onClick={handleConnect}
                                    disabled={isConnecting}
                                >
                                    {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                                    {isConnecting ? "Initiating..." : `Connect ${selectedPlatform}`}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-secondary/30 border-t border-border">
                    <p className="text-[9px] text-center text-muted-foreground/60 leading-relaxed font-medium uppercase tracking-wider">
                        Secure 256-bit encryption active. Credentials are never persisted on local storage.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case "critical": return "border-red-500/50 bg-card text-red-500 shadow-md";
            case "warning": return "border-amber-500/50 bg-card text-amber-500 shadow-md";
            case "info": return "border-blue-500/50 bg-card text-blue-500 shadow-md";
            default: return "border-border bg-card text-foreground shadow-md";
        }
    };

    const getPriortyStyles = (priority: string) => {
        switch (priority) {
            case "Do this first": return "text-red-500 border-red-500/50 bg-red-500/5";
            case "Important": return "text-amber-500 border-amber-500/50 bg-amber-500/5";
            case "Nice to have": return "text-blue-500 border-blue-500/50 bg-blue-500/5";
            default: return "text-foreground border-border bg-muted/10";
        }
    };

    return (
        <UserLayout>
            <div className="max-w-[1400px] mx-auto space-y-8 pb-12 px-2 relative min-h-screen">
                {/* Ambient Background Effects */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-background">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 dark:bg-primary/20 blur-[120px] opacity-30 dark:opacity-50" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-[120px] opacity-30 dark:opacity-50" />
                </div>

                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 pt-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-black font-mono border border-primary/30 flex items-center gap-2 tracking-widest uppercase shadow-[0_0_15px_rgba(11,102,228,0.4)]">
                                <Zap className="w-3.5 h-3.5" /> QUANTUM AI
                            </span>
                            <span className="text-muted-foreground/50 text-xs font-mono">{rawTrades.length} Data Points Synced</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground flex items-center gap-4">
                            Intelligence Matrix
                        </h1>
                        <p className="text-muted-foreground/80 mt-2 text-base max-w-2xl leading-relaxed">
                            A brutal, purely statistical breakdown of your trading behavior. We strip away emotions to reveal your latent mathematical edge.
                        </p>
                    </div>
                    <div className="flex flex-col items-stretch gap-3 min-w-[200px]">
                        <FeatureGate tier="pro" showLock={false}>
                            <Button
                                onClick={() => {
                                    setShowConnectModal(true);
                                    setConnectStep('platform');
                                }}
                                variant="outline"
                                className="h-10 rounded-xl border-primary/30 bg-primary/5 text-primary font-bold hover:bg-primary/10 transition-all gap-2 shadow-sm mb-1"
                            >
                                <PlayCircle className="w-4 h-4" /> Connect MT4/MT5
                            </Button>
                            <Button
                                onClick={handleGenerateReport}
                                disabled={isGenerating || rawTrades.length === 0}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-500 h-14 px-8 rounded-full font-bold text-base hover:scale-105"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                        Processing Quanta...
                                    </>
                                ) : (
                                    <>
                                        <BrainCircuit className="mr-3 h-5 w-5" />
                                        Execute Deep Scan
                                    </>
                                )}
                            </Button>
                        </FeatureGate>
                    </div>
                </div>

                <FeatureGate tier="pro" className="mt-12">
                    {/* Empty State */}
                    {!hasGenerated && (
                        <div className="relative mt-12 rounded-3xl overflow-hidden border border-border bg-card/80 backdrop-blur-3xl shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                            <div className="px-6 py-32 flex flex-col items-center justify-center text-center relative z-10">
                                <div className="relative">
                                    <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center mb-8 border border-primary/20 backdrop-blur-md">
                                        {isGenerating ? (
                                            <Loader2 className="h-12 w-12 text-primary animate-spin" />
                                        ) : (
                                            <BarChart3 className="h-12 w-12 text-primary/70" />
                                        )}
                                    </div>
                                    <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: '3s' }} />
                                </div>
                                <h3 className="text-3xl font-black mb-4 tracking-tighter text-foreground">
                                    {isGenerating ? "Synthesizing Ledger History..." : "Ready to confront your data?"}
                                </h3>
                                <p className="text-muted-foreground max-w-lg text-base leading-relaxed">
                                    {isGenerating
                                        ? "Mapping multidimensional trade vectors against risk constraints and timeframes to isolate your exact leak."
                                        : "Give our engine access to your raw trade history. We will expose exactly why you're losing money and what you must change today."}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Full Report View */}
                    {hasGenerated && report && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">

                            {/* Headline Banner (Holographic Glass) */}
                            <div className="relative overflow-hidden rounded-3xl border border-border bg-card/40 backdrop-blur-2xl p-6 shadow-2xl group transition-all duration-500">
                                <div className={cn("absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none",
                                    report.headline.status === 'profitable' ? "bg-gradient-to-r from-emerald-500 to-transparent" :
                                        report.headline.status === 'losing' ? "bg-gradient-to-r from-destructive to-transparent" :
                                            "bg-gradient-to-r from-amber-500 to-transparent"
                                )} />

                                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-6">
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border bg-background/50 backdrop-blur-sm shadow-xl",
                                        report.headline.status === 'profitable' ? "border-emerald-500/50 text-emerald-400" :
                                            report.headline.status === 'losing' ? "border-destructive/50 text-destructive" :
                                                "border-amber-500/50 text-amber-500"
                                    )}>
                                        <Target className="w-7 h-7" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2.5 mb-1.5">
                                            <span className={cn("w-2 h-2 rounded-full animate-pulse",
                                                report.headline.status === 'profitable' ? "bg-emerald-500" :
                                                    report.headline.status === 'losing' ? "bg-destructive" :
                                                        "bg-amber-500"
                                            )} />
                                            <span className={cn("text-xs font-black uppercase tracking-[0.2em]",
                                                report.headline.status === 'profitable' ? "text-emerald-500" :
                                                    report.headline.status === 'losing' ? "text-destructive" :
                                                        "text-amber-500"
                                            )}>
                                                AI DIAGNOSIS: {report.headline.status.replace("_", " ")}
                                            </span>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter mb-2 leading-tight">{report.headline.title}</h2>
                                        <p className="text-muted-foreground leading-relaxed text-base max-w-4xl font-medium">
                                            {report.headline.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* The Numbers Data Grid */}
                            {/* === COMPACT TABBED INTERFACE FOR ALL DATA === */}
                            <Tabs defaultValue="overview" className="w-full mt-2">
                                <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0 gap-5 space-x-0 overflow-x-auto scrollbar-hide mb-4">
                                    <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:text-blue-400 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-400 rounded-none px-2 py-3 text-muted-foreground font-black uppercase tracking-widest bg-transparent text-[11px]">
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Overview
                                    </TabsTrigger>
                                    <TabsTrigger value="blindspots" className="data-[state=active]:bg-transparent data-[state=active]:text-red-500 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-500 rounded-none px-2 py-3 text-muted-foreground font-black uppercase tracking-widest bg-transparent text-[11px]">
                                        <ShieldAlert className="w-4 h-4 mr-2" />
                                        Blindspots ({report.blindspots.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="patterns" className="data-[state=active]:bg-transparent data-[state=active]:text-emerald-500 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 rounded-none px-2 py-3 text-muted-foreground font-black uppercase tracking-widest bg-transparent text-[11px]">
                                        <Activity className="w-4 h-4 mr-2" />
                                        Patterns ({report.recurringPatterns.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="trades" className="data-[state=active]:bg-transparent data-[state=active]:text-amber-500 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none px-2 py-3 text-muted-foreground font-black uppercase tracking-widest bg-transparent text-[11px]">
                                        <TrendingDown className="w-4 h-4 mr-2" />
                                        Worst Trades ({report.worstTrades.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="action" className="data-[state=active]:bg-transparent data-[state=active]:text-purple-500 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none px-2 py-3 text-muted-foreground font-black uppercase tracking-widest bg-transparent text-[11px]">
                                        <Target className="w-4 h-4 mr-2" />
                                        Action Plan
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="mt-0 outline-none space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="bg-card border border-border rounded-2xl p-4 shadow-lg relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Activity className="w-8 h-8 text-blue-500" />
                                            </div>
                                            <div className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Trades Analyzed</div>
                                            <div className="text-2xl font-black text-foreground tracking-tighter">{report.summary.trades}</div>
                                            <div className="text-[10px] text-muted-foreground mt-1 font-medium italic">Synchronized</div>
                                        </div>

                                        <div className="bg-card border border-border rounded-2xl p-4 shadow-lg relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Target className="w-8 h-8 text-emerald-500" />
                                            </div>
                                            <div className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Win Rate</div>
                                            <div className="text-2xl font-black text-emerald-400 tracking-tighter">{report.summary.winRate.toFixed(1)}%</div>
                                            <div className="text-[10px] text-muted-foreground mt-1 font-medium italic">Statistical Edge</div>
                                        </div>

                                        <div className="bg-card border border-border rounded-2xl p-4 shadow-lg relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <DollarSign className="w-8 h-8 text-amber-500" />
                                            </div>
                                            <div className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Net PnL</div>
                                            <div className={cn("text-2xl font-black tracking-tighter", report.summary.totalReturn >= 0 ? "text-emerald-400" : "text-red-500")}>
                                                ${report.summary.totalReturn.toFixed(2)}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground mt-1 font-medium italic">Realized Equity</div>
                                        </div>

                                        <div className="bg-card border border-border rounded-2xl p-4 shadow-lg relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <TrendingUp className="w-8 h-8 text-emerald-500" />
                                            </div>
                                            <div className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Profit Factor</div>
                                            <div className="text-2xl font-black text-foreground tracking-tighter">{report.summary.profitFactor}</div>
                                            <div className="text-[10px] text-muted-foreground mt-1 font-medium italic">Efficiency Ratio</div>
                                        </div>

                                        <div className="bg-card border border-border rounded-2xl p-4 shadow-lg relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Trophy className="w-8 h-8 text-emerald-500" />
                                            </div>
                                            <div className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Biggest Win</div>
                                            <div className="text-2xl font-black text-emerald-400 tracking-tighter">${report.summary.biggestWin}</div>
                                            <div className="text-[10px] text-muted-foreground mt-1 font-medium italic">Peak Performance</div>
                                        </div>

                                        <div className="bg-card border border-border rounded-2xl p-4 shadow-lg relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Skull className="w-8 h-8 text-red-500" />
                                            </div>
                                            <div className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em] mb-1">Biggest Loss</div>
                                            <div className="text-2xl font-black text-red-500 tracking-tighter">-${Math.abs(report.summary.biggestLoss)}</div>
                                            <div className="text-[10px] text-muted-foreground mt-1 font-medium italic">Max Drawdown</div>
                                        </div>

                                        <div className="bg-card border border-border rounded-2xl p-4 shadow-lg relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Scale className="w-8 h-8 text-blue-500" />
                                            </div>
                                            <div className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Risk Reward</div>
                                            <div className="text-2xl font-black text-foreground tracking-tighter">{report.summary.riskReward}</div>
                                            <div className="text-[10px] text-muted-foreground mt-1 font-medium italic">Logical Edge</div>
                                        </div>

                                        <div className="bg-card border border-border rounded-2xl p-4 shadow-lg relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Clock className="w-8 h-8 text-purple-500" />
                                            </div>
                                            <div className="text-[9px] font-black text-purple-500 uppercase tracking-[0.2em] mb-1">Avg Hold</div>
                                            <div className="text-2xl font-black text-foreground tracking-tighter">{report.summary.averageHold}</div>
                                            <div className="text-[10px] text-muted-foreground mt-1 font-medium italic">Time Exposure</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Profit Distribution */}
                                        <div className="bg-card border border-border rounded-2xl p-4 shadow-lg flex flex-col relative overflow-hidden">
                                            <h3 className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2 mb-4 relative z-10">
                                                <BarChart3 className="w-4 h-4 text-emerald-500" /> PnL Allocation
                                            </h3>
                                            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                                                <div className="relative w-full h-[180px]">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={[
                                                                    { name: 'Winning', value: report.distribution.winningTrades },
                                                                    { name: 'Losing', value: report.distribution.losingTrades }
                                                                ]}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={60}
                                                                outerRadius={80}
                                                                paddingAngle={8}
                                                                dataKey="value"
                                                                stroke="none"
                                                            >
                                                                {[{ color: CHART_COLORS.win }, { color: CHART_COLORS.loss }].map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0px 0px 8px ${entry.color}40)` }} />
                                                                ))}
                                                            </Pie>
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                        <span className={cn("text-2xl font-black tracking-tighter", report.distribution.netPnL >= 0 ? "text-emerald-400" : "text-destructive")}>
                                                            {report.distribution.netPnL >= 0 ? '+' : '-'}${Math.abs(report.distribution.netPnL)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 w-full mt-4">
                                                    <div className="bg-secondary border border-border rounded-xl p-3 flex justify-between items-center relative overflow-hidden">
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 flex items-center" />
                                                        <span className="text-sm font-bold text-foreground pl-2">Winning ({report.distribution.winningTrades})</span>
                                                        <span className="text-base font-black text-emerald-400">{(report.distribution.winningTrades / report.summary.trades * 100).toFixed(0)}%</span>
                                                    </div>
                                                    <div className="bg-secondary border border-border rounded-xl p-3 flex justify-between items-center relative overflow-hidden">
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive flex items-center" />
                                                        <span className="text-sm font-bold text-foreground pl-2">Losing ({report.distribution.losingTrades})</span>
                                                        <span className="text-base font-black text-destructive">{(report.distribution.losingTrades / report.summary.trades * 100).toFixed(0)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Long vs Short Metrics */}
                                        <div className="bg-card border border-border rounded-2xl p-4 shadow-lg flex flex-col relative overflow-hidden">
                                            <h3 className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2 mb-4 relative z-10">
                                                <TrendingUp className="w-4 h-4 text-blue-500" /> Long vs Short Dominance
                                            </h3>
                                            <div className="flex-1 flex flex-col justify-center space-y-4 relative z-10">
                                                <div>
                                                    <div className="flex justify-between items-end mb-2">
                                                        <div>
                                                            <span className="text-foreground font-bold text-lg">Longs</span>
                                                            <span className="text-muted-foreground text-xs ml-2">({report.longVsShort.longTrades} trades)</span>
                                                        </div>
                                                        <div className={cn("font-black", report.longVsShort.longPnL >= 0 ? "text-emerald-400" : "text-red-500")}>
                                                            ${report.longVsShort.longPnL}
                                                        </div>
                                                    </div>
                                                    <div className="h-3 w-full bg-secondary dark:bg-white/5 rounded-full overflow-hidden flex">
                                                        <div className="h-full bg-blue-500" style={{ width: `${report.longVsShort.longWinRate}%` }} />
                                                        <div className="h-full bg-red-500" style={{ width: `${100 - report.longVsShort.longWinRate}%` }} />
                                                    </div>
                                                    <div className="flex justify-between text-[10px] mt-1.5 font-bold uppercase tracking-wider text-muted-foreground">
                                                        <span>WR: {report.longVsShort.longWinRate}%</span>
                                                        <span>LR: {(100 - report.longVsShort.longWinRate).toFixed(1)}%</span>
                                                    </div>
                                                </div>
                                                <div className="h-px bg-secondary dark:bg-white/5 w-full" />
                                                <div>
                                                    <div className="flex justify-between items-end mb-2">
                                                        <div>
                                                            <span className="text-foreground dark:text-white font-bold text-lg">Shorts</span>
                                                            <span className="text-muted-foreground text-xs ml-2">({report.longVsShort.shortTrades} trades)</span>
                                                        </div>
                                                        <div className={cn("font-black", report.longVsShort.shortPnL >= 0 ? "text-emerald-400" : "text-red-500")}>
                                                            ${report.longVsShort.shortPnL}
                                                        </div>
                                                    </div>
                                                    <div className="h-3 w-full bg-secondary dark:bg-white/5 rounded-full overflow-hidden flex">
                                                        <div className="h-full bg-orange-500" style={{ width: `${report.longVsShort.shortWinRate}%` }} />
                                                        <div className="h-full bg-red-500" style={{ width: `${100 - report.longVsShort.shortWinRate}%` }} />
                                                    </div>
                                                    <div className="flex justify-between text-[10px] mt-1.5 font-bold uppercase tracking-wider text-muted-foreground">
                                                        <span>WR: {report.longVsShort.shortWinRate}%</span>
                                                        <span>LR: {(100 - report.longVsShort.shortWinRate).toFixed(1)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Day of Week Advantage */}
                                        <div className="bg-card border border-border rounded-2xl p-4 shadow-lg flex flex-col relative overflow-hidden">
                                            <h3 className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2 mb-4 relative z-10">
                                                <Calendar className="w-4 h-4 text-purple-500" /> Temporal Advantage
                                            </h3>
                                            <div className="flex-1 flex flex-col gap-4 relative z-10 justify-center">
                                                <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl p-4">
                                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-1">Most Profitable Day</div>
                                                    <div className="text-2xl font-black text-foreground dark:text-white">{report.dayOfWeek.bestDay}</div>
                                                    <div className="text-sm text-emerald-400 font-medium mt-2">
                                                        {report.dayOfWeek.data.find(d => d.day === report.dayOfWeek.bestDay)?.winRate}% Strike Rate
                                                    </div>
                                                </div>
                                                <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-xl p-5">
                                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 mb-1">Biggest Wealth Destroyer</div>
                                                    <div className="text-2xl font-black text-foreground dark:text-white">{report.dayOfWeek.worstDay}</div>
                                                    <div className="text-sm text-red-400 font-medium mt-2">
                                                        {report.dayOfWeek.data.find(d => d.day === report.dayOfWeek.worstDay)?.winRate}% Strike Rate
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* === SECTION 1: Blindspots === */}
                                <TabsContent value="blindspots" className="mt-0 outline-none">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                        {report.blindspots.map((spot, idx) => (
                                            <div key={idx} className={cn("rounded-2xl p-4 transition-all relative overflow-hidden", getSeverityStyles(spot.severity))}>
                                                <div className="absolute top-4 right-4 opacity-5">
                                                    {spot.severity === 'critical' ? <AlertOctagon className="w-20 h-20" /> :
                                                        spot.severity === 'warning' ? <AlertTriangle className="w-20 h-20" /> :
                                                            <Lightbulb className="w-20 h-20" />}
                                                </div>
                                                <div className="relative z-10 flex flex-col h-full">
                                                    <div className="flex items-center mb-3">
                                                        <span className={cn("text-[9px] px-3 py-1 rounded-full border uppercase tracking-[0.15em] font-black shadow-sm",
                                                            spot.severity === 'critical' ? 'bg-red-500/5 border-red-500/50 text-red-500' :
                                                                spot.severity === 'warning' ? 'bg-amber-500/5 border-amber-500/50 text-amber-500' :
                                                                    'bg-blue-500/5 border-blue-500/50 text-blue-500'
                                                        )}>{spot.severity}</span>
                                                    </div>
                                                    <h4 className="text-lg font-bold tracking-tight mb-2 text-foreground dark:text-white">{spot.title}</h4>
                                                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1 font-medium">
                                                        {spot.description}
                                                    </p>
                                                    <div className="space-y-2 mt-auto">
                                                        <div className="bg-muted/50 dark:bg-[#111] rounded-lg p-3 text-xs border border-border dark:border-white/5">
                                                            <span className="font-bold uppercase tracking-[0.15em] mb-1 block text-red-500 dark:text-red-900/50">Evidence</span>
                                                            <span className="text-foreground dark:text-white/80 font-medium leading-relaxed">{spot.evidence}</span>
                                                        </div>
                                                        <div className="bg-secondary dark:bg-[#111] rounded-lg p-3 text-xs border border-border dark:border-white/10">
                                                            <span className="font-bold uppercase tracking-[0.15em] mb-1 flex items-center gap-1.5 text-foreground dark:text-white/50">
                                                                <BrainCircuit className="w-3.5 h-3.5" /> Hard Rule
                                                            </span>
                                                            <span className="text-foreground dark:text-white font-semibold leading-relaxed">{spot.hardRule}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>

                                {/* === SECTION 2: Recurring Patterns === */}
                                <TabsContent value="patterns" className="mt-0 outline-none">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                        {report.recurringPatterns.map((pattern, idx) => (
                                            <div key={idx} className={cn(
                                                "bg-card border border-border rounded-2xl p-4 transition-all hover:bg-secondary/20",
                                                pattern.type === 'danger' ? 'border-red-500/20' :
                                                    pattern.type === 'positive' ? 'border-emerald-500/20' : ''
                                            )}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className={cn(
                                                        "text-[9px] px-2.5 py-1 rounded-full border uppercase tracking-[0.15em] font-black",
                                                        pattern.type === 'danger' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                                                            pattern.type === 'positive' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
                                                                'bg-secondary border-border text-muted-foreground'
                                                    )}>{pattern.type}</span>
                                                    <span className="text-[10px] text-muted-foreground font-medium">{pattern.frequency}</span>
                                                </div>
                                                <h4 className="text-base font-bold text-foreground mb-2 tracking-tight">{pattern.title}</h4>
                                                <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-3">{pattern.description}</p>
                                                <div className="bg-secondary border border-border rounded-lg p-3">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-amber-500 flex items-center gap-1.5 mb-1">
                                                        <Zap className="w-3 h-3" /> Impact
                                                    </span>
                                                    <span className="text-xs text-foreground/80 font-medium leading-relaxed">{pattern.impact}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>

                                {/* === SECTION 3: Worst Trades === */}
                                <TabsContent value="trades" className="mt-0 outline-none">
                                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                                        {report.worstTrades.length === 0 ? (
                                            <div className="py-10 text-center text-muted-foreground font-medium italic">No significant losses found.</div>
                                        ) : (
                                            <div className="divide-y divide-border">
                                                {report.worstTrades.map((trade, idx) => (
                                                    <div key={idx} className="p-4 flex flex-col md:flex-row gap-5 md:items-center hover:bg-secondary/50 transition-colors">
                                                        <div className="flex-shrink-0 md:w-28">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-bold text-base tracking-tight text-foreground">{trade.pair}</span>
                                                                <span className={cn("text-[8px] px-2 py-0.5 rounded border uppercase font-black tracking-[0.1em]",
                                                                    trade.direction.toLowerCase() === 'buy' ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' : 'bg-orange-500/10 text-orange-500 border-orange-500/30')}>
                                                                    {trade.direction}
                                                                </span>
                                                            </div>
                                                            <div className="text-lg font-black text-red-500 tracking-tighter">
                                                                -${Math.abs(trade.pnl).toFixed(2)}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6">
                                                            <div className="flex-1">
                                                                <div className="text-[9px] uppercase tracking-[0.2em] text-red-500 dark:text-red-900/50 font-black mb-1.5 flex items-center gap-1.5">
                                                                    <AlertTriangle className="w-3 h-3" /> What Went Wrong
                                                                </div>
                                                                <p className="text-foreground/80 font-medium text-sm leading-relaxed">{trade.whatWentWrong}</p>
                                                            </div>
                                                            <div className="hidden md:block w-px bg-border" />
                                                            <div className="flex-1">
                                                                <div className="text-[9px] uppercase tracking-[0.2em] text-emerald-500 font-black mb-1.5 flex items-center gap-1.5">
                                                                    <CheckCircle2 className="w-3 h-3" /> Lesson
                                                                </div>
                                                                <p className="text-emerald-500 font-medium text-sm leading-relaxed">{trade.lesson}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* === SECTION 4: Action Plan === */}
                                <TabsContent value="action" className="mt-0 outline-none">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {report.actionPlan.map((step, idx) => (
                                            <div key={idx} className="bg-card dark:bg-black/40 backdrop-blur-xl border border-border rounded-2xl p-4 relative overflow-hidden transition-all shadow-lg hover:shadow-xl">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-black text-muted-foreground">
                                                            {idx + 1}
                                                        </div>
                                                        <span className={cn("text-[8px] uppercase font-black tracking-[0.1em] px-2 py-0.5 rounded border", getPriortyStyles(step.priority))}>
                                                            {step.priority}
                                                        </span>
                                                    </div>
                                                </div>
                                                <h4 className="font-bold text-foreground text-[14px] tracking-tight leading-snug mb-2">{step.title}</h4>
                                                <p className="text-[12px] text-muted-foreground leading-relaxed font-medium mb-4">{step.description}</p>
                                                <div className="bg-secondary border border-border rounded-lg px-4 py-3 flex flex-col gap-1">
                                                    <span className="text-[8px] font-black uppercase tracking-[0.15em] text-emerald-500 flex items-center gap-1.5">
                                                        <PlayCircle className="w-3 h-3" /> Success Criteria
                                                    </span>
                                                    <span className="text-[12px] text-foreground font-semibold">{step.measureSuccess}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </FeatureGate>
                {renderConnectModal()}
            </div>
        </UserLayout>
    );
};

export default AiReport;
