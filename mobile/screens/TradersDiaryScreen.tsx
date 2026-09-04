import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { PremiumCard } from '../components/common/PremiumCard';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';

export default function TradersDiaryScreen() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Helper for date manipulation
    const getMonthName = (date: Date) => date.toLocaleString('default', { month: 'long' });
    const getYear = (date: Date) => date.getFullYear();

    const fetchDiary = useCallback(async () => {
        if (!user?.user_id) return;
        try {
            // Calculate start and end of month
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);

            const formatDate = (d: Date) => {
                return d.toISOString().split('T')[0];
            };

            const response = await api.get(`/api/analytics/diary`, {
                params: {
                    user_id: user.user_id,
                    start_date: formatDate(startDate),
                    end_date: formatDate(endDate)
                }
            });
            setStats(response.data);
            setSelectedDate(null); // Reset selection on month change
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user, currentDate]);

    useEffect(() => {
        fetchDiary();
    }, [fetchDiary]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDayPress = (dateStr: string) => {
        if (selectedDate === dateStr) {
            setSelectedDate(null); // Deselect if already selected
        } else {
            setSelectedDate(dateStr);
        }
    };

    const renderCalendarGrid = () => {
        if (!stats) return null;

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // 0 = Sunday, 1 = Monday. We want Monday start.
        // JS getDay(): Sun=0, Mon=1...Sat=6.
        // Monday start offset:
        // Mon(1) -> 0 offset
        // Sun(0) -> 6 offset
        const startDayOfWeek = firstDay.getDay();
        const offset = (startDayOfWeek + 6) % 7;

        const days = [];
        // Empty cells
        for (let i = 0; i < offset; i++) {
            days.push(<View key={`empty-${i}`} className="w-[13.5%] h-12 m-0.5" />);
        }

        // Days
        const dailyDataMap: any = {};
        stats.grid_data?.forEach((d: any) => {
            dailyDataMap[d.date] = d;
        });

        for (let d = 1; d <= daysInMonth; d++) {
            // Adjust local date string construction manually to avoid timezone issues
            const mStr = String(month + 1).padStart(2, '0');
            const dStr = String(d).padStart(2, '0');
            const dateStr = `${year}-${mStr}-${dStr}`;

            const data = dailyDataMap[dateStr];
            const isProfit = data && data.profit > 0;
            const isLoss = data && data.profit < 0;
            const isSelected = selectedDate === dateStr;

            days.push(
                <TouchableOpacity
                    key={d}
                    onPress={() => handleDayPress(dateStr)}
                    className={`w-[13.5%] h-12 m-0.5 rounded-lg border items-center justify-center ${isSelected
                        ? 'bg-slate-800 border-slate-900 shadow-lg'
                        : isProfit
                            ? 'bg-emerald-100 border-emerald-200'
                            : isLoss
                                ? 'bg-red-100 border-red-200'
                                : 'bg-slate-50 border-slate-100'
                        }`}
                >
                    <Text className={`text-[10px] absolute top-1 left-1 ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>{d}</Text>
                    {data && (
                        <Text className={`text-[9px] font-bold ${isSelected ? 'text-white' :
                            isProfit ? 'text-emerald-700' :
                                isLoss ? 'text-red-700' : 'text-slate-600'
                            }`}>
                            {isProfit ? '+' : ''}{Math.round(data.profit)}
                        </Text>
                    )}
                </TouchableOpacity>
            );
        }

        return (
            <View className="flex-row flex-wrap justify-start">
                {days}
            </View>
        );
    };

    // Safe date parser - Kept for legacy or other uses but not primary filter
    const getSafeDateStr = (dateInput: any): string | null => {
        try {
            if (!dateInput) return null;
            const d = new Date(dateInput);
            if (isNaN(d.getTime())) return null;
            return d.toISOString().split('T')[0];
        } catch (e) {
            return null;
        }
    };

    // Filter trades based on selection
    const displayedTrades = selectedDate
        ? stats?.trades_list?.filter((t: any) => {
            // Backend now provides iso_date (YYYY-MM-DD)
            // Fallback for caching: use getSafeDateStr on old format or try 'date' if it matches ISO (unexpected)
            if (t.iso_date) return t.iso_date === selectedDate;

            // Fallback to trying to parse 'date' ("Jan 15") - unreliable across years but okay for emergency
            // Or just check if 'date' string contains selection (unlikely)
            return false;
        })
        : [];

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1 px-4 pt-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDiary(); }} />
                }
            >
                <View className="flex-row items-center justify-between mb-6">
                    <View>
                        <Text className="text-3xl font-extrabold text-slate-900">Diary</Text>
                        <Text className="text-slate-500">Your trading journey.</Text>
                    </View>
                    <View className="bg-blue-50 p-2 rounded-xl">
                        <Calendar size={24} color="#3B82F6" />
                    </View>
                </View>

                {/* Net P/L Card */}
                <PremiumCard className="mb-6 bg-slate-900" variant="glass">
                    <View className="items-center py-2">
                        <Text className="text-slate-200 text-xs uppercase tracking-widest font-bold mb-1">
                            {selectedDate ? `Realised P/L (${selectedDate})` : `Net Realised P/L (${getMonthName(currentDate)})`}
                        </Text>
                        <Text className={`text-4xl font-black ${stats?.net_pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {selectedDate && displayedTrades.length > 0
                                ? `$${displayedTrades.reduce((acc: number, t: any) => acc + t.net_profit, 0).toFixed(2)}`
                                : `$${stats?.net_pl?.toLocaleString() || '0.00'}`}
                        </Text>
                        {!selectedDate && (
                            <View className="flex-row mt-4 space-x-8">
                                <View className="items-center">
                                    <Text className="text-slate-400 text-[10px] uppercase">Win Rate</Text>
                                    <Text className="text-white font-bold text-lg">
                                        {stats?.traded_on > 0 ? Math.round((stats?.in_profit_days / stats?.traded_on) * 100) : 0}%
                                    </Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-slate-400 text-[10px] uppercase">Trades</Text>
                                    <Text className="text-white font-bold text-lg">{stats?.trades_list?.length || 0}</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-slate-400 text-[10px] uppercase">Active Days</Text>
                                    <Text className="text-white font-bold text-lg">{stats?.traded_on || 0}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </PremiumCard>

                {/* Calendar Controls */}
                <View className="flex-row justify-between items-center bg-slate-50 p-2 rounded-xl mb-4">
                    <TouchableOpacity onPress={handlePrevMonth} className="p-2">
                        <ChevronLeft size={20} color="#64748B" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-slate-800">{getMonthName(currentDate)} {getYear(currentDate)}</Text>
                    <TouchableOpacity onPress={handleNextMonth} className="p-2">
                        <ChevronRight size={20} color="#64748B" />
                    </TouchableOpacity>
                </View>

                {/* Calendar Grid Header */}
                <View className="flex-row mb-2 px-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                        <Text key={d} className="w-[13.5%] text-center text-[10px] font-bold text-slate-400 uppercase m-0.5">
                            {d}
                        </Text>
                    ))}
                </View>

                {/* Calendar Grid */}
                {loading ? (
                    <View className="h-60 justify-center items-center">
                        <ActivityIndicator color="#3B82F6" />
                    </View>
                ) : (
                    <View className="mb-8">
                        {renderCalendarGrid()}
                    </View>
                )}

                {/* Recent Month Trades List */}
                <View className="mb-10">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-slate-900">
                            {selectedDate ? `Trades on ${selectedDate}` : 'Trades History'}
                        </Text>
                        {selectedDate && (
                            <TouchableOpacity onPress={() => setSelectedDate(null)}>
                                <Text className="text-blue-500 font-bold text-xs">Clear Filter</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {displayedTrades?.length > 0 ? (
                        displayedTrades.map((trade: any) => {
                            const displayDate = getSafeDateStr(trade.close_time || trade.date) || trade.date || 'N/A';
                            return (
                                <View key={trade.id || trade.trade_no} className="flex-row justify-between items-center py-3 border-b border-slate-100">
                                    <View>
                                        <Text className="font-bold text-slate-800">{trade.name || trade.symbol}</Text>
                                        <Text className="text-xs text-slate-400">{displayDate}</Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className={`font-bold ${trade.net_profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                            ${trade.net_profit?.toFixed(2)}
                                        </Text>
                                        <Text className="text-[10px] text-slate-400 uppercase font-bold">{trade.result}</Text>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <Text className="text-slate-400 text-center py-4">
                            {selectedDate ? `No trades found on ${selectedDate}.` : 'Select a date on the calendar to view trades.'}
                        </Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
