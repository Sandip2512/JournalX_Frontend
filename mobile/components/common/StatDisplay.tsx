import React from 'react';
import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface StatDisplayProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    color?: string;
    subValue?: string;
    className?: string;
}

export const StatDisplay: React.FC<StatDisplayProps> = ({
    label,
    value,
    icon: Icon,
    trend,
    color = '#64748B', // slate-500
    subValue,
    className = ''
}) => {
    return (
        <View className={`flex-row items-center space-x-3 ${className}`}>
            <View
                className="w-10 h-10 rounded-xl items-center justify-center bg-slate-50 border border-slate-100"
                style={{ backgroundColor: `${color}15` }} // 15 = roughly 10% opacity hex
            >
                <Icon size={20} color={color} />
            </View>
            <View>
                <Text className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</Text>
                <Text className="text-lg font-extrabold text-slate-800">{value}</Text>
                {subValue && <Text className="text-xs text-slate-400">{subValue}</Text>}
            </View>
        </View>
    );
};
