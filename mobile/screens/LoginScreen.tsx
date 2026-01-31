import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ThemedText } from '../components/common/ThemedText';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { toggleTheme, isDark } = useTheme();

    React.useEffect(() => {
        console.log(">>> NEW PREMIUM LOGIN SCREEN MOUNTED <<<");
    }, []);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please enter username and password');
            return;
        }

        setLoading(true);
        try {
            const data = await authService.login(username, password);
            const user = data.user || { user_id: '1', email: username, first_name: 'User', last_name: '', role: 'user' };
            await login(data.access_token, user);
        } catch (error: any) {
            console.error('Login error:', error);
            const errorMsg = error.response?.data?.detail || error.message || 'Check your credentials or server connection.';
            Alert.alert('Login Failed', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="flex-1">
                    <LinearGradient
                        colors={isDark ? ['#0F172A', '#1E293B'] : ['#F8FAFC', '#E2E8F0']}
                        className="absolute left-0 right-0 top-0 bottom-0"
                    />

                    <SafeAreaView className="flex-1 justify-center items-center w-full">
                        <View className="w-full max-w-[85%] items-center">
                            <View className="items-center mb-8">
                                <View className="bg-indigo-500/10 p-5 rounded-3xl mb-4 border border-indigo-500/20 shadow-sm">
                                    <Ionicons name="journal" size={48} color={isDark ? '#818CF8' : '#4F46E5'} />
                                </View>
                                <ThemedText variant="h1" className="text-primary text-3xl font-black tracking-tight text-center">
                                    JournalX
                                </ThemedText>
                                <ThemedText variant="body" className="text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1 text-center text-xs uppercase">
                                    Identify. Learn. Profitable.
                                </ThemedText>
                            </View>

                            <View className="w-full bg-white/70 dark:bg-slate-900/70 p-6 rounded-3xl shadow-xl backdrop-blur-xl border border-white/40 dark:border-slate-700/50">
                                <ThemedText variant="h3" className="text-center mb-6 font-bold">
                                    Sign In
                                </ThemedText>

                                <View className="mb-4">
                                    <ThemedText variant="label" className="ml-1">Email</ThemedText>
                                    <View className="flex-row items-center bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3">
                                        <Ionicons name="mail-outline" size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                                        <TextInput
                                            className="flex-1 ml-3 text-base text-slate-900 dark:text-white"
                                            placeholder="Enter your email"
                                            placeholderTextColor={isDark ? '#555' : '#999'}
                                            value={username}
                                            onChangeText={setUsername}
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                        />
                                    </View>
                                </View>

                                <View className="mb-8">
                                    <ThemedText variant="label" className="ml-1">Password</ThemedText>
                                    <View className="flex-row items-center bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3">
                                        <Ionicons name="lock-closed-outline" size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                                        <TextInput
                                            className="flex-1 ml-3 text-base text-slate-900 dark:text-white"
                                            placeholder="Enter your password"
                                            placeholderTextColor={isDark ? '#555' : '#999'}
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            <Ionicons
                                                name={showPassword ? "eye-off-outline" : "eye-outline"}
                                                size={20}
                                                color={isDark ? '#94A3B8' : '#64748B'}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={handleLogin}
                                    disabled={loading}
                                >
                                    <LinearGradient
                                        colors={['#6366F1', '#8B5CF6']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        className="py-4 rounded-xl items-center shadow-lg shadow-indigo-500/30"
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <Text className="text-white font-bold text-lg">Sign In</Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                            <View className="mt-8 flex-row justify-center items-center">
                                <ThemedText variant="caption">Theme: </ThemedText>
                                <TouchableOpacity onPress={toggleTheme} className="bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full ml-2">
                                    <Text className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                        {isDark ? 'Dark Moon 🌙' : 'Light Sun ☀️'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </SafeAreaView>
                    <StatusBar style={isDark ? 'light' : 'dark'} />
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
