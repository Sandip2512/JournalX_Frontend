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
import { MonthlyCalendar } from "./MonthlyCalendar";
import { TopPerformers } from "./TopPerformers";
import { QuickStats } from "./QuickStats";
import { DayTradesModal } from "./DayTradesModal";

export function Dashboard() {
  const [showTradeForm, setShowTradeForm] = useState(false);
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [mt5Status, setMt5Status] = useState<any>(null);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [calendarData, setCalendarData] = useState<any[]>([]);
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

        api.get(`/users/${user.user_id}/mt5-status`)
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
          .catch(e => console.warn("Analytics error", e)),

        (async () => {
          try {
            const now = new Date();
            const calendarRes = await api.get(`/api/analytics/calendar?user_id=${user.user_id}&month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
            setCalendarData(calendarRes.data);
          } catch (e) {
            console.warn("Calendar fetch error", e);
          }
        })()
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary shadow-[0_0_15px_rgba(11,102,228,0.4)]"></div>
      </div>
    );
  }

  const unrealizedPL = mt5Status?.equity - mt5Status?.balance || 0;
  const realizedPL = stats?.net_profit || 0;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-white">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold opacity-50">
            {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ConnectionStatus
            isConnected={mt5Status?.connected || false}
            accountId={mt5Status?.account || "Not Connected"}
            server={mt5Status?.server || "—"}
            lastFetch={mt5Status?.last_fetch ? new Date(mt5Status.last_fetch).toLocaleString() : "Never"}
            variant="compact"
          />
          <Button
            variant="default"
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-[0_0_15px_rgba(11,102,228,0.4)] rounded-xl h-11"
            onClick={() => setShowTradeForm(true)}
          >
            <Plus className="w-5 h-5" />
            <span className="font-bold uppercase tracking-wider text-[11px]">New Entry</span>
          </Button>
        </div>
      </div>

      <div className="relative z-20 space-y-6">
        {/* Row 1: Key Performance Metrics (Stat Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total P/L"
            value={`${realizedPL >= 0 ? "+" : ""}$${Math.abs(realizedPL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle={`${stats?.total_trades || 0} trades`}
            badge="Total"
            badgeClassName="bg-primary/20 text-primary border border-primary/30"
            icon={DollarSign}
            glowColor="primary"
            valueClassName={realizedPL >= 0 ? "text-primary" : "text-red-500"}
            animationDelay="0.1s"
          />
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

        {/* Row 2: Performance Chart & Monthly Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChart
              analyticsData={analyticsData}
              className="h-[450px]"
            />
          </div>
          <div className="lg:col-span-1">
            <MonthlyCalendar
              data={calendarData}
              trades={recentTrades}
              className="h-[450px]"
              onViewAll={(date, trades) => {
                setSelectedDate(date);
                setDayTrades(trades);
                setShowDayModal(true);
              }}
            />
          </div>
        </div>

        {/* Row 3: Feed, Open Positions, Top Performers, Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 glass-card-premium p-6 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <Layout className="w-12 h-12 text-primary/20" />
            <div className="space-y-1">
              <p className="font-bold text-muted-foreground/40 uppercase tracking-widest text-[10px]">Open Positions</p>
              <p className="text-xs text-muted-foreground px-4">No open positions currently available.</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <RecentActivityFeed trades={recentTrades.slice(0, 5)} isLoading={loading} />
          </div>

          <div className="lg:col-span-1 flex flex-col gap-6">
            <TopPerformers data={topPerformersData} />
            <QuickStats stats={{
              avgWin: stats?.avg_win || 0,
              avgLoss: stats?.avg_loss || 0,
              bestTrade: stats?.max_win || 0,
              worstTrade: stats?.max_loss || 0,
              profitFactor: stats?.profit_factor ?? "0"
            }} />
          </div>
        </div>
      </div>

      <TradeEntryForm open={showTradeForm} onOpenChange={setShowTradeForm} onSuccess={fetchData} />

      <DayTradesModal
        date={selectedDate}
        trades={dayTrades}
        open={showDayModal}
        onOpenChange={setShowDayModal}
      />
    </div>
  );
}
