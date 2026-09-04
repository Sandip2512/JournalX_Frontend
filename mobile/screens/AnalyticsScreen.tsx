import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LevelSelector } from '../components/analytics/LevelSelector';
import { InsightCard } from '../components/analytics/InsightCard';
import { PremiumCard } from '../components/common/PremiumCard';
import { StatDisplay } from '../components/common/StatDisplay';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import {
    Target,
    Layers,
    Activity,
    DollarSign,
    BarChart3,
    ShieldAlert,
    TrendingUp,
    TrendingDown,
    Calendar
} from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
    const { user } = useAuth();
    const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
    const [analytics, setAnalytics] = useState<any>(null);
    const [insights, setInsights] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAnalytics = useCallback(async () => {
        if (!user?.user_id) return;
        try {
            const [analyticsRes, insightsRes] = await Promise.all([
                api.get(`/api/analytics/user/${user.user_id}`),
                api.get(`/api/analytics/insights?user_id=${user.user_id}`)
            ]);
            setAnalytics(analyticsRes.data);
            setInsights(insightsRes.data);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAnalytics();
    };

    if (loading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <Activity size={32} color="#3B82F6" />
            </SafeAreaView>
        );
    }

    if (!analytics || !analytics.beginner) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center p-6">
                <Text className="text-lg font-bold text-slate-700">No Data Available</Text>
                <Text className="text-slate-500 text-center mt-2">Start journaling your trades to see analytics.</Text>
            </SafeAreaView>
        );
    }

    const renderStats = () => {
        const beginner = analytics.beginner;
        const intermediate = analytics.intermediate;
        const advanced = analytics.advanced;

        if (level === 'beginner') {
            return (
                <View className="flex-row flex-wrap justify-between">
                    <View className="w-[48%] mb-4">
                        <PremiumCard className="h-32 justify-center">
                            <StatDisplay
                                label="Not P/L"
                                value={`$${beginner.total_pl?.toFixed(2)}`}
                                icon={DollarSign}
                                color={beginner.total_pl >= 0 ? '#10B981' : '#EF4444'}
                            />
                        </PremiumCard>
                    </View>
                    <View className="w-[48%] mb-4">
                        <PremiumCard className="h-32 justify-center">
                            <StatDisplay
                                label="Win Rate"
                                value={`${beginner.win_rate?.toFixed(1)}%`}
                                icon={Target}
                                color="#3B82F6"
                            />
                        </PremiumCard>
                    </View>
                    <View className="w-[48%] mb-4">
                        <PremiumCard className="h-32 justify-center">
                            <StatDisplay
                                label="Trades"
                                value={beginner.total_trades}
                                icon={BarChart3}
                                color="#64748B"
                            />
                        </PremiumCard>
                    </View>
                    <View className="w-[48%] mb-4">
                        <PremiumCard className="h-32 justify-center">
                            <StatDisplay
                                label="Avg Risk"
                                value={`$${beginner.avg_risk?.toFixed(2)}`}
                                icon={ShieldAlert}
                                color="#F59E0B"
                            />
                        </PremiumCard>
                    </View>
                </View>
            );
        }

        if (level === 'intermediate') {
            const avgR = intermediate?.avg_r || 0;
            const bestStrategy = Object.entries(intermediate?.strategy_performance || {})
                .sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "N/A";

            return (
                <View className="flex-row flex-wrap justify-between">
                    <View className="w-[48%] mb-4">
                        <PremiumCard className="h-32 justify-center">
                            <StatDisplay
                                label="Avg R-Mult"
                                value={`${avgR.toFixed(2)}R`}
                                icon={Layers}
                                color="#8B5CF6"
                            />
                        </PremiumCard>
                    </View>
                    <View className="w-[48%] mb-4">
                        <PremiumCard className="h-32 justify-center">
                            <StatDisplay
                                label="Best Strategy"
                                value={bestStrategy}
                                icon={Activity}
                                color="#10B981"
                                subValue="Most Profitable"
                            />
                        </PremiumCard>
                    </View>
                    <View className="w-[48%] mb-4">
                        <PremiumCard className="h-32 justify-center">
                            <StatDisplay
                                label="Best Day"
                                value={Object.entries(intermediate?.day_of_week_performance || {})
                                    .sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "N/A"}
                                icon={Calendar}
                                color="#F59E0B"
                                subValue="By P/L"
                            />
                        </PremiumCard>
                    </View>
                </View>
            );
        }

        // Advanced
        return (
            <View className="flex-row flex-wrap justify-between">
                <View className="w-[48%] mb-4">
                    <PremiumCard className="h-32 justify-center">
                        <StatDisplay
                            label="Expectancy"
                            value={`$${advanced?.expectancy?.toFixed(2)}`}
                            icon={TrendingUp}
                            color={advanced?.expectancy >= 0 ? '#10B981' : '#EF4444'}
                        />
                    </PremiumCard>
                </View>
                <View className="w-[48%] mb-4">
                    <PremiumCard className="h-32 justify-center">
                        <StatDisplay
                            label="Max DD"
                            value={`$${advanced?.max_drawdown?.toFixed(2)}`}
                            icon={TrendingDown}
                            color="#EF4444"
                        />
                    </PremiumCard>
                </View>
            </View>
        );
    };

    const renderCharts = () => {
        if (level === 'beginner') {
            const equityData = analytics.beginner.equity_curve?.map((p: any) => ({
                value: p.equity,
                label: new Date(p.time).getDate().toString()
            })) || [];

            if (equityData.length === 0) return null;

            return (
                <PremiumCard className="mb-6 p-2" variant="outlined">
                    <Text className="text-lg font-bold text-slate-800 mb-4 ml-2">Equity Curve</Text>
                    <View className="items-center">
                        <LineChart
                            data={equityData}
                            height={200}
                            width={screenWidth - 80}
                            initialSpacing={20}
                            color="#10B981"
                            thickness={3}
                            startFillColor="rgba(16, 185, 129, 0.3)"
                            endFillColor="rgba(16, 185, 129, 0.01)"
                            startOpacity={0.9}
                            endOpacity={0.2}
                            areaChart
                            hideDataPoints
                            rulesColor="gray"
                            rulesType="solid"
                            yAxisColor="transparent"
                            xAxisColor="transparent"
                            yAxisTextStyle={{ color: '#94A3B8', fontSize: 10 }}
                        />
                    </View>
                </PremiumCard>
            );
        }

        // Intermediate - Bar Charts
        if (level === 'intermediate') {
            const dayData = Object.entries(analytics.intermediate?.day_of_week_performance || {})
                .map(([name, pl]: [string, any]) => ({
                    value: Math.abs(pl),
                    frontColor: pl >= 0 ? '#10B981' : '#EF4444',
                    label: name.substring(0, 3)
                }));

            return (
                <PremiumCard className="mb-6 p-2" variant="outlined">
                    <Text className="text-lg font-bold text-slate-800 mb-4 ml-2">Day Performance</Text>
                    <View className="items-center">
                        <BarChart
                            data={dayData}
                            barWidth={32}
                            spacing={24}
                            roundedTop
                            roundedBottom
                            hideRules
                            xAxisThickness={0}
                            yAxisThickness={0}
                            yAxisTextStyle={{ color: '#94A3B8', fontSize: 10 }}
                            noOfSections={3}
                            maxValue={Math.max(...dayData.map(d => d.value)) * 1.2}
                            height={200}
                            width={screenWidth - 80}
                        />
                    </View>
                </PremiumCard>
            );
        }

        // Advanced - MAE/MFE Placeholder (Scatter charts are complex in simple libraries)
        return (
            <PremiumCard className="mb-6 p-6 justify-center items-center h-48 bg-slate-50">
                <Text className="text-slate-400 font-bold">Advanced Scatter Charts</Text>
                <Text className="text-slate-400 text-xs mt-2">Available on Web Dashboard</Text>
            </PremiumCard>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1 px-4 pt-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />
                }
            >
                <Text className="text-3xl font-extrabold text-slate-900 mb-2">Analytics</Text>
                <Text className="text-slate-500 mb-6">Uncover hidden patterns in your trading.</Text>

                <LevelSelector currentLevel={level} onSelect={setLevel} />

                {insights.length > 0 && (
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-slate-800 mb-3">AI Insights</Text>
                        {insights.map((insight, index) => (
                            <InsightCard key={index} type={insight.type} text={insight.text} />
                        ))}
                    </View>
                )}

                <View className="mb-6">
                    {renderStats()}
                </View>

                {renderCharts()}

                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
