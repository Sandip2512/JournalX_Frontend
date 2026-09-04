import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
    BarChart3,
    AlertTriangle,
    Target,
    Users,
    User,
    ChevronRight,
    LogOut,
    Moon,
    Sun
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { ThemedText } from '../components/common/ThemedText';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

export default function MoreScreen() {
    const navigation = useNavigation<any>();
    const { logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    const menuItems = [
        { label: 'Analytics', icon: BarChart3, color: '#3B82F6', route: 'Analytics' },
        { label: 'Mistakes', icon: AlertTriangle, color: '#EF4444', route: 'Mistakes' },
        { label: 'Goals', icon: Target, color: '#10B981', route: 'Goals' },
        { label: 'Community', icon: Users, color: '#F59E0B', route: 'Community' },
        { label: 'Profile', icon: User, color: '#8B5CF6', route: 'Profile' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <View className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 mb-2">
                <ThemedText variant="h2" className="mb-0">Menu</ThemedText>
                <ThemedText variant="body" className="text-slate-500 dark:text-slate-400 text-sm">Access all features</ThemedText>
            </View>

            <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                <View className="space-y-3">
                    {/* Theme Toggle Card */}
                    <TouchableOpacity onPress={toggleTheme}>
                        <View className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm mb-4">
                            <View className="flex-row items-center space-x-4">
                                <View className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700">
                                    {isDark ? (
                                        <Moon size={24} color="#94A3B8" />
                                    ) : (
                                        <Sun size={24} color="#F59E0B" />
                                    )}
                                </View>
                                <View className="ml-4">
                                    <ThemedText className="text-lg font-bold">Appearance</ThemedText>
                                    <ThemedText variant="caption">{isDark ? 'Dark Mode' : 'Light Mode'}</ThemedText>
                                </View>
                            </View>
                            <View>
                                {isDark ? (
                                    <View className="bg-indigo-500 px-3 py-1 rounded-full"><ThemedText className="text-white text-xs font-bold">ON</ThemedText></View>
                                ) : (
                                    <View className="bg-slate-200 px-3 py-1 rounded-full"><ThemedText className="text-slate-600 text-xs font-bold">OFF</ThemedText></View>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>

                    {menuItems.map((item) => (
                        <TouchableOpacity key={item.label} onPress={() => navigation.navigate(item.route)}>
                            <View className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm mb-3">
                                <View className="flex-row items-center space-x-4">
                                    <View className="p-3 rounded-xl" style={{ backgroundColor: isDark ? `${item.color}20` : `${item.color}15` }}>
                                        <item.icon size={24} color={item.color} />
                                    </View>
                                    <ThemedText className="text-lg font-bold ml-4">{item.label}</ThemedText>
                                </View>
                                <ChevronRight size={20} color={isDark ? '#475569' : '#CBD5E1'} />
                            </View>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity onPress={logout} className="mt-6 mb-10">
                        <View className="flex-row items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30">
                            <LogOut size={20} color="#EF4444" />
                            <ThemedText className="text-red-500 font-bold ml-2">Sign Out</ThemedText>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <StatusBar style={isDark ? 'light' : 'dark'} />
        </SafeAreaView>
    );
}
