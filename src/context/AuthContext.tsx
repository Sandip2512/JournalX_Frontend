import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

// Define User type based on Backend response
interface User {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    role?: string;
    created_at?: string;
    daily_loss_limit?: number;
    max_daily_trades?: number;
    subscription_tier?: 'free' | 'pro' | 'elite';
    subscription_expiry?: string;
    username?: string;
    mobile_number?: string;
    max_risk_per_trade?: number;
    max_losing_streak?: number;
    risk_reward_ratio?: string;
    preferred_sessions?: string[];
    favorite_pairs?: string[];
    currency?: string;
    timezone?: string;
    avatar_url?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    updateUser: (userData: User) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                // Optionally verify token validity with backend here
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = (newToken: string, userData: User) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const updateUser = (userData: User) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isLoading,
            login,
            logout,
            updateUser,
            isAuthenticated: !!user
        }}>
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
