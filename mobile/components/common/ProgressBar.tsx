import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ProgressBarProps {
    progress: number; // 0 to 100
    colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
    showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    colorScheme = 'blue',
    showLabel = true
}) => {
    const safeProgress = Math.min(Math.max(progress, 0), 100);

    const getGradientColors = () => {
        switch (colorScheme) {
            case 'green': return ['#10B981', '#059669'];
            case 'purple': return ['#A855F7', '#7E22CE'];
            case 'orange': return ['#F97316', '#EA580C'];
            case 'red': return ['#EF4444', '#DC2626'];
            case 'blue':
            default: return ['#3B82F6', '#2563EB'];
        }
    };

    return (
        <View className="w-full">
            <View className="h-4 bg-slate-100 rounded-lg overflow-hidden border border-black/5 relative">
                <View
                    className="h-full rounded-lg"
                    style={{ width: `${safeProgress}%` }}
                >
                    <LinearGradient
                        colors={getGradientColors()}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={{ width: '100%', height: '100%' }}
                    />
                    {/* Shine effect */}
                    <View className="absolute top-0 w-full h-[40%] bg-white/20" />
                </View>
            </View>
            {showLabel && (
                <View className="flex-row justify-end mt-1">
                    <Text className="text-xs font-bold text-slate-500">{safeProgress.toFixed(0)}%</Text>
                </View>
            )}
        </View>
    );
};
