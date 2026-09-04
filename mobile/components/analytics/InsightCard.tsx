import React from 'react';
import { View, Text } from 'react-native';
import { AlertTriangle, TrendingUp, Info } from 'lucide-react-native';

interface InsightCardProps {
    type: 'good' | 'warning' | 'info';
    text: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ type, text }) => {
    const getConfig = () => {
        switch (type) {
            case 'good':
                return {
                    bg: 'bg-emerald-50',
                    border: 'border-emerald-100',
                    icon: TrendingUp,
                    iconColor: '#10B981',
                    textColor: 'text-emerald-900'
                };
            case 'warning':
                return {
                    bg: 'bg-amber-50',
                    border: 'border-amber-100',
                    icon: AlertTriangle,
                    iconColor: '#F59E0B',
                    textColor: 'text-amber-900'
                };
            case 'info':
            default:
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-100',
                    icon: Info,
                    iconColor: '#3B82F6',
                    textColor: 'text-blue-900'
                };
        }
    };

    const config = getConfig();
    const Icon = config.icon;

    return (
        <View className={`border rounded-xl p-4 mb-3 flex-row items-start space-x-3 ${config.bg} ${config.border}`}>
            <Icon size={20} color={config.iconColor} />
            <Text className={`flex-1 text-sm font-medium ${config.textColor} leading-5`}>
                {text}
            </Text>
        </View>
    );
};
