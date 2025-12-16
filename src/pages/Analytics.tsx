import { Header } from "@/components/layout/Header";
import { BarChart3, TrendingUp, TrendingDown, Target, Percent, DollarSign, Calendar, Layers, Activity, AlertTriangle, ShieldAlert, Lightbulb, Info } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis } from "recharts";
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
        { label: "Best Day", value: Object.entries(analytics.intermediate.day_of_week_performance || {}).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "N/A", icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
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
          <div key={stat.label} className="stat-card opacity-0 animate-fade-up" style={{ animationDelay: `${0.1 + i * 0.05}s` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
            </div>
            <p className={`text-2xl lg:text-3xl font-bold ${stat.color} truncate`}>{stat.value}</p>
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
          <div className="glass-card p-6 h-[400px]">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Equity Curve
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 76%, 46%)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(142, 76%, 46%)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                  formatter={(val: number) => fmtMoney(val)}
                />
                <Area type="monotone" dataKey="equity" stroke="hsl(142, 76%, 46%)" fillOpacity={1} fill="url(#colorEquity)" />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6 h-[300px]">
            <h3 className="text-lg font-semibold mb-4">Strategy Performance</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strategyData}>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} formatter={(val: number) => fmtMoney(val)} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <Bar dataKey="pl" fill="hsl(142, 76%, 46%)" radius={[4, 4, 0, 0]}>
                  {strategyData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.pl >= 0 ? "hsl(142, 76%, 46%)" : "hsl(0, 84%, 60%)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card p-6 h-[300px]">
            <h3 className="text-lg font-semibold mb-4">Day of Week Performance</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayData}>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} formatter={(val: number) => fmtMoney(val)} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <Bar dataKey="pl" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]}>
                  {dayData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.pl >= 0 ? "hsl(217, 91%, 60%)" : "hsl(0, 84%, 60%)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    } else {
      // Advanced: MAE/MFE Scatter
      const maeMfeData = analytics.advanced.mae_mfe;
      return (
        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="glass-card p-6 h-[400px]">
            <h3 className="text-lg font-semibold mb-4">MAE vs MFE (Trade Efficiency)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" dataKey="mae" name="MAE (Drawdown)" stroke="#ef4444" label={{ value: 'MAE (Adverse Excursion)', position: 'insideBottom', offset: -10, fill: '#94a3b8' }} />
                <YAxis type="number" dataKey="mfe" name="MFE (Peak Profit)" stroke="#22c55e" label={{ value: 'MFE (Favorable Excursion)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                <Scatter name="Trades" data={maeMfeData} fill="#8884d8">
                  {maeMfeData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.net_profit >= 0 ? "#22c55e" : "#ef4444"} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }
  };


  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 lg:px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 opacity-0 animate-fade-up">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Analytics</h1>
            </div>
            <p className="text-muted-foreground">Deep insights into your trading performance</p>
          </div>

          <div className="flex items-center bg-muted/30 p-1 rounded-lg border border-border/50">
            {["beginner", "intermediate", "advanced"].map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l as AnalyticsLevel)}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all capitalize",
                  level === l ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted/50 text-muted-foreground"
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Smart Insights */}
        {insights.length > 0 && (
          <div className="mb-8 opacity-0 animate-fade-up" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold">Smart Insights</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {insights.map((insight, idx) => (
                <div key={idx} className={cn(
                  "p-4 rounded-lg border flex items-start gap-3",
                  insight.type === "good" ? "bg-success/5 border-success/20" :
                    insight.type === "warning" ? "bg-destructive/5 border-destructive/20" :
                      "bg-blue-500/5 border-blue-500/20"
                )}>
                  <div className={cn(
                    "p-2 rounded-full mt-0.5",
                    insight.type === "good" ? "bg-success/10 text-success" :
                      insight.type === "warning" ? "bg-destructive/10 text-destructive" :
                        "bg-blue-500/10 text-blue-500"
                  )}>
                    {insight.type === "good" ? <TrendingUp className="w-4 h-4" /> :
                      insight.type === "warning" ? <AlertTriangle className="w-4 h-4" /> :
                        <Info className="w-4 h-4" />}
                  </div>
                  <p className="text-sm font-medium leading-relaxed">{insight.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {renderStats()}

        {/* Charts Section */}
        {renderCharts()}

      </main>
    </div>
  );
};

export default Analytics;
