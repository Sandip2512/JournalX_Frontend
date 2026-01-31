import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { PremiumCard } from '../components/common/PremiumCard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Buffer } from 'buffer';
import {
    User,
    CreditCard,
    FileText,
    Save,
    LogOut,
    Download,
    Sparkles
} from 'lucide-react-native';
import { ThemedText } from '../components/common/ThemedText';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

export default function ProfileScreen() {
    const { user, logout, token } = useAuth();
    const { isDark } = useTheme();
    const [firstName, setFirstName] = useState(user?.first_name || "");
    const [lastName, setLastName] = useState(user?.last_name || "");
    const [mobile, setMobile] = useState(user?.mobile_number || "");

    const [subscription, setSubscription] = useState<any>(null);
    const [reports, setReports] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        try {
            const [subRes, reportsRes] = await Promise.all([
                api.get("/api/subscriptions/my-subscription"),
                api.get("/api/reports/my-reports")
            ]);
            setSubscription(subRes.data);
            setReports(reportsRes.data);
        } catch (error) {
            console.error("Profile fetch error", error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleSave = async () => {
        if (!user?.user_id) return;
        setSaving(true);
        try {
            const res = await api.put(`/api/users/profile/${user.user_id}`, {
                first_name: firstName,
                last_name: lastName,
                mobile_number: mobile
            });

            if (token && res.data) {
                // Context update logic if needed
            }

            Alert.alert("Success", "Profile updated successfully");
        } catch (e) {
            Alert.alert("Error", "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateReport = async () => {
        Alert.alert("Generate Report", "This feature will generate a PDF report of your trading performance.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Generate",
                onPress: async () => {
                    try {
                        await api.post("/api/reports/generate", {
                            report_type: 'performance',
                            start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
                            end_date: new Date().toISOString().split('T')[0]
                        });
                        Alert.alert("Queued", "Report generation started. Pull to refresh in a moment.");
                        onRefresh();
                    } catch (e) {
                        Alert.alert("Error", "Failed to start generation");
                    }
                }
            }
        ]);
    };

    const handleDownloadReport = async (reportId: string, filename: string) => {
        try {
            const fileUri = FileSystem.documentDirectory + filename;
            const response = await api.get(`/api/reports/${reportId}/download`, {
                responseType: 'arraybuffer'
            });

            const base64Data = Buffer.from(response.data, 'binary').toString('base64');
            await FileSystem.writeAsStringAsync(fileUri, base64Data, {
                encoding: FileSystem.EncodingType.Base64
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                Alert.alert("Saved", `Report saved to ${fileUri}`);
            }

        } catch (e) {
            console.error(e);
            Alert.alert("Download Failed", "Could not download the report.");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <View className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 mb-2">
                <ThemedText variant="h2" className="mb-0">My Profile</ThemedText>
                <ThemedText variant="body" className="text-slate-500 dark:text-slate-400 text-sm">Manage your account & subscription</ThemedText>
            </View>

            <ScrollView
                className="flex-1 px-4 pt-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} tintColor={isDark ? '#fff' : '#6366F1'} />
                }
            >
                {/* Personal Details */}
                <PremiumCard className="mb-6">
                    <View className="flex-row items-center mb-4 space-x-2">
                        <User size={20} color="#3B82F6" />
                        <ThemedText className="text-lg font-bold ml-2">Personal Details</ThemedText>
                    </View>

                    <View className="space-y-4 gap-4">
                        <View>
                            <ThemedText variant="label">First Name</ThemedText>
                            <TextInput
                                className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200"
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                            />
                        </View>
                        <View>
                            <ThemedText variant="label">Last Name</ThemedText>
                            <TextInput
                                className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200"
                                value={lastName}
                                onChangeText={setLastName}
                                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                            />
                        </View>
                        <View>
                            <ThemedText variant="label">Mobile</ThemedText>
                            <TextInput
                                className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200"
                                value={mobile}
                                onChangeText={setMobile}
                                keyboardType="phone-pad"
                                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={saving}
                            className="bg-slate-900 dark:bg-indigo-600 p-4 rounded-xl flex-row justify-center items-center mt-2 shadow-lg shadow-slate-900/20"
                        >
                            {saving ? <ActivityIndicator color="white" /> : (
                                <>
                                    <Save size={18} color="white" />
                                    <ThemedText className="text-white font-bold ml-2">Save Changes</ThemedText>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </PremiumCard>

                {/* Subscription */}
                <PremiumCard className="mb-6" variant="outlined">
                    <View className="flex-row items-center mb-4 space-x-2">
                        <CreditCard size={20} color="#10B981" />
                        <ThemedText className="text-lg font-bold ml-2">Subscription</ThemedText>
                    </View>
                    <View className="flex-row justify-between items-center bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                        <View>
                            <ThemedText className="text-xs font-bold text-emerald-600 uppercase">Current Plan</ThemedText>
                            <ThemedText className="text-xl font-black text-emerald-800 dark:text-emerald-400 capitalize">{subscription?.plan_name || 'Free'}</ThemedText>
                        </View>
                        <View className="items-end">
                            <ThemedText className="text-xs font-bold text-emerald-600 uppercase">Status</ThemedText>
                            <ThemedText className="text-lg font-bold text-emerald-800 dark:text-emerald-400 capitalize">{subscription?.status || 'Active'}</ThemedText>
                        </View>
                    </View>
                </PremiumCard>

                {/* Reports */}
                <PremiumCard className="mb-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center space-x-2">
                            <FileText size={20} color="#8B5CF6" />
                            <ThemedText className="text-lg font-bold ml-2">Performance Reports</ThemedText>
                        </View>
                        <TouchableOpacity onPress={handleGenerateReport} className="bg-violet-50 dark:bg-violet-900/20 p-2 rounded-lg">
                            <Sparkles size={20} color="#8B5CF6" />
                        </TouchableOpacity>
                    </View>

                    {reports.length === 0 ? (
                        <View className="items-center py-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                            <ThemedText className="text-slate-400 text-sm">No reports generated yet.</ThemedText>
                            <TouchableOpacity onPress={handleGenerateReport} className="mt-2">
                                <ThemedText className="text-indigo-500 font-bold text-sm">Generate your first report</ThemedText>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="space-y-3 gap-3">
                            {reports.slice(0, 3).map((report, idx) => (
                                <View key={report.id || idx} className="flex-row justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <View>
                                        <ThemedText className="font-bold text-slate-700 dark:text-slate-200 capitalize">{report.report_type} Report</ThemedText>
                                        <ThemedText variant="caption">{new Date(report.created_at).toLocaleDateString()}</ThemedText>
                                    </View>
                                    <View className="flex-row items-center space-x-2">
                                        <ThemedText className={`text-xs font-bold uppercase mr-2 ${report.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {report.status}
                                        </ThemedText>
                                        {report.status === 'completed' && (
                                            <TouchableOpacity onPress={() => handleDownloadReport(report.id, report.filename || 'report.pdf')} className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                                <Download size={16} color={isDark ? '#94A3B8' : '#64748B'} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </PremiumCard>

                <TouchableOpacity
                    onPress={logout}
                    className="flex-row justify-center items-center p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl mb-12 border border-red-100 dark:border-red-900/20"
                >
                    <LogOut size={20} color="#EF4444" />
                    <ThemedText className="text-red-500 font-bold ml-2">Sign Out</ThemedText>
                </TouchableOpacity>
            </ScrollView>
            <StatusBar style={isDark ? 'light' : 'dark'} />
        </SafeAreaView>
    );
}
