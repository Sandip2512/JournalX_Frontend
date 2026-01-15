import React, { useState, useEffect } from "react";
import { TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StatCard } from "./StatCard";
import { ConnectionStatus } from "./ConnectionStatus";
import { TradesSummaryCard } from "./TradesSummaryCard";
import { TradeEntryForm } from "./TradeEntryForm";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { RecentActivityFeed } from "./RecentActivityFeed";
import { PerformanceChart } from "./PerformanceChart";
import { GoalTracker } from "./GoalTracker";
import { TotalTradesCard } from "./TotalTradesCard";

export function Dashboard() {
  const [showTradeForm, setShowTradeForm] = useState(false);
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [mt5Status, setMt5Status] = useState<any>(null);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [monthlyProfit, setMonthlyProfit] = useState<number>(0);
  const [weeklyProfit, setWeeklyProfit] = useState<number>(0);
  const [goalData, setGoalData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1Y");
  const [loading, setLoading] = useState(true);

  const fetchData = React.useCallback(async () => {
    if (user?.user_id) {
      if (!stats) setLoading(true);

      // Define all fetching tasks in parallel to avoid "Waterfall" loading
      const fetchTasks = [
        // 1. Stats
        api.get(`/trades/stats/user/${user.user_id}`)
          .then(res => setStats(res.data))
          .catch(e => console.error("Stats error", e)),

        // 2. MT5 Status
        api.get(`/users/${user.user_id}/mt5-status`)
          .then(res => setMt5Status(res.data))
          .catch(e => console.error("MT5 status error", e)),

        // 3. Recent Trades
        api.get(`/trades/user/${user.user_id}?limit=5&skip=0&sort=desc`)
          .then(res => {
            const tradesData = Array.isArray(res.data) ? res.data : (res.data.items || []);
            setRecentTrades(tradesData);
          })
          .catch(e => console.warn("Recent trades error", e)),

        // 4. Goals
        api.get(`/api/goals/user/${user.user_id}`)
          .then(res => {
            if (Array.isArray(res.data)) {
              setGoalData(res.data.filter((g: any) => g.is_active && g.target_amount > 0));
            } else {
              setGoalData([]);
            }
          })
          .catch(e => console.warn("Goals error", e)),

        // 5. Analytics
        api.get(`/api/analytics/user/${user.user_id}`)
          .then(res => setAnalyticsData(res.data.beginner))
          .catch(e => console.warn("Analytics error", e)),

        // 6. Profits (Monthly & Weekly)
        (async () => {
          try {
            const now = new Date();
            const calendarRes = await api.get(`/api/analytics/calendar?user_id=${user.user_id}&month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
            const monthData = calendarRes.data;
            const totalMonthly = monthData.reduce((sum: number, day: any) => sum + (day.profit || 0), 0);
            setMonthlyProfit(totalMonthly);

            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            let weekData = [...monthData];

            if (weekStart.getMonth() !== now.getMonth()) {
              try {
                const prevMonthRes = await api.get(`/api/analytics/calendar?user_id=${user.user_id}&month=${weekStart.getMonth() + 1}&year=${weekStart.getFullYear()}`);
                weekData = [...weekData, ...prevMonthRes.data];
              } catch (e) { }
            }

            let totalWeekly = 0;
            const getLocalDateStr = (d: Date) => {
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            };

            for (let i = 0; i < 7; i++) {
              const checkDate = new Date(weekStart);
              checkDate.setDate(weekStart.getDate() + i);
              const dayStr = getLocalDateStr(checkDate);
              const dayData = weekData.find((d: any) => d.date === dayStr);
              if (dayData) totalWeekly += dayData.profit;
            }
            setWeeklyProfit(totalWeekly);
          } catch (e) {
            console.warn("Profit calc error", e);
          }
        })()
      ];

      // Wait for all to complete (or fail) then stop loading
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

  const profitFactor = (stats?.total_loss !== 0 && stats?.total_loss !== undefined) ? Math.abs((stats?.total_profit || 0) / stats?.total_loss).toFixed(2) : "∞";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate monthly goal based on some logic or fixed for now
  const monthlyGoal = 1000; // This could come from user settings later

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Hero Section with Aurora Gradient */}
      <div className="relative w-full overflow-hidden bg-background border-b">
        <div className="absolute inset-0 aurora-bg animate-pulse-soft" />
        <div className="absolute inset-0 bg-grid-white/5" />

        <div className="container mx-auto px-4 lg:px-6 py-12 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mt-6">
            <div className="space-y-2 animate-fade-up">
              <div className="flex items-center justify-between lg:justify-start gap-4 mb-2">
                <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
                  <span className="text-gradient">Trading Journal</span>
                </h1>
                <div className="lg:hidden">
                  <ConnectionStatus
                    isConnected={mt5Status?.connected || false}
                    accountId={mt5Status?.account || "Not Connected"}
                    server={mt5Status?.server || "—"}
                    lastFetch={mt5Status?.last_fetch ? new Date(mt5Status.last_fetch).toLocaleString() : "Never"}
                    variant="compact"
                  />
                </div>
              </div>
              <p className="text-lg text-muted-foreground max-w-xl">
                Welcome back, <span className="text-foreground font-semibold">{user?.first_name}</span>.
                You're tracking <span className="text-foreground font-semibold px-2 py-0.5 rounded-full bg-primary/10">{stats?.total_trades || 0} trades</span> with a
                <span className={cn("ml-1 font-semibold", (stats?.win_rate || 0) >= 50 ? "text-emerald-500" : "text-amber-500")}>
                  {stats?.win_rate?.toFixed(1) || "0.0"}% win rate
                </span>.
              </p>
            </div>

            <div className="flex flex-col items-end gap-4">
              {/* Desktop Connection Status */}
              <div className="hidden lg:block">
                <ConnectionStatus
                  isConnected={mt5Status?.connected || false}
                  accountId={mt5Status?.account || "Not Connected"}
                  server={mt5Status?.server || "—"}
                  lastFetch={mt5Status?.last_fetch ? new Date(mt5Status.last_fetch).toLocaleString() : "Never"}
                  variant="compact"
                />
              </div>

              <Button
                variant="default"
                size="xl"
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg shadow-primary/25 animate-fade-up border border-primary/20"
                style={{ animationDelay: "0.1s" }}
                onClick={() => setShowTradeForm(true)}
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">New Trade Entry</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 -mt-8 relative z-20">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Row 1: Performance Chart (Large) + Goal Tracker + Win Rate */}
          <div className="md:col-span-2 stagger-1 animate-fade-up">
            <PerformanceChart
              analyticsData={analyticsData}
            />
          </div>

          {loading ? (
            <div className="hidden lg:block stagger-2" />
          ) : Array.isArray(goalData) && goalData.length > 0 ? (
            <div className="stagger-2 animate-fade-up h-full">
              <GoalTracker
                goals={goalData.map((g: any) => {
                  let current = 0;
                  let label = "";
                  if (g.goal_type === 'weekly') {
                    current = weeklyProfit;
                    label = "Weekly Goal";
                  } else if (g.goal_type === 'monthly') {
                    current = monthlyProfit;
                    label = "Monthly Goal";
                  } else if (g.goal_type === 'yearly') {
                    current = stats?.net_profit || 0;
                    label = "Yearly Goal";
                  }
                  return {
                    label,
                    current,
                    target: g.target_amount
                  };
                })}
              />
            </div>
          ) : (
            /* Placeholder to keep layout stable and Win Rate in 4th column */
            <div className="hidden lg:block stagger-2" />
          )}

          <div className="flex flex-col gap-6 stagger-3">
            <StatCard
              label="Win Rate"
              value={`${stats?.win_rate?.toFixed(1) || "0.0"}%`}
              valueClassName={(stats?.win_rate || 0) >= 50 ? "text-emerald-500" : "text-amber-500"}
              animationDelay="0.3s"
              className="animate-fade-up h-fit"
            />
            <TotalTradesCard
              count={stats?.total_trades || 0}
              animationDelay="0.6s"
              className="stagger-4 h-fit"
            />
          </div>

          {/* Row 2 - Feed & Summaries */}
          <div className="md:col-span-2 lg:col-span-2 row-span-2 stagger-4 animate-fade-up">
            <RecentActivityFeed trades={recentTrades} isLoading={loading} />
          </div>

          <TradesSummaryCard
            type="winning"
            count={stats?.winning_trades || 0}
            amount={stats?.total_profit || 0}
            animationDelay="0.4s"
            className="stagger-4 animate-fade-up h-fit"
          />
          <TradesSummaryCard
            type="losing"
            count={stats?.losing_trades || 0}
            amount={Math.abs(stats?.total_loss || 0)}
            animationDelay="0.5s"
            className="stagger-4 animate-fade-up h-fit"
          />
        </div>
      </div>

      {/* Trade Entry Form Modal */}
      <TradeEntryForm open={showTradeForm} onOpenChange={setShowTradeForm} onSuccess={fetchData} />
    </main>
  );
}
