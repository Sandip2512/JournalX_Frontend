import api from '@/lib/api';

export interface TradingRules {
    max_risk_per_trade: number;
    max_daily_loss: number;
    max_trades_per_day: number;
    max_losing_trades: number;
    risk_reward: string;
    sessions: string[];
    pairs: string[];
}

export interface Preferences {
    currency: string;
    timezone: string;
}

export interface OnboardingSetupData {
    rules: TradingRules;
    preferences: Preferences;
}

export const onboardingService = {
    async submitSetup(data: OnboardingSetupData) {
        const response = await api.post('/api/onboarding/setup', data);
        return response.data;
    },

    async getStatus() {
        try {
            const response = await api.get('/api/onboarding/status');
            return response.data;
        } catch (error) {
            console.error("Failed to fetch onboarding status", error);
            return { is_onboarding_completed: true }; // Fallback to avoid locking out existing users if API fails
        }
    },

    async getCurrentRules(month?: string) {
        const params = month ? { month } : {};
        const response = await api.get('/api/onboarding/rules/current', { params });
        return response.data;
    },

    async copyLastMonthRules() {
        const response = await api.post('/api/onboarding/rules/copy-last-month');
        return response.data;
    },

    async getPreferences() {
        const response = await api.get('/api/onboarding/preferences');
        return response.data;
    }
};
