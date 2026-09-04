import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface ThemedViewProps extends ViewProps {
    className?: string; // For Tailwind classes
}

export const ThemedView: React.FC<ThemedViewProps> = ({ style, className, children, ...props }) => {
    const { isDark } = useTheme();

    // Combine nativewind className with manual style logic if needed
    // Note: Using className with NativeWind automatically handles dark mode via 'dark:' prefix,
    // but we can also inject base styles here.

    const baseClass = isDark ? 'bg-background-dark' : 'bg-background-light';

    return (
        <View
            className={`${baseClass} ${className || ''}`}
            style={style}
            {...props}
        >
            {children}
        </View>
    );
};
