import React from 'react';
import {
    TrendingUp, Target, BarChart3, Clock, AlertTriangle,
    Lightbulb, ClipboardList, Sparkles, MapPin, Activity
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, LabelList
} from "recharts";
import { cn } from "@/lib/utils";

interface ReportPreviewProps {
    data: any;
    reportType: string;
    userName: string;
    previewRef: React.RefObject<HTMLDivElement>;
}

const ReportPreview = ({ data, reportType, userName, previewRef }: ReportPreviewProps) => {
    if (!data) return null;

    const { stats, insights, trades, symbol_distribution, period_info } = data;

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

    const fmtMoney = (val: number) => `$${val?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const chartData = stats.equity_curve.map((p: any) => ({
        time: p.time,
        equity: p.equity
    }));

    return (
        <div ref={previewRef} className="bg-[#0f172a] text-slate-100 p-8 rounded-xl border border-slate-800 shadow-2xl w-[800px] mx-auto overflow-visible font-sans">
            {/* Header / Branding */}
            <div className="flex justify-between items-start mb-10 border-b border-slate-800 pb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-emerald-500/20 p-2 rounded-lg">
                            <Sparkles className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter text-white">JOURNAL<span className="text-emerald-500">X</span></h1>
                    </div>
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Performance Intelligence Report</p>
                </div>
                <div className="text-right">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        STATUS: DELIVERED
                    </div>
                    <h2 className="text-xl font-bold text-white capitalize">{reportType} Review</h2>
                    <p className="text-slate-400 text-sm">{period_info.start} — {period_info.end}</p>
                </div>
            </div>

            {/* Trader Context */}
            <div className="flex items-center gap-4 mb-10 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center font-bold text-xl text-white">
                    {userName?.[0] || 'T'}
                </div>
                <div>
                    <h3 className="font-bold text-white">{userName}</h3>
                    <p className="text-xs text-slate-400">Trading Level: Professional Analysis</p>
                </div>
                <div className="ml-auto flex gap-4">
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Trades</p>
                        <p className="text-lg font-bold text-white">{stats.total_trades}</p>
                    </div>
                    <div className="text-right border-l border-slate-800 pl-4">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Win Rate</p>
                        <p className="text-lg font-bold text-emerald-500">{stats.win_rate.toFixed(1)}%</p>
                    </div>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-3xl"></div>
                    <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Net Unrealized P/L</p>
                    <p className={cn("text-2xl font-black", stats.total_pl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                        {stats.total_pl >= 0 ? "+" : ""}{fmtMoney(stats.total_pl)}
                    </p>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-center relative overflow-hidden">
                    <Activity className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Profit Factor</p>
                    <p className="text-2xl font-black text-white">
                        {Math.abs(stats.avg_profit_winner / (stats.avg_loss_loser || 1)).toFixed(2)}
                    </p>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-center relative overflow-hidden">
                    <Target className="w-5 h-5 text-purple-500 mx-auto mb-2" />
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Avg Win / Loss</p>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-sm font-bold text-emerald-500">{fmtMoney(stats.avg_profit_winner)}</span>
                        <span className="text-slate-700">/</span>
                        <span className="text-sm font-bold text-rose-500">{fmtMoney(stats.avg_loss_loser)}</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-5 gap-6 mb-10">
                <div className="col-span-3 h-[280px] p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-3 h-3 text-emerald-500" />
                            Equity Trajectory
                        </h4>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Growth Period</p>
                            <p className={cn("text-sm font-black", stats.total_pl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                {stats.total_pl >= 0 ? "+" : ""}{fmtMoney(stats.total_pl)}
                            </p>
                        </div>
                    </div>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 25, right: 35, bottom: 5, left: 10 }}>
                                <defs>
                                    <linearGradient id="colorEq" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="time" hide />
                                <YAxis hide domain={['dataMin - 20', 'dataMax + 40']} />
                                <Area
                                    type="monotone"
                                    dataKey="equity"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorEq)"
                                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0f172a' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                >
                                    <LabelList
                                        dataKey="equity"
                                        position="top"
                                        content={(props: any) => {
                                            const { x, y, value } = props;
                                            return (
                                                <g>
                                                    <rect
                                                        x={x - 20}
                                                        y={y - 18}
                                                        width={40}
                                                        height={14}
                                                        rx={4}
                                                        fill="#0f172a"
                                                        fillOpacity={0.8}
                                                    />
                                                    <text
                                                        x={x}
                                                        y={y - 8}
                                                        fill="#ffffff"
                                                        fontSize={10}
                                                        fontWeight="900"
                                                        textAnchor="middle"
                                                    >
                                                        ${Math.round(value)}
                                                    </text>
                                                </g>
                                            );
                                        }}
                                    />
                                </Area>
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="col-span-2 p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col min-h-[300px]">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Symbol Dominance</h4>
                    <div className="flex-1 w-full h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <Pie
                                    data={symbol_distribution}
                                    innerRadius={30}
                                    outerRadius={50}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, value }) => `${value}`}
                                    labelLine={false}
                                    stroke="none"
                                >
                                    {symbol_distribution.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Persistent Legend with Values - Removed truncate to avoid clipping */}
                    <div className="mt-2 space-y-2">
                        {symbol_distribution.slice(0, 4).map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] border-b border-slate-900 pb-1.5 last:border-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                    <span className="text-slate-300 font-medium">{item.name}</span>
                                </div>
                                <span className="font-bold text-emerald-500">{item.value} <span className="text-[9px] text-slate-500 font-normal uppercase">Trades</span></span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Insights & Diary Section */}
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-emerald-500" />
                        Psychological Insights
                    </h4>
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <p className="text-xs font-bold text-emerald-500 uppercase mb-2">Proven Strengths</p>
                        <ul className="text-xs space-y-2 text-slate-400">
                            {insights.strengths.slice(0, 3).map((s: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="mt-1 w-1 h-1 rounded-full bg-emerald-500"></span>
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                        <p className="text-xs font-bold text-orange-500 uppercase mb-2">Execution Risks</p>
                        <ul className="text-xs space-y-2 text-slate-400">
                            {insights.weaknesses.slice(0, 2).map((w: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="mt-1 w-1 h-1 rounded-full bg-orange-500"></span>
                                    {w}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-blue-500" />
                        Diary Reflections
                    </h4>
                    <div className="space-y-3">
                        {trades.filter((t: any) => t.notes).slice(0, 3).map((t: any, i: number) => (
                            <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-blue-500 uppercase">{t.symbol}</span>
                                    <span className="text-[10px] text-slate-500">{t.close_time.split(' ')[0]}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 italic leading-relaxed line-clamp-2">" {t.notes} "</p>
                            </div>
                        ))}
                        {trades.filter((t: any) => t.notes).length === 0 && (
                            <div className="p-8 text-center rounded-xl bg-slate-900 border border-slate-800 border-dashed">
                                <p className="text-xs text-slate-500 italic">No notes recorded for this period.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-10 pt-6 border-t border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center">
                                <Activity className="w-3 h-3 text-slate-500" />
                            </div>
                        ))}
                    </div>
                    <span className="text-[10px] text-slate-500">Generated via JournalX AI Engine v2.0</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">
                    Ref ID: {Math.random().toString(36).substring(7).toUpperCase()}
                </p>
            </div>
        </div>
    );
};

export default ReportPreview;
