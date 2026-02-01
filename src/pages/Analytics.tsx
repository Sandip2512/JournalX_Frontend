import React, { useState, useEffect } from "react";
import UserLayout from "@/components/layout/UserLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, History, Target, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { PerformanceMetrics } from "@/components/analytics/PerformanceMetrics";
import { QuickStats } from "@/components/analytics/QuickStats";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { LongVsShort, DayPerformance, TopSymbols } from "@/components/analytics/TradeAnalysisCharts";
import { WinLossDistribution } from "@/components/analytics/WinLossDistribution";
import { TradeAnalysisTab } from "@/components/analytics/TradeAnalysisTab";
import { AnalyticsGoalsTab } from "@/components/analytics/AnalyticsGoalsTab";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { FeatureGate } from "@/components/auth/FeatureGate";

const Analytics = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [recentTrades, setRecentTrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.user_id) return;
            setLoading(true);
            try {
                const [statsRes, analyticsRes, tradesRes] = await Promise.all([
                    api.get(`/trades/stats/user/${user.user_id}`),
                    api.get(`/api/analytics/user/${user.user_id}`),
                    api.get(`/trades/user/${user.user_id}?limit=5&sort=desc`)
                ]);

                setStats(statsRes.data);
                setAnalyticsData(analyticsRes.data);
                setRecentTrades(Array.isArray(tradesRes.data) ? tradesRes.data : (tradesRes.data.items || []));
            } catch (error) {
                console.error("Error fetching analytics data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.user_id]);

    if (loading) {
        return (
            <UserLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary shadow-[0_0_15px_rgba(11,102,228,0.4)]"></div>
                </div>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <div className="space-y-8 animate-fade-up">
                {/* Free Tier Banner */}
                {(user?.subscription_tier === 'free' || !user?.subscription_tier) && (
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Info className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-foreground dark:text-white">Free Plan Analytics Limit</h4>
                                <p className="text-xs text-muted-foreground font-medium">Analytics are calculated based on your last 30 days of trading. Upgrade to Pro for full history analysis.</p>
                            </div>
                        </div>
                        <Button size="sm" variant="outline" className="h-8 text-[10px] font-black uppercase tracking-widest px-6" onClick={() => window.location.href = '/plans'}>Upgrade</Button>
                    </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-white flex items-center gap-3">
                            <BarChart3 className="w-8 h-8 text-primary" />
                            Journal Analysis
                        </h1>
                        <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold opacity-50">
                            Deep dive into your performance and behavior
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="performance" className="w-full space-y-8 text-foreground">
                    <TabsList className="bg-muted/50 dark:bg-[#111114] border border-border dark:border-white/5 p-1 rounded-2xl h-14 w-full lg:w-fit shadow-xl">
                        <TabsTrigger
                            value="performance"
                            className="px-8 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(11,102,228,0.4)] transition-all font-bold uppercase tracking-wider text-[11px] gap-2 text-muted-foreground hover:text-foreground dark:hover:text-white"
                        >
                            <TrendingUp className="w-4 h-4" />
                            Performance
                        </TabsTrigger>
                        <TabsTrigger
                            value="analysis"
                            className="px-8 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(11,102,228,0.4)] transition-all font-bold uppercase tracking-wider text-[11px] gap-2 text-muted-foreground hover:text-foreground dark:hover:text-white"
                        >
                            <BarChart3 className="w-4 h-4" />
                            Trade Analysis
                        </TabsTrigger>
                        <TabsTrigger
                            value="goals"
                            className="px-8 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(11,102,228,0.4)] transition-all font-bold uppercase tracking-wider text-[11px] gap-2 text-muted-foreground hover:text-foreground dark:hover:text-white"
                        >
                            <Target className="w-4 h-4" />
                            Goals
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="px-8 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(11,102,228,0.4)] transition-all font-bold uppercase tracking-wider text-[11px] gap-2 text-muted-foreground hover:text-foreground dark:hover:text-white"
                        >
                            <History className="w-4 h-4" />
                            History
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="performance" className="space-y-8 border-none p-0 outline-none">
                        {/* Top Stat Cards */}
                        <PerformanceMetrics stats={stats} />

                        {/* Main Row: Equity Curve and Quick Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <PerformanceChart
                                    analyticsData={analyticsData?.beginner}
                                    className="h-full min-h-[450px]"
                                />
                            </div>
                            <div className="lg:col-span-1">
                                <FeatureGate tier="pro">
                                    <QuickStats stats={stats} className="h-full" />
                                </FeatureGate>
                            </div>
                        </div>

                        {/* Bottom Row: Breakdown and Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <LongVsShort data={analyticsData?.intermediate} />
                                <WinLossDistribution stats={stats} />
                            </div>
                            <div className="space-y-6 flex flex-col">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FeatureGate tier="pro">
                                        <DayPerformance data={analyticsData?.intermediate?.day_of_week_performance} />
                                    </FeatureGate>
                                    <FeatureGate tier="pro">
                                        <TopSymbols data={analyticsData?.intermediate?.top_symbols} />
                                    </FeatureGate>
                                </div>
                                <div className="flex-1">
                                    <RecentActivityFeed trades={recentTrades} isLoading={loading} />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="analysis" className="border-none p-0 outline-none">
                        <FeatureGate tier="pro">
                            <TradeAnalysisTab />
                        </FeatureGate>
                    </TabsContent>

                    <TabsContent value="goals" className="border-none p-0 outline-none">
                        <FeatureGate tier="pro">
                            <AnalyticsGoalsTab stats={analyticsData?.beginner} />
                        </FeatureGate>
                    </TabsContent>

                    <TabsContent value="history" className="border-none p-0 outline-none">
                        <RecentActivityFeed trades={recentTrades} isLoading={loading} />
                    </TabsContent>
                </Tabs>
            </div>
        </UserLayout>
    );
};

export default Analytics;
