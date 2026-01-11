import { Header } from "@/components/layout/Header";
import { BarChart3, TrendingUp, TrendingDown, Target, Percent, DollarSign, Calendar, Layers, Activity, AlertTriangle, ShieldAlert, Lightbulb, Info } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, ReferenceLine } from "recharts";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AnalyticsLevel = "beginner" | "intermediate" | "advanced";

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState<AnalyticsLevel>("beginner");

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (user?.user_id) {
        try {
          const response = await api.get(`/api/analytics/user/${user.user_id}`);
          setAnalytics(response.data);

          const insightsRes = await api.get(`/api/analytics/insights?user_id=${user.user_id}`);
          setInsights(insightsRes.data);
        } catch (error) {
          console.error("Error fetching analytics:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchAnalytics();
  }, [user?.user_id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!analytics || !analytics.beginner || analytics.beginner.total_trades === undefined) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 lg:px-6 py-8">
          <div className="text-center p-12 text-muted-foreground">
            <h2 className="text-xl font-semibold mb-2">No Data Yet</h2>
            <p>Start journaling your trades to see analytics.</p>
          </div>
        </main>
      </div>
    );
  }

  // Helper to format currency
  const fmtMoney = (val: number) => `$${val?.toFixed(2)}`;

  // Define stats cards based on level
  const renderStats = () => {
    let stats = [];

    if (level === "beginner") {
      stats = [
        { label: "Total P/L", value: fmtMoney(analytics.beginner.total_pl), icon: DollarSign, color: analytics.beginner.total_pl >= 0 ? "text-success" : "text-destructive", bg: analytics.beginner.total_pl >= 0 ? "bg-success/10" : "bg-destructive/10" },
        { label: "Win Rate", value: `${(analytics.beginner.win_rate || 0).toFixed(1)}%`, icon: Target, color: "text-primary", bg: "bg-primary/10" },
        { label: "Total Trades", value: analytics.beginner.total_trades, icon: BarChart3, color: "text-foreground", bg: "bg-muted" },
        { label: "Avg Risk (Loss)", value: fmtMoney(analytics.beginner.avg_risk), icon: ShieldAlert, color: "text-warning", bg: "bg-warning/10" },
      ];
    } else if (level === "intermediate") {
      const avgR = analytics.intermediate?.avg_r || 0;
      stats = [
        { label: "Avg R-Multiple", value: `${avgR.toFixed(2)}R`, icon: Layers, color: "text-primary", bg: "bg-primary/10" },
        { label: "Best Strategy", value: Object.entries(analytics.intermediate.strategy_performance || {}).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "N/A", icon: Activity, color: "text-success", bg: "bg-success/10" },
        { label: "Best Day", value: Object.entries(analytics.intermediate.day_of_week_performance || {}).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "N/A", icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        // Reusing Win Rate for context
        { label: "Win Rate", value: `${(analytics.beginner.win_rate || 0).toFixed(1)}%`, icon: Target, color: "text-primary", bg: "bg-primary/10" },
      ];
    } else {
      // Advanced
      stats = [
        { label: "Expectancy", value: fmtMoney(analytics.advanced.expectancy), icon: TrendingUp, color: analytics.advanced.expectancy >= 0 ? "text-success" : "text-destructive", bg: "bg-muted" },
        { label: "Max Drawdown", value: fmtMoney(analytics.advanced.max_drawdown), icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10" },
        { label: "Risk Consistency", value: `±${fmtMoney(analytics.advanced.risk_consistency)}`, icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
        { label: "Total P/L", value: fmtMoney(analytics.beginner.total_pl), icon: DollarSign, color: analytics.beginner.total_pl >= 0 ? "text-success" : "text-destructive", bg: analytics.beginner.total_pl >= 0 ? "bg-success/10" : "bg-destructive/10" },
      ]
    }

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="glass-card-premium p-6 rounded-2xl opacity-0 animate-fade-up hover:scale-[1.02] transition-transform duration-300 group"
            style={{ animationDelay: `${0.1 + i * 0.05}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground/80 group-hover:text-foreground transition-colors">{stat.label}</span>
              <div className={`p-2 rounded-xl bg-black/20 backdrop-blur-sm border border-white/5 ${stat.color} group-hover:bg-white/5 transition-colors`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className={`text-2xl lg:text-3xl font-extrabold tracking-tight ${stat.color} filter drop-shadow-sm`}>{stat.value}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderCharts = () => {
    // Data prep
    if (level === "beginner") {
      const equityData = analytics.beginner.equity_curve.map((p: any) => ({
        date: new Date(p.time).toLocaleDateString(),
        equity: p.equity
      }));

      return (
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
          <div className="glass-card-premium p-8 h-[450px] rounded-3xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
              <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                <TrendingUp className="w-5 h-5" />
              </div>
              Equity Curve
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                  formatter={(val: number) => [fmtMoney(val), "Equity"]}
                  cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorEquity)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                />
                <XAxis dataKey="date" hide />
                <YAxis hide />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    } else if (level === "intermediate") {
      const strategyData = Object.entries(analytics.intermediate.strategy_performance || {}).map(([name, pl]) => ({ name, pl }));
      const dayData = Object.entries(analytics.intermediate.day_of_week_performance || {}).map(([name, pl]) => ({ name, pl }));

      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="glass-card-premium p-8 h-[450px] rounded-3xl border border-black/10 dark:border-white/5 bg-white/60 dark:bg-black/40">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Strategy Performance</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strategyData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', backdropFilter: 'blur(10px)', padding: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(val: number) => [fmtMoney(val), "Net Profit"]}
                  cursor={{ fill: 'rgba(16, 185, 129, 0.1)', radius: 8 }}
                />
                <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={16}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                />
                <Bar dataKey="pl" radius={[8, 8, 8, 8]} maxBarSize={50} animationDuration={1500}>
                  {strategyData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.pl >= 0 ? "url(#colorStrategy)" : "#ef4444"} strokeWidth={0} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="colorStrategy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card-premium p-8 h-[450px] rounded-3xl border border-black/10 dark:border-white/5 bg-white/60 dark:bg-black/40">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Day of Week Performance</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', backdropFilter: 'blur(10px)', padding: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(val: number) => [fmtMoney(val), "Net Profit"]}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)', radius: 8 }}
                />
                <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={16}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                />
                <Bar dataKey="pl" radius={[8, 8, 8, 8]} maxBarSize={50} animationDuration={1500}>
                  {dayData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.pl >= 0 ? "#10b981" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    } else {
      const maeMfeData = analytics.advanced.mae_mfe;
      return (
        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="glass-card-premium p-8 h-[500px] rounded-3xl border border-black/10 dark:border-white/5 bg-white/60 dark:bg-black/40 flex flex-col">
            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Trade Efficiency (MAE vs MFE)</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-2xl">
              Analyze your trade efficiency by comparing maximum adverse excursion (drawdown) against maximum favorable excursion (potential profit).
              Points above the diagonal line indicate trades that moved more in your favor than against you.
            </p>
            <div className="flex-1 min-h-0 w-full">
              {maeMfeData.length > 0 && maeMfeData.some((d: any) => d.mae > 0 || d.mfe > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 70 }}>
                    <defs>
                      <radialGradient id="winGradient" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.95} />
                      </radialGradient>
                      <radialGradient id="lossGradient" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#dc2626" stopOpacity={0.95} />
                      </radialGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" strokeWidth={1} />
                    <XAxis
                      type="number"
                      dataKey="mae"
                      name="MAE (Drawdown)"
                      stroke="#94a3b8"
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      label={{ value: 'Risk Taken ($)', position: 'bottom', offset: 0, fill: '#ef4444', fontSize: 13, fontWeight: 700 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="mfe"
                      name="MFE (Peak Profit)"
                      stroke="#94a3b8"
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      label={{ value: 'Potential Reward ($)', angle: -90, position: 'insideLeft', fill: '#10b981', fontSize: 13, fontWeight: 700 }}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3', stroke: '#94a3b8', strokeWidth: 2 }}
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.98)',
                        borderColor: 'rgba(16, 185, 129, 0.3)',
                        borderWidth: 2,
                        color: '#fff',
                        borderRadius: '16px',
                        backdropFilter: 'blur(12px)',
                        padding: '16px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                      }}
                      labelStyle={{ color: '#10b981', fontWeight: 700, marginBottom: '8px' }}
                      formatter={(val: number, name: string) => [
                        <span style={{ color: name === "mae" ? "#ef4444" : "#10b981", fontWeight: 600 }}>
                          {fmtMoney(val)}
                        </span>,
                        name === "mae" ? "💔 Max Risk" : "💰 Max Reward"
                      ]}
                    />
                    <ReferenceLine
                      segment={[{ x: 0, y: 0 }, { x: 5000, y: 5000 }]}
                      stroke="#10b981"
                      strokeDasharray="8 4"
                      strokeWidth={2.5}
                      filter="url(#glow)"
                      label={{
                        position: 'top',
                        value: '⚖️ 1:1 Efficiency Line',
                        fill: '#10b981',
                        fontSize: 11,
                        fontWeight: 700
                      }}
                    />
                    <Scatter name="Trades" data={maeMfeData}>
                      {maeMfeData.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.net_profit >= 0 ? "url(#winGradient)" : "url(#lossGradient)"}
                          stroke={entry.net_profit >= 0 ? "#059669" : "#b91c1c"}
                          strokeWidth={2}
                          r={8}
                          style={{
                            filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))',
                            cursor: 'pointer'
                          }}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                  <div className="p-4 rounded-full bg-black/5 dark:bg-white/5 mb-4">
                    <ScatterChart width={40} height={40} className="opacity-50">
                      <Scatter data={[{ x: 1, y: 1 }, { x: 2, y: 2 }]} fill="currentColor" />
                    </ScatterChart>
                  </div>
                  <p className="font-medium">Not enough data points yet</p>
                  <p className="text-sm mt-1">Record trades with MAE/MFE details to see this chart.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  };


  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 aurora-bg pointer-events-none" />
      <div className="absolute inset-0 bg-grid-white/5 pointer-events-none" />

      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 lg:px-6 py-12">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 opacity-0 animate-fade-up">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 tracking-tight drop-shadow-sm">
                  Analytics
                </h1>
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl font-medium tracking-wide">
                Uncover hidden patterns and optimize your trading edge with deep insights.
              </p>
            </div>

            {/* Level Selector - Premium Segmented Control */}
            <div className="flex items-center bg-white/50 dark:bg-black/20 backdrop-blur-md p-1.5 rounded-2xl border border-black/10 dark:border-white/5 shadow-2xl">
              {["beginner", "intermediate", "advanced"].map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l as AnalyticsLevel)}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 capitalize relative overflow-hidden group",
                    level === l
                      ? "bg-primary text-primary-foreground shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
                      : "text-slate-500 dark:text-slate-400 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {l === "beginner" && <Target className="w-4 h-4" />}
                    {l === "intermediate" && <Layers className="w-4 h-4" />}
                    {l === "advanced" && <Activity className="w-4 h-4" />}
                    {l}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Smart Insights - Holographic Alerts */}
          {insights.length > 0 && (
            <div className="mb-10 opacity-0 animate-fade-up" style={{ animationDelay: '0.05s' }}>
              <div className="flex items-center gap-2 mb-4 px-1">
                <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-500 animate-pulse" />
                <h2 className="text-lg font-bold tracking-wide text-foreground">AI Insights</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {insights.map((insight, idx) => (
                  <div key={idx} className={cn(
                    "p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                    insight.type === "good" ? "bg-emerald-500/10 dark:bg-emerald-500/5 border-emerald-500/20 hover:shadow-emerald-500/10" :
                      insight.type === "warning" ? "bg-amber-500/10 dark:bg-amber-500/5 border-amber-500/20 hover:shadow-amber-500/10" :
                        "bg-blue-500/10 dark:bg-blue-500/5 border-blue-500/20 hover:shadow-blue-500/10"
                  )}>
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-2.5 rounded-xl flex-shrink-0 shadow-sm",
                        insight.type === "good" ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" :
                          insight.type === "warning" ? "bg-amber-500/20 text-amber-700 dark:text-amber-400" :
                            "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                      )}>
                        {insight.type === "good" ? <TrendingUp className="w-5 h-5" /> :
                          insight.type === "warning" ? <AlertTriangle className="w-5 h-5" /> :
                            <Info className="w-5 h-5" />}
                      </div>
                      <p className="text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-300">{insight.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Grid - Premium Cards */}
          <div className="mb-10">
            {renderStats()}
          </div>

          {/* Charts Section - Bento Grid */}
          <div className="opacity-0 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {renderCharts()}
          </div>

        </main>
      </div>
    </div>
  );
};

export default Analytics;
