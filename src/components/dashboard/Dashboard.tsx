import React, { useState, useEffect, useMemo } from "react";
import { TrendingUp, Plus, DollarSign, Clock, CheckCircle2, Layout, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StatCard } from "./StatCard";
import { ConnectionStatus } from "./ConnectionStatus";
import { TradeEntryForm } from "./TradeEntryForm";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { RecentActivityFeed } from "./RecentActivityFeed";
import { PerformanceChart } from "./PerformanceChart";
import { TopPerformers } from "./TopPerformers";
import { QuickStats } from "./QuickStats";
import { DayTradesModal } from "./DayTradesModal";
import { MonthlyRulePopup } from "./MonthlyRulePopup";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { MonthlyCalendar } from "./MonthlyCalendar";

export function Dashboard() {
  const [showTradeForm, setShowTradeForm] = useState(false);
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [mt5Status, setMt5Status] = useState<any>(null);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [chartPeriod, setChartPeriod] = useState<string>("1M");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Calendar Day Modal State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayTrades, setDayTrades] = useState<any[]>([]);
  const [showDayModal, setShowDayModal] = useState(false);

  const fetchData = React.useCallback(async () => {
    if (user?.user_id) {
      if (!stats) setLoading(true);

      const fetchTasks = [
        api.get(`/trades/stats/user/${user.user_id}`)
          .then(res => setStats(res.data))
          .catch(e => console.error("Stats error", e)),

        api.get(`/api/users/${user.user_id}/mt5-status`)
          .then(res => setMt5Status(res.data))
          .catch(e => console.error("MT5 status error", e)),

        api.get(`/trades/user/${user.user_id}?limit=100&skip=0&sort=desc`)
          .then(res => {
            const tradesData = Array.isArray(res.data) ? res.data : (res.data.items || []);
            setRecentTrades(tradesData);
          })
          .catch(e => console.warn("Recent trades error", e)),

        api.get(`/api/analytics/user/${user.user_id}`)
          .then(res => setAnalyticsData(res.data.beginner))
          .catch(e => console.warn("Analytics error", e))
      ];

      try {
        await Promise.allSettled(fetchTasks);
      } finally {
        setLoading(false);
      }
    }
  }, [user?.user_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (user?.user_id) {
      api.get(`/api/analytics/calendar?user_id=${user.user_id}&month=${calendarDate.getMonth() + 1}&year=${calendarDate.getFullYear()}`)
        .then(res => setCalendarData(res.data))
        .catch(e => console.warn("Calendar fetch error", e));
    }
  }, [user?.user_id, calendarDate]);

  // Derive Top Performers from recent trades or stats
  const topPerformersData = useMemo(() => {
    const symbolMap: Record<string, { profit: number, count: number, wins: number }> = {};
    recentTrades.forEach(t => {
      const sym = t.symbol || "Unknown";
      if (!symbolMap[sym]) symbolMap[sym] = { profit: 0, count: 0, wins: 0 };

      const profit = t.net_profit ?? (t.profit ?? 0);
      symbolMap[sym].profit += profit;
      symbolMap[sym].count += 1;
      if (profit > 0) symbolMap[sym].wins += 1;
    });

    return Object.entries(symbolMap)
      .map(([symbol, data]) => ({
        symbol,
        profit: data.profit,
        trades: data.count,
        winRate: Math.round((data.wins / data.count) * 100)
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 3);
  }, [recentTrades]);

  // Mini Chart data based on selected timeframe
  const miniChartData = useMemo(() => {
    if (!analyticsData || !analyticsData.equity_curve) return [];
    const now = new Date();
    let startDate: Date | null = new Date();

    switch (chartPeriod) {
      case "1D": startDate.setHours(now.getHours() - 24); break;
      case "1W": startDate.setDate(now.getDate() - 7); break;
      case "1M": startDate.setMonth(now.getMonth() - 1); break;
      case "3M": startDate.setMonth(now.getMonth() - 3); break;
      case "ALL": startDate = null; break;
      default: startDate.setMonth(now.getMonth() - 1);
    }

    const filtered = startDate
      ? analyticsData.equity_curve.filter((p: any) => new Date(p.time) >= (startDate as Date))
      : analyticsData.equity_curve;

    return filtered.map((p: any) => ({ value: p.equity }));
  }, [analyticsData, chartPeriod]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary shadow-[0_0_15px_rgba(11,102,228,0.4)]"></div>
      </div>
    );
  }

  const unrealizedPL = mt5Status?.equity - mt5Status?.balance || 0;
  const realizedPL = stats?.net_profit || 0;

  // Calculate Gradient Offset for Mini Sparkline
  let miniChartOff = 0;
  if (miniChartData.length > 1) {
    const values = miniChartData.map(v => v.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const baseline = miniChartData[0].value;

    if (max > min) {
      if (baseline <= min) miniChartOff = 1;
      else if (baseline >= max) miniChartOff = 0;
      else miniChartOff = (max - baseline) / (max - min);
    }
  }

  return (
    <div className="space-y-3 animate-fade-up">

      <div className="relative z-20 space-y-3">
        {/* Row 1: Key Performance Metrics (Stat Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label={stats?.is_free_tier ? "30rd-Day P/L" : "Total P/L"}
            value={`${realizedPL >= 0 ? "+" : ""}$${Math.abs(realizedPL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle={stats?.is_free_tier ? "Analysis of last 30 days" : `${stats?.total_trades || 0} trades`}
            badge={stats?.is_free_tier ? "Limited" : "Total"}
            badgeClassName="bg-primary/20 text-primary border border-primary/30"
            icon={DollarSign}
            glowColor="primary"
            valueClassName={realizedPL >= 0 ? "text-primary" : "text-red-500"}
            animationDelay="0.1s"
          >
            {miniChartData.length > 1 && (
              <div className="absolute right-2 bottom-3 h-8 w-20 opacity-80 pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={miniChartData}>
                    <defs>
                      <linearGradient id="miniSplitStroke" x1="0" y1="0" x2="0" y2="1">
                        <stop offset={miniChartOff} stopColor="#0ea5e9" stopOpacity={1} />
                        <stop offset={miniChartOff} stopColor="#ef4444" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="url(#miniSplitStroke)"
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </StatCard>
          <StatCard
            label="Unrealized"
            value={`${unrealizedPL >= 0 ? "+" : ""}$${Math.abs(unrealizedPL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle="0 open positions"
            icon={Clock}
            glowColor="amber"
            valueClassName={unrealizedPL >= 0 ? "text-amber-500" : "text-red-500"}
            animationDelay="0.2s"
          />
          <StatCard
            label="Realized"
            value={`${realizedPL >= 0 ? "+" : ""}$${Math.abs(realizedPL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle={`${stats?.closed_trades || 0} closed trades`}
            icon={CheckCircle2}
            glowColor="emerald"
            valueClassName={realizedPL >= 0 ? "text-emerald-500" : "text-red-500"}
            animationDelay="0.3s"
          />
          <StatCard
            label="Win Rate"
            value={`${stats?.win_rate?.toFixed(0) || "0"}%`}
            icon={Activity}
            glowColor="primary"
            valueClassName="text-primary dark:text-white"
            animationDelay="0.4s"
            className="flex flex-col justify-between"
          >
            <div className="h-1 w-full bg-muted dark:bg-white/5 rounded-full mt-4 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000"
                style={{ width: `${stats?.win_rate || 0}%` }}
              />
            </div>
          </StatCard>
        </div>

        {/* Row 2: Performance Chart & Monthly Calendar — 60/40 split */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-3">
            <PerformanceChart
              period={chartPeriod}
              setPeriod={setChartPeriod}
              analyticsData={analyticsData}
              className="h-[400px]"
            />
          </div>
          <div className="lg:col-span-2">
            <MonthlyCalendar
              currentDate={calendarDate}
              onMonthChange={setCalendarDate}
              data={calendarData}
              trades={recentTrades}
              className="h-[400px]"
              onViewAll={(date, trades) => {
                setSelectedDate(date);
                setDayTrades(trades);
                setShowDayModal(true);
              }}
            />
          </div>
        </div>

        {/* Row 3: Open Positions | Recent Activity | Top Performers + Quick Stats — 4 cols */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-1 glass-card-premium p-4 rounded-[1.5rem] border border-white/5 flex flex-col justify-between h-[300px]">
            <h3 className="font-bold text-foreground dark:text-white tracking-tight text-sm">Open Positions</h3>

            <div className="flex-1 my-4 mx-2 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center space-y-3 opacity-50">
              <Layout className="w-5 h-5 text-muted-foreground" />
              <p className="font-medium tracking-wide text-xs text-muted-foreground">No open positions</p>
            </div>

            <div className="flex justify-center mt-auto w-full">
              <button className="text-blue-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                View All Positions
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          <div className="lg:col-span-1 h-[300px] overflow-hidden">
            <RecentActivityFeed trades={recentTrades.slice(0, 2)} isLoading={loading} />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-3 h-[300px]">
            <TopPerformers data={topPerformersData} className="flex-1" />
            <QuickStats
              className="shrink-0"
              stats={{
                avgWin: stats?.avg_win || 0,
                avgLoss: stats?.avg_loss || 0,
                bestTrade: stats?.max_win || 0,
                worstTrade: stats?.max_loss || 0,
                profitFactor: stats?.profit_factor ?? "0"
              }}
            />
          </div>
        </div>
      </div>

      <TradeEntryForm open={showTradeForm} onOpenChange={setShowTradeForm} onSuccess={fetchData} />

      <div style={{ display: 'none' }}>
        <ConnectionStatus
          isConnected={!!(mt5Status && mt5Status.account)}
          accountId={mt5Status?.account || ""}
          server={mt5Status?.server || ""}
          lastFetch={""}
        />
      </div>

      <DayTradesModal
        date={selectedDate}
        trades={dayTrades}
        open={showDayModal}
        onOpenChange={setShowDayModal}
      />

      <MonthlyRulePopup />
    </div>
  );
}
