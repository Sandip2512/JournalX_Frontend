import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PremiumCardProps extends ViewProps {
    children: React.ReactNode;
    variant?: 'default' | 'glass' | 'outlined';
    gradientColors?: string[];
    className?: string;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
    children,
    variant = 'default',
    gradientColors,
    className = '',
    style,
    ...props
}) => {
    if (variant === 'glass') {
        return (
            <View
                className={`rounded-3xl overflow-hidden border border-white/20 ${className}`}
                style={style}
                {...props}
            >
                <LinearGradient
                    colors={['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.3)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
                <View className="p-5 relative z-10">
                    {children}
                </View>
            </View>
        );
    }

    if (variant === 'outlined') {
        return (
            <View
                className={`bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm ${className}`}
                style={style}
                {...props}
            >
                {children}
            </View>
        );
    }

    // Default variant (often a gradient or solid premium feel)
    return (
        <View
            className={`rounded-3xl shadow-lg shadow-blue-500/10 bg-white dark:bg-slate-800 ${className}`}
            style={style}
            {...props}
        >
            {gradientColors ? (
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                    className="rounded-3xl"
                />
            ) : null}
            <View className={`p-5 ${gradientColors ? 'bg-transparent' : ''}`}>
                {children}
            </View>
        </View>
    );
};
