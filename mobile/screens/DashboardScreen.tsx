import React, { useEffect, useState, useCallback } from 'react';
import { View, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { ThemedText } from '../components/common/ThemedText';
import { useTheme } from '../context/ThemeContext';

interface Trade {
    trade_no: number;
    symbol: string;
    type: string;
    volume: number;
    price_open: number;
    price_close: number;
    net_profit: number;
    open_time: string;
    close_time: string;
}

interface Stats {
    total_trades: number;
    win_rate: number;
    net_profit: number;
    total_profit: number;
    total_loss: number;
}

export default function DashboardScreen() {
    const { token, user, logout } = useAuth();
    const { isDark } = useTheme();
    const [trades, setTrades] = useState<Trade[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const fetchData = useCallback(async () => {
        if (!user?.user_id || !token) return;

        try {
            const tradesRes = await api.get(`/trades/user/${user.user_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTrades(tradesRes.data);

            const t: Trade[] = tradesRes.data;
            const wins = t.filter(x => x.net_profit > 0).length;
            const total = t.length;
            const profit = t.reduce((acc, curr) => acc + (curr.net_profit > 0 ? curr.net_profit : 0), 0);
            const loss = t.reduce((acc, curr) => acc + (curr.net_profit < 0 ? curr.net_profit : 0), 0);

            setStats({
                total_trades: total,
                win_rate: total > 0 ? (wins / total) * 100 : 0,
                net_profit: profit + loss,
                total_profit: profit,
                total_loss: loss
            });

        } catch (error: any) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user, token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const renderTradeItem = (item: Trade) => {
        const isProfit = item.net_profit >= 0;
        return (
            <View key={item.trade_no} className="flex-row justify-between items-center py-4 border-b border-gray-100 dark:border-slate-800">
                <View className="flex-row items-center flex-1">
                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isProfit ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                        <MaterialCommunityIcons
                            name={item.type === 'buy' ? 'arrow-top-right' : 'arrow-bottom-left'}
                            size={20}
                            color={isProfit ? '#16A34A' : '#DC2626'}
                        />
                    </View>
                    <View>
                        <ThemedText className="font-bold text-base">{item.symbol}</ThemedText>
                        <ThemedText variant="caption" className="mt-0.5">{new Date(item.close_time).toLocaleDateString()} • {item.type.toUpperCase()}</ThemedText>
                    </View>
                </View>
                <View className="items-end">
                    <ThemedText className={`font-bold text-base ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {isProfit ? '+' : ''}${item.net_profit.toFixed(2)}
                    </ThemedText>
                    <ThemedText variant="caption" className="mt-0.5">
                        {item.volume} Lot
                    </ThemedText>
                </View>
            </View>
        );
    };

    const recentTrades = trades.slice(0, 5);

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {loading && !refreshing ? (
                <View className="flex-1 items-center justify-center">
                    <ThemedText className="text-gray-400 font-medium">Loading Dashboard...</ThemedText>
                </View>
            ) : (
                <ScrollView
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} tintColor={isDark ? '#fff' : '#6366F1'} />
                    }
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View className="flex-row justify-between items-center px-6 pt-6 pb-8 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 rounded-b-[30px] shadow-sm mb-6">
                        <View>
                            <ThemedText variant="caption" className="font-bold text-indigo-500 tracking-widest uppercase mb-1">Welcome Back</ThemedText>
                            <ThemedText variant="h1" className="text-3xl font-black text-slate-900 dark:text-white">{user?.first_name}</ThemedText>
                        </View>
                        <TouchableOpacity onPress={logout} className="w-12 h-12 bg-indigo-50 dark:bg-slate-800 rounded-full items-center justify-center border border-indigo-100 dark:border-slate-700 shadow-sm">
                            <MaterialCommunityIcons name="logout" size={22} color={isDark ? '#818CF8' : '#4F46E5'} />
                        </TouchableOpacity>
                    </View>

                    {/* Main Stats Card */}
                    <View className="px-6 mb-8">
                        <LinearGradient
                            colors={['#6366F1', '#4F46E5']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="w-full p-6 rounded-3xl shadow-lg shadow-indigo-500/30"
                        >
                            <View className="flex-row justify-between items-start mb-2">
                                <ThemedText className="text-indigo-100 text-sm font-medium">Total Net Profit</ThemedText>
                                <MaterialCommunityIcons name="wallet" size={24} color="#E0E7FF" />
                            </View>
                            <ThemedText className="text-white text-4xl font-bold tracking-tight">
                                ${stats?.net_profit.toFixed(2) || '0.00'}
                            </ThemedText>
                            <View className="flex-row mt-6 items-center bg-indigo-800/30 self-start px-3 py-1.5 rounded-lg border border-indigo-400/20">
                                <MaterialCommunityIcons name="trending-up" size={16} color="#4ADE80" />
                                <ThemedText className="text-green-300 text-xs font-bold ml-1.5">
                                    {stats?.win_rate.toFixed(1)}% Win Rate
                                </ThemedText>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Secondary Stats Grid */}
                    <View className="px-6 flex-row justify-between mb-8">
                        <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex-1 mr-3 border border-gray-100 dark:border-slate-700 shadow-sm">
                            <View className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full items-center justify-center mb-3">
                                <MaterialCommunityIcons name="chart-bar" size={18} color="#9333EA" />
                            </View>
                            <ThemedText variant="label" className="text-xs uppercase">Total Trades</ThemedText>
                            <ThemedText className="text-xl font-bold mt-1">{stats?.total_trades || 0}</ThemedText>
                        </View>
                        <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex-1 ml-3 border border-gray-100 dark:border-slate-700 shadow-sm">
                            <View className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mb-3">
                                <MaterialCommunityIcons name="cash" size={18} color="#16A34A" />
                            </View>
                            <ThemedText variant="label" className="text-xs uppercase">Profitable</ThemedText>
                            <ThemedText className="text-xl font-bold mt-1">${stats?.total_profit.toFixed(0) || 0}</ThemedText>
                        </View>
                    </View>

                    {/* Recent Transactions */}
                    <View className="px-6 pb-10">
                        <View className="flex-row justify-between items-center mb-4">
                            <ThemedText variant="h3">Recent Activity</ThemedText>
                            <TouchableOpacity onPress={() => navigation.navigate('Trades')}>
                                <ThemedText className="text-primary dark:text-primary-light text-sm font-semibold">View All</ThemedText>
                            </TouchableOpacity>
                        </View>

                        {recentTrades.length > 0 ? (
                            <View className="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-sm border border-gray-100 dark:border-slate-700">
                                {recentTrades.map(renderTradeItem)}
                            </View>
                        ) : (
                            <View className="items-center justify-center py-12 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                                <MaterialCommunityIcons name="clipboard-text-outline" size={40} color={isDark ? '#475569' : '#94A3B8'} />
                                <ThemedText className="text-gray-400 mt-3 text-sm font-medium">No recent trades</ThemedText>
                            </View>
                        )}
                    </View>
                </ScrollView>
            )}
            <StatusBar style={isDark ? 'light' : 'dark'} />
        </SafeAreaView>
    );
}
