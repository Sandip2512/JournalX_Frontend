import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ProgressBar } from '../common/ProgressBar';
import { LucideIcon, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GoalCardProps {
    type: string;
    target: number;
    current: number;
    icon: LucideIcon;
    colorScheme: 'blue' | 'green' | 'purple' | 'orange';
}

export const GoalCard: React.FC<GoalCardProps> = ({
    type,
    target,
    current,
    icon: Icon,
    colorScheme
}) => {
    const progress = target > 0 ? (current / target) * 100 : 0;
    const isAchieved = progress >= 100 && target > 0;

    const getColors = () => {
        switch (colorScheme) {
            case 'green': return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: '#10B981' };
            case 'purple': return { bg: 'bg-purple-50', text: 'text-purple-600', icon: '#A855F7' };
            case 'orange': return { bg: 'bg-amber-50', text: 'text-amber-600', icon: '#F59E0B' };
            case 'blue':
            default: return { bg: 'bg-blue-50', text: 'text-blue-600', icon: '#3B82F6' };
        }
    };

    const colors = getColors();

    return (
        <View className="mb-4 rounded-3xl bg-white shadow-sm shadow-slate-200 overflow-hidden border border-slate-100">
            <View className="p-5">
                <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-row items-center space-x-3">
                        <View className={`p-2.5 rounded-xl ${colors.bg}`}>
                            <Icon size={24} color={colors.icon} />
                        </View>
                        <View>
                            <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest">{type} Goal</Text>
                            {isAchieved && (
                                <View className="flex-row items-center mt-1">
                                    <Text className="text-xs font-bold text-emerald-500 mr-1">GOAL CRUSHED</Text>
                                    <CheckCircle2 size={12} color="#10B981" />
                                </View>
                            )}
                        </View>
                    </View>
                    <View className="items-end">
                        <Text className="text-xs text-slate-400 font-bold uppercase tracking-widest">Target</Text>
                        <Text className="text-xl font-black text-slate-900">${target.toLocaleString()}</Text>
                    </View>
                </View>

                <ProgressBar progress={progress} colorScheme={colorScheme} showLabel={false} />

                <View className="flex-row justify-between items-center mt-3">
                    <View>
                        <Text className="text-xs text-slate-400 font-bold uppercase">Current P/L</Text>
                        <Text className={`text-lg font-black ${current >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            ${current.toLocaleString()}
                        </Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-xs text-slate-400 font-bold uppercase">Completion</Text>
                        <Text className={`text-lg font-black ${isAchieved ? 'text-emerald-500' : colors.text}`}>
                            {progress.toFixed(0)}%
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};
