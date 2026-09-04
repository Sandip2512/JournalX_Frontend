import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    mobile_number?: string;
    daily_loss_limit?: number;
    max_daily_trades?: number;
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    login: (token: string, user: User) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('auth_token');
            const storedUser = await AsyncStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Error loading auth:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (newToken: string, newUser: User) => {
        try {
            await AsyncStorage.setItem('auth_token', newToken);
            await AsyncStorage.setItem('user', JSON.stringify(newUser));
            setToken(newToken);
            setUser(newUser);
        } catch (error) {
            console.error('Error saving auth:', error);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('user');
            setToken(null);
            setUser(null);
        } catch (error) {
            console.error('Error clearing auth:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
