import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Modal, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { GoalCard } from '../components/goals/GoalCard';
import { PremiumCard } from '../components/common/PremiumCard';
import {
    Target,
    Activity,
    TrendingUp,
    Trophy,
    Settings,
    X
} from 'lucide-react-native';

interface Goal {
    id: string;
    goal_type: 'weekly' | 'monthly' | 'yearly';
    target_amount: number;
    is_active: boolean;
}

export default function GoalsScreen() {
    const { user } = useAuth();
    const [goals, setGoals] = useState<Record<string, Goal>>({});
    const [stats, setStats] = useState<any>({ weekly_profit: 0, monthly_profit: 0, total_pl: 0, yearly_profit: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // Settings Form State
    const [form, setForm] = useState({
        weekly: '',
        monthly: '',
        yearly: ''
    });

    const fetchData = useCallback(async () => {
        if (!user?.user_id) return;
        try {
            const [goalsRes, analyticsRes] = await Promise.all([
                api.get(`/api/goals/user/${user.user_id}`),
                api.get(`/api/analytics/user/${user.user_id}`)
            ]);

            const goalsMap: Record<string, Goal> = {};
            if (Array.isArray(goalsRes.data)) {
                goalsRes.data.forEach((g: Goal) => {
                    if (g.is_active) goalsMap[g.goal_type] = g;
                });
            }
            setGoals(goalsMap);
            setForm({
                weekly: goalsMap['weekly']?.target_amount.toString() || '',
                monthly: goalsMap['monthly']?.target_amount.toString() || '',
                yearly: goalsMap['yearly']?.target_amount.toString() || '',
            });

            // Sync sophisticated stats logic from web
            // For mobile simplicity, we use the beginner stats but try to fetch calendar data if needed
            let currentStats = analyticsRes.data?.beginner || {};

            // Basic sync attempt
            try {
                const now = new Date();
                const calendarRes = await api.get(`/api/analytics/calendar?user_id=${user.user_id}&month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
                const monthData = calendarRes.data;
                const totalMonthly = monthData.reduce((sum: number, day: any) => sum + (day.profit || 0), 0);

                // Weekly calc
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                let totalWeekly = 0;
                const getLocalDateStr = (d: Date) => {
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const d_str = String(d.getDate()).padStart(2, '0');
                    return `${y}-${m}-${d_str}`;
                };

                for (let i = 0; i < 7; i++) {
                    const checkDate = new Date(weekStart);
                    checkDate.setDate(weekStart.getDate() + i);
                    const dayStr = getLocalDateStr(checkDate);
                    const dayData = monthData.find((d: any) => d.date === dayStr);
                    if (dayData) totalWeekly += dayData.profit;
                }

                currentStats = {
                    ...currentStats,
                    monthly_profit: totalMonthly,
                    weekly_profit: totalWeekly
                };
            } catch (e) {
                console.log("Calendar sync failed, using default stats");
            }

            setStats(currentStats);

        } catch (error) {
            console.error("Error fetching goals data:", error);
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

    const handleSave = async () => {
        try {
            const goalTypes = ['weekly', 'monthly', 'yearly'] as const;
            const promises = goalTypes.map(type => {
                const target = Number(form[type as keyof typeof form]);
                if (target > 0) {
                    return api.post(`/api/goals/?user_id=${user?.user_id}`, {
                        goal_type: type,
                        target_amount: target
                    });
                }
                return Promise.resolve();
            });

            await Promise.all(promises);
            setModalVisible(false);
            onRefresh();
            alert('Goals Updated Successfully');
        } catch (e) {
            alert('Failed to update goals');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1 px-4 pt-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />
                }
            >
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-3xl font-extrabold text-slate-900">Goals</Text>
                        <Text className="text-slate-500">Track your progress & discipline.</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        className="bg-slate-100 p-3 rounded-full"
                    >
                        <Settings size={24} color="#334155" />
                    </TouchableOpacity>
                </View>

                {/* Total Account Growth Card */}
                <PremiumCard className="mb-8 overflow-hidden relative min-h-[160px] justify-center items-center">
                    <View className="absolute right-[-20] top-[-20] opacity-10 rotate-12">
                        <Trophy size={140} color="#000" />
                    </View>
                    <View className="items-center">
                        <View className="flex-row items-center mb-2">
                            <Trophy size={16} color="#F59E0B" />
                            <Text className="text-slate-500 font-medium ml-2 uppercase tracking-wide">Total Account Growth</Text>
                        </View>
                        <Text className={`text-4xl font-black ${stats.total_pl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            ${stats.total_pl?.toLocaleString()}
                        </Text>
                        <View className={`mt-2 px-4 py-1 rounded-full ${stats.total_pl >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                            <Text className={`text-xs font-bold ${stats.total_pl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {stats.total_pl >= 0 ? '🚀 Profitable' : '📉 In Loss'}
                            </Text>
                        </View>
                    </View>
                </PremiumCard>

                <GoalCard
                    type="Weekly"
                    target={goals['weekly']?.target_amount || 0}
                    current={stats.weekly_profit || 0}
                    icon={Activity}
                    colorScheme="blue"
                />

                <GoalCard
                    type="Monthly"
                    target={goals['monthly']?.target_amount || 0}
                    current={stats.monthly_profit || 0}
                    icon={Target}
                    colorScheme="green"
                />

                <GoalCard
                    type="Yearly"
                    target={goals['yearly']?.target_amount || 0}
                    current={stats.yearly_profit || 0} // yearly_profit might need proper mapping from total_pl if purely P/L based
                    icon={TrendingUp}
                    colorScheme="purple"
                />

                <View className="h-20" />
            </ScrollView>

            {/* Settings Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 h-[70%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-slate-900">Set Your Goals</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            <View className="space-y-6">
                                <View>
                                    <Text className="text-sm font-bold text-slate-500 mb-2 uppercase">Weekly Target ($)</Text>
                                    <TextInput
                                        className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-lg font-bold"
                                        keyboardType="numeric"
                                        placeholder="e.g. 500"
                                        value={form.weekly}
                                        onChangeText={t => setForm({ ...form, weekly: t })}
                                    />
                                </View>
                                <View>
                                    <Text className="text-sm font-bold text-slate-500 mb-2 uppercase">Monthly Target ($)</Text>
                                    <TextInput
                                        className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-lg font-bold"
                                        keyboardType="numeric"
                                        placeholder="e.g. 2000"
                                        value={form.monthly}
                                        onChangeText={t => setForm({ ...form, monthly: t })}
                                    />
                                </View>
                                <View>
                                    <Text className="text-sm font-bold text-slate-500 mb-2 uppercase">Yearly Target ($)</Text>
                                    <TextInput
                                        className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-lg font-bold"
                                        keyboardType="numeric"
                                        placeholder="e.g. 25000"
                                        value={form.yearly}
                                        onChangeText={t => setForm({ ...form, yearly: t })}
                                    />
                                </View>

                                <TouchableOpacity
                                    onPress={handleSave}
                                    className="bg-blue-600 p-4 rounded-xl items-center mt-4 shadow-lg shadow-blue-200"
                                >
                                    <Text className="text-white font-bold text-lg">Save Goals</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
