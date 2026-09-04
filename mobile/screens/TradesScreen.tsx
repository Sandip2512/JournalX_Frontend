import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemedText } from '../components/common/ThemedText';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

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

export default function TradesScreen() {
    const { token, user } = useAuth();
    const { isDark } = useTheme();
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTrades = useCallback(async () => {
        if (!user?.user_id || !token) return;

        try {
            const response = await api.get(`/trades/user/${user.user_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Sort by close time descending (newest first)
            const sortedTrades = response.data.sort((a: Trade, b: Trade) => {
                return new Date(b.close_time).getTime() - new Date(a.close_time).getTime();
            });
            setTrades(sortedTrades);
        } catch (error: any) {
            console.error('Error fetching trades:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user, token]);

    useEffect(() => {
        fetchTrades();
    }, [fetchTrades]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTrades();
    };

    const renderTradeItem = ({ item }: { item: Trade }) => {
        const isProfit = item.net_profit >= 0;
        return (
            <TouchableOpacity className="bg-white dark:bg-slate-800 p-4 mb-3 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm mx-4">
                <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                        <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isProfit ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                            <MaterialCommunityIcons
                                name={item.type === 'buy' ? 'arrow-top-right' : 'arrow-bottom-left'}
                                size={20}
                                color={isProfit ? '#16A34A' : '#DC2626'}
                            />
                        </View>
                        <View>
                            <ThemedText className="font-bold text-lg">{item.symbol}</ThemedText>
                            <ThemedText variant="caption" className="font-medium text-xs text-slate-500 dark:text-slate-400">{item.type.toUpperCase()}</ThemedText>
                        </View>
                    </View>
                    <View className="items-end">
                        <ThemedText className={`font-bold text-lg ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {isProfit ? '+' : ''}${item.net_profit.toFixed(2)}
                        </ThemedText>
                        <ThemedText variant="caption" className="text-right">
                            {item.volume} Lot
                        </ThemedText>
                    </View>
                </View>
                <View className="flex-row justify-between mt-2 pt-3 border-t border-gray-50 dark:border-slate-700">
                    <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={12} color={isDark ? '#64748B' : '#94A3B8'} />
                        <ThemedText variant="caption" className="ml-1">
                            {new Date(item.open_time).toLocaleDateString()}
                        </ThemedText>
                    </View>
                    <ThemedText variant="caption">
                        {new Date(item.close_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </ThemedText>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <View className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 mb-2">
                <ThemedText variant="h2" className="mb-0">Trade History</ThemedText>
                <ThemedText variant="body" className="text-slate-500 dark:text-slate-400 text-sm">All your completed trades</ThemedText>
            </View>

            {loading && !refreshing ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color={isDark ? '#fff' : '#6366F1'} />
                    <ThemedText className="text-gray-500 mt-2">Loading trades...</ThemedText>
                </View>
            ) : (
                <FlatList
                    data={trades}
                    renderItem={renderTradeItem}
                    keyExtractor={(item) => item.trade_no.toString()}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} tintColor={isDark ? '#fff' : '#6366F1'} />
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20 px-4">
                            <View className="bg-gray-50 dark:bg-slate-800 p-6 rounded-full mb-4">
                                <MaterialCommunityIcons name="format-list-bulleted" size={32} color={isDark ? '#475569' : '#94A3B8'} />
                            </View>
                            <ThemedText className="text-center text-gray-400 mt-2">No trades found yet.</ThemedText>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
                />
            )}
            <StatusBar style={isDark ? 'light' : 'dark'} />
        </SafeAreaView>
    );
}
