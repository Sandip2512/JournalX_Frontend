import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import api from '../services/api';
import { styled } from 'nativewind';

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

export default function Dashboard({ token, userId, onLogout }: { token: string, userId: string, onLogout: () => void }) {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTrades = async () => {
        try {
            console.log('Fetching trades for user:', userId);
            const response = await api.get(`/trades/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Trades fetched:', response.data.length);
            setTrades(response.data);
        } catch (error: any) {
            console.error('Error fetching trades:', error.response?.data || error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTrades();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTrades();
    };

    const renderTradeItem = ({ item }: { item: Trade }) => {
        const isProfit = item.net_profit >= 0;
        return (
            <View className="bg-white p-4 mb-3 rounded-xl border border-gray-100 shadow-sm">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="font-bold text-lg text-gray-800">{item.symbol}</Text>
                    <Text className={`font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                        ${item.net_profit.toFixed(2)}
                    </Text>
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-gray-500 text-sm">{item.type} • {item.volume} Lot</Text>
                    <Text className="text-gray-400 text-xs">
                        {new Date(item.close_time).toLocaleDateString()}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50 pt-10 px-4">
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold text-gray-900">My Trades</Text>
                <TouchableOpacity onPress={onLogout} className="bg-gray-200 px-4 py-2 rounded-lg">
                    <Text className="text-gray-700 font-medium">Logout</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <Text className="text-center text-gray-500 mt-10">Loading trades...</Text>
            ) : (
                <FlatList
                    data={trades}
                    renderItem={renderTradeItem}
                    keyExtractor={(item) => item.trade_no.toString()}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <Text className="text-center text-gray-500 mt-10">No trades found.</Text>
                    }
                />
            )}
        </View>
    );
}
