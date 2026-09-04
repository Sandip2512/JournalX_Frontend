export interface EconomicEvent {
    _id: string;
    unique_id: string;
    event_date: string;
    event_time_utc: string;
    event_time_local?: string;
    country: string;
    currency: string;
    impact_level: 'low' | 'medium' | 'high';
    event_name: string;
    actual: string | null;
    forecast: string | null;
    previous: string | null;
    status: 'upcoming' | 'released' | 'live';
    is_marked?: boolean;
    notes_count?: number;
    linked_trades_count?: number;
    fetched_at: string;
    created_at: string;
    updated_at: string;
}

export interface CalendarFilters {
    currencies: string[];
    impacts: ('low' | 'medium' | 'high')[];
    dateRange: {
        start: Date | null;
        end: Date | null;
    };
    highImpactOnly: boolean;
    searchQuery: string;
    status: 'upcoming' | 'released' | 'all';
}

export interface EventNote {
    _id: string;
    user_id: string;
    event_id: string;
    note_text: string;
    created_at: string;
    updated_at: string;
}

export interface EventReminder {
    _id: string;
    user_id: string;
    event_id: string;
    event_time: string;
    minutes_before: number;
    reminder_time: string;
    is_sent: boolean;
    created_at: string;
}

export interface EventTradeLink {
    _id: string;
    user_id: string;
    event_id: string;
    trade_id: string;
    created_at: string;
}

export interface CalendarStats {
    todayHighImpact: number;
    thisWeekEvents: number;
    markedEvents: number;
    upcomingReminders: number;
}

export const CURRENCIES = [
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸', countryCode: 'us' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺', countryCode: 'eu' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧', countryCode: 'gb' },
    { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', countryCode: 'jp' },
    { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', countryCode: 'au' },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', countryCode: 'ca' },
    { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', countryCode: 'ch' },
    { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿', countryCode: 'nz' },
    { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', countryCode: 'cn' },
];

export const IMPACT_LEVELS = [
    { value: 'low', label: 'Low', color: 'gray' },
    { value: 'medium', label: 'Medium', color: 'amber' },
    { value: 'high', label: 'High', color: 'red' },
] as const;

export const REMINDER_OPTIONS = [
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' },
    { value: 1440, label: '1 day before' },
] as const;
