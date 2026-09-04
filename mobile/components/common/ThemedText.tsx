import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface ThemedTextProps extends TextProps {
    className?: string;
    variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
}

export const ThemedText: React.FC<ThemedTextProps> = ({
    style,
    className,
    children,
    variant = 'body',
    ...props
}) => {
    const { isDark } = useTheme();

    const baseColor = isDark ? 'text-surface-light' : 'text-slate-900';

    let variantStyle = '';
    switch (variant) {
        case 'h1':
            variantStyle = 'text-3xl font-bold mb-4';
            break;
        case 'h2':
            variantStyle = 'text-2xl font-bold mb-3';
            break;
        case 'h3':
            variantStyle = 'text-xl font-semibold mb-2';
            break;
        case 'label':
            variantStyle = 'text-sm font-medium mb-1 text-slate-500 dark:text-slate-400';
            break;
        case 'caption':
            variantStyle = 'text-xs text-slate-400';
            break;
        case 'body':
        default:
            variantStyle = 'text-base';
    }

    return (
        <Text
            className={`${baseColor} ${variantStyle} ${className || ''}`}
            style={style}
            {...props}
        >
            {children}
        </Text>
    );
};
