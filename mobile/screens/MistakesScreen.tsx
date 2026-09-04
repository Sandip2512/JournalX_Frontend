import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Dimensions, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { PremiumCard } from '../components/common/PremiumCard';
import { StatDisplay } from '../components/common/StatDisplay';
import { CreateMistakeModal } from '../components/mistakes/CreateMistakeModal';
import { PieChart } from 'react-native-gifted-charts';
import {
    AlertTriangle,
    AlertCircle,
    Activity,
    Target,
    Plus,
    TrendingDown
} from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export default function MistakesScreen() {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState<any>(null);
    const [customMistakes, setCustomMistakes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user?.user_id) return;
        try {
            const [analyticsRes, _] = await Promise.all([
                api.get(`/mistakes/analytics/${user.user_id}?time_filter=all`),
                api.get(`/mistakes/frequency/${user.user_id}?days=35`)
            ]);

            setAnalytics(analyticsRes.data);
            setCustomMistakes(analyticsRes.data?.customMistakes || []);
        } catch (error) {
            console.error("Mistakes data error", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const renderDistributionChart = () => {
        if (!analytics?.distribution || analytics.distribution.length === 0) return null;

        const pieData = analytics.distribution.map((d: any) => ({
            value: d.count,
            color: d.name === 'Behavioral' ? '#A855F7' :
                d.name === 'Psychological' ? '#EC4899' :
                    d.name === 'Technical' ? '#10B981' : '#3B82F6',
            text: `${d.percentage}%`
        }));

        return (
            <PremiumCard className="items-center mb-6">
                <Text className="text-lg font-bold text-slate-800 mb-6">Mistake Types</Text>
                <View className="items-center justify-center">
                    <PieChart
                        data={pieData}
                        donut
                        radius={100}
                        innerRadius={60}
                        showText
                        textColor="white"
                        textSize={14}
                        fontWeight="bold"
                        centerLabelComponent={() => (
                            <View className="items-center justify-center">
                                <Text className="text-2xl font-bold text-slate-800">{analytics.totalMistakes}</Text>
                                <Text className="text-xs text-slate-400">Total</Text>
                            </View>
                        )}
                    />
                </View>
                <View className="flex-row flex-wrap justify-center mt-8 gap-4 px-4">
                    {analytics.distribution.map((d: any) => (
                        <View key={d.name} className="flex-row items-center mr-2 mb-2">
                            <View className={`w-3 h-3 rounded-full mr-2`} style={{
                                backgroundColor: d.name === 'Behavioral' ? '#A855F7' :
                                    d.name === 'Psychological' ? '#EC4899' :
                                        d.name === 'Technical' ? '#10B981' : '#3B82F6'
                            }} />
                            <Text className="text-xs text-slate-500 font-bold">{d.name} ({d.count})</Text>
                        </View>
                    ))}
                </View>
            </PremiumCard>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1 px-4 pt-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EC4899']} />
                }
            >
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-3xl font-extrabold text-slate-900">Mistakes</Text>
                        <Text className="text-slate-500">Analyze & improve your errors.</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        className="bg-pink-500 p-3 rounded-full shadow-lg shadow-pink-200"
                    >
                        <Plus size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Stats Row */}
                <View className="flex-row justify-between mb-6">
                    <View className="w-[48%]">
                        <PremiumCard className="items-center py-6 bg-pink-50 border border-pink-100">
                            <StatDisplay
                                label="Total"
                                value={analytics?.totalMistakes || 0}
                                icon={AlertCircle}
                                color="#EC4899"
                            />
                        </PremiumCard>
                    </View>
                    <View className="w-[48%]">
                        <PremiumCard className="items-center py-6 bg-emerald-50 border border-emerald-100">
                            <StatDisplay
                                label="Score"
                                value={`${100 - (analytics?.improvement || 0)}%`}
                                icon={Target}
                                color="#10B981"
                            />
                        </PremiumCard>
                    </View>
                </View>

                {/* Most Common */}
                <PremiumCard className="mb-6 bg-orange-50 border border-orange-100" variant='outlined'>
                    <View className="items-center">
                        <Text className="text-xs text-orange-500 font-bold uppercase tracking-widest mb-1">Most Frequent Mistake</Text>
                        <Text className="text-2xl font-black text-slate-800 text-center mb-2">{analytics?.mostCommon?.name || "None yet"}</Text>
                        <View className="bg-orange-100 px-3 py-1 rounded-full">
                            <Text className="text-orange-700 text-xs font-bold">{analytics?.mostCommon?.count || 0} Occurrences</Text>
                        </View>
                    </View>
                </PremiumCard>

                {renderDistributionChart()}

                <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-slate-900">Recent Entries</Text>
                        <Text className="text-sm font-bold text-slate-400">{customMistakes.length} Total</Text>
                    </View>

                    {customMistakes.length === 0 ? (
                        <View className="items-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <Text className="text-slate-400 font-bold">No mistakes recorded</Text>
                        </View>
                    ) : (
                        <View className="space-y-3">
                            {customMistakes.slice(0, 5).map((mistake) => (
                                <View key={mistake.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex-row items-center justify-between">
                                    <View className="flex-row items-center flex-1 mr-4">
                                        <View className={`w-2 h-10 rounded-full mr-3 ${mistake.severity === 'High' ? 'bg-red-500' :
                                            mistake.severity === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
                                            }`} />
                                        <View>
                                            <Text className="font-bold text-slate-800 text-base">{mistake.name}</Text>
                                            <Text className="text-xs text-slate-400">{mistake.category} • {mistake.impact}</Text>
                                        </View>
                                    </View>
                                    <View className="bg-slate-100 w-8 h-8 rounded-lg items-center justify-center">
                                        <Text className="font-bold text-slate-600">{mistake.count}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <View className="h-10" />
            </ScrollView>
            <CreateMistakeModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={() => {
                    onRefresh();
                    setModalVisible(false); // Double check closing
                }}
            />
        </SafeAreaView>
    );
}
