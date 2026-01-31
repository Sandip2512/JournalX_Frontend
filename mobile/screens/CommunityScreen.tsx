import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { PremiumCard } from '../components/common/PremiumCard';
import { MessageSquare, Users, Trophy, ChevronRight } from 'lucide-react-native';

export default function CommunityScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [onlineCount, setOnlineCount] = useState(42); // Mock for now or fetch real

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1 px-4 pt-4"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View className="mb-6">
                    <Text className="text-3xl font-extrabold text-slate-900">Community</Text>
                    <Text className="text-slate-500">Connect with traders worldwide.</Text>
                </View>

                {/* Traders Lounge Main Card */}
                <TouchableOpacity onPress={() => alert('Chat Feature Coming Soon!')}>
                    <PremiumCard className="mb-6 bg-blue-600 border-0" variant="glass">
                        <View className="flex-row justify-between items-start mb-4">
                            <View className="bg-white/20 p-3 rounded-2xl">
                                <MessageSquare size={32} color="white" />
                            </View>
                            <View className="bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 flex-row items-center">
                                <View className="w-2 h-2 rounded-full bg-emerald-400 mr-2" />
                                <Text className="text-emerald-100 text-xs font-bold">{onlineCount} Online</Text>
                            </View>
                        </View>
                        <Text className="text-2xl font-bold text-white mb-2">Traders Lounge</Text>
                        <Text className="text-blue-100 mb-6 leading-5">
                            Share insights, discuss markets, and learn from the community in real time.
                        </Text>
                        <View className="flex-row items-center">
                            <Text className="text-white font-bold mr-2">Enter the Lounge</Text>
                            <ChevronRight size={16} color="white" />
                        </View>
                    </PremiumCard>
                </TouchableOpacity>

                {/* Grid Menu */}
                <View className="flex-row justify-between mb-4">
                    <TouchableOpacity className="w-[48%]" onPress={() => { }}>
                        <PremiumCard className="h-40 justify-between">
                            <View className="bg-blue-50 w-10 h-10 rounded-xl items-center justify-center">
                                <Users size={20} color="#3B82F6" />
                            </View>
                            <View>
                                <Text className="font-bold text-lg text-slate-800">Friends</Text>
                                <Text className="text-slate-400 text-xs">0 Connections</Text>
                            </View>
                        </PremiumCard>
                    </TouchableOpacity>

                    <TouchableOpacity className="w-[48%]" onPress={() => { }}>
                        <PremiumCard className="h-40 justify-between">
                            <View className="bg-amber-50 w-10 h-10 rounded-xl items-center justify-center">
                                <Trophy size={20} color="#F59E0B" />
                            </View>
                            <View>
                                <Text className="font-bold text-lg text-slate-800">Leaderboard</Text>
                                <Text className="text-slate-400 text-xs">Top Traders</Text>
                            </View>
                        </PremiumCard>
                    </TouchableOpacity>
                </View>

                <PremiumCard className="opacity-50">
                    <Text className="font-bold text-slate-800 mb-1">Trade Rooms</Text>
                    <Text className="text-slate-400 text-xs">Private strategy rooms coming soon.</Text>
                </PremiumCard>

            </ScrollView>
        </SafeAreaView>
    );
}
