import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { colorScheme, setColorScheme } = useColorScheme();
    const [theme, setThemeState] = useState<Theme>('system');

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('user_theme');
            if (savedTheme) {
                setTheme(savedTheme as Theme);
            }
        } catch (error) {
            console.log('Error loading theme:', error);
        }
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        setColorScheme(newTheme);
        AsyncStorage.setItem('user_theme', newTheme).catch((err) =>
            console.log('Error saving theme:', err)
        );
    };

    const toggleTheme = () => {
        setTheme(colorScheme === 'dark' ? 'light' : 'dark');
    };

    const isDark = colorScheme === 'dark';

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
