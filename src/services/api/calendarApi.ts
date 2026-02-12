import api from '@/lib/api';
import { EconomicEvent, CalendarFilters, EventNote, EventReminder, EventTradeLink } from '@/types/calendar';

export const calendarApi = {
    /**
     * Get economic calendar events with filters
     */
    getEvents: async (filters: Partial<CalendarFilters>, userId: string, timezoneOffset?: number) => {
        const params: any = {
            user_id: userId,
        };

        if (filters.dateRange?.start) {
            params.start_date = filters.dateRange.start.toISOString().split('T')[0];
        }

        if (filters.dateRange?.end) {
            params.end_date = filters.dateRange.end.toISOString().split('T')[0];
        }

        if (filters.currencies && filters.currencies.length > 0) {
            params.currencies = filters.currencies.join(',');
        }

        if (filters.impacts && filters.impacts.length > 0) {
            params.impacts = filters.impacts.join(',');
        }

        if (filters.highImpactOnly) {
            params.high_impact_only = true;
        }

        if (filters.searchQuery) {
            params.search = filters.searchQuery;
        }

        if (filters.status && filters.status !== 'all') {
            params.status = filters.status;
        }

        // Use provided offset or calculate browser's offset
        const effectiveOffset = timezoneOffset !== undefined
            ? timezoneOffset
            : -new Date().getTimezoneOffset() / 60;

        params.timezone_offset = effectiveOffset;

        const response = await api.get('/api/calendar/events', { params });
        return response.data;
    },

    /**
     * Mark event as important
     */
    markImportant: async (eventId: string, userId: string, isMarked: boolean) => {
        const response = await api.post(`/api/calendar/events/${eventId}/mark`,
            { is_marked: isMarked },
            { params: { user_id: userId } }
        );
        return response.data;
    },

    /**
     * Add or update note for event
     */
    addNote: async (eventId: string, userId: string, noteText: string) => {
        const response = await api.post(`/api/calendar/events/${eventId}/notes`,
            { event_id: eventId, note_text: noteText },
            { params: { user_id: userId } }
        );
        return response.data;
    },

    /**
     * Get notes for event
     */
    getNotes: async (eventId: string, userId: string) => {
        const response = await api.get(`/api/calendar/events/${eventId}/notes`, {
            params: { user_id: userId }
        });
        return response.data;
    },

    /**
     * Link event to trade
     */
    linkToTrade: async (eventId: string, userId: string, tradeId: string) => {
        const response = await api.post(`/api/calendar/events/${eventId}/link-trade`,
            { event_id: eventId, trade_id: tradeId },
            { params: { user_id: userId } }
        );
        return response.data;
    },

    /**
     * Get trades linked to event
     */
    getLinkedTrades: async (eventId: string, userId: string) => {
        const response = await api.get(`/api/calendar/events/${eventId}/linked-trades`, {
            params: { user_id: userId }
        });
        return response.data;
    },

    /**
     * Create reminder for event
     */
    createReminder: async (eventId: string, userId: string, minutesBefore: number) => {
        const response = await api.post('/api/calendar/reminders',
            { event_id: eventId, minutes_before: minutesBefore },
            { params: { user_id: userId } }
        );
        return response.data;
    },

    /**
     * Get user reminders
     */
    getReminders: async (userId: string) => {
        const response = await api.get('/api/calendar/reminders', {
            params: { user_id: userId }
        });
        return response.data;
    },

    /**
     * Delete reminder
     */
    deleteReminder: async (reminderId: string, userId: string) => {
        const response = await api.delete(`/api/calendar/reminders/${reminderId}`, {
            params: { user_id: userId }
        });
        return response.data;
    },

    /**
     * Get next high-impact event
     */
    getNextHighImpact: async () => {
        const timezoneOffset = -new Date().getTimezoneOffset() / 60;
        const response = await api.get('/api/calendar/next-high-impact', {
            params: { timezone_offset: timezoneOffset }
        });
        return response.data;
    },
};
