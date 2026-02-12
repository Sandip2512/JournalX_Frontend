import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Star, Bell, Link2, FileText, TrendingUp, Search, RefreshCw, ChevronDown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { calendarApi } from '@/services/api/calendarApi';
import { EconomicEvent, CalendarFilters } from '@/types/calendar';
import { ImpactBadge } from '@/components/calendar/ImpactBadge';
import { StatusBadge } from '@/components/calendar/StatusBadge';
import { CountryFlag } from '@/components/calendar/CountryFlag';
import { format, isToday, isTomorrow, parseISO, startOfToday, endOfToday, differenceInMinutes, startOfTomorrow, endOfTomorrow, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DateFilterType = 'upcoming' | 'today' | 'tomorrow' | 'this_week' | 'all';

interface EconomicCalendarProps {
    isNested?: boolean;
}

export default function EconomicCalendar({ isNested = false }: EconomicCalendarProps) {
    const { user } = useAuth();
    const [events, setEvents] = useState<EconomicEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeDateFilter, setActiveDateFilter] = useState<DateFilterType>('today');
    const [filters, setFilters] = useState<CalendarFilters>({
        currencies: [],
        impacts: [],
        dateRange: { start: startOfToday(), end: endOfToday() },
        highImpactOnly: false,
        searchQuery: '',
        status: 'all'
    });
    const [currentTime, setCurrentTime] = useState(new Date());

    const isFreePlan = !user?.subscription_tier || user.subscription_tier.toLowerCase() === 'free';
    const timezoneOffset = 5.5; // Indian Standard Time (IST)

    // Update clock every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const fetchEvents = async () => {
        if (!user?.user_id) return;

        try {
            setLoading(true);

            // Adjust filters for Free tier users
            const appliedFilters = { ...filters };
            if (isFreePlan) {
                appliedFilters.currencies = ['USD'];
                appliedFilters.impacts = ['high', 'medium'];
                appliedFilters.highImpactOnly = false;
                appliedFilters.dateRange = { start: startOfToday(), end: endOfToday() };
            }

            const response = await calendarApi.getEvents(appliedFilters, user.user_id, timezoneOffset);
            setEvents(response.events || []);
        } catch (error) {
            console.error('Error fetching calendar events:', error);
            // toast.error('Failed to load calendar events'); // Suppress error toast for cleaner UI during dev
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [user?.user_id, filters]);

    const handleDateFilterChange = (type: DateFilterType) => {
        if (isFreePlan && type !== 'today') {
            toast.error('Upgrade to Pro to view future events');
            return;
        }

        setActiveDateFilter(type);
        const now = new Date();

        let newRange: { start: Date | null, end: Date | null } = { start: null, end: null };

        switch (type) {
            case 'today':
                newRange = { start: startOfToday(), end: endOfToday() };
                break;
            case 'tomorrow':
                newRange = { start: startOfTomorrow(), end: endOfTomorrow() };
                break;
            case 'this_week':
                newRange = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
                break;
            case 'upcoming':
                newRange = { start: now, end: addDays(now, 7) };
                break;
            case 'all':
                newRange = { start: null, end: null };
                break;
        }

        setFilters(prev => ({ ...prev, dateRange: newRange }));
    };

    const handleMarkImportant = async (eventId: string, isMarked: boolean) => {
        if (!user?.user_id) return;

        try {
            await calendarApi.markImportant(eventId, user.user_id, !isMarked);
            toast.success(isMarked ? 'Removed from important' : 'Marked as important');
            fetchEvents();
        } catch (error) {
            toast.error('Failed to update event');
        }
    };

    const groupEventsByDate = () => {
        const grouped: { [key: string]: EconomicEvent[] } = {};

        events.forEach(event => {
            const dateStr = format(parseISO(event.event_date), 'yyyy-MM-dd');
            if (!grouped[dateStr]) grouped[dateStr] = [];
            grouped[dateStr].push(event);
        });

        return grouped;
    };

    const groupedEvents = groupEventsByDate();
    const sortedDates = Object.keys(groupedEvents).sort();

    // Identify Next Up event (first upcoming event)
    const now = new Date();
    let nextUpId: string | null = null;

    // Flatten events and find first one after now
    const upcomingEvents = events
        .filter(e => parseISO(e.event_time_utc) > now)
        .sort((a, b) => parseISO(a.event_time_utc).getTime() - parseISO(b.event_time_utc).getTime());

    if (upcomingEvents.length > 0) {
        nextUpId = upcomingEvents[0]._id;
    }

    const parseValue = (val: string | null | undefined): number | null => {
        if (!val) return null;
        // Handle negative signs, decimals, and remove non-numeric chars like %, B, M, k
        const clean = val.replace(/[^-0-9.]/g, '');
        const num = parseFloat(clean);
        return isNaN(num) ? null : num;
    };

    const getActualColor = (event: EconomicEvent) => {
        if (!event.actual) return "text-amber-500/40"; // Awaiting

        const actual = parseValue(event.actual);
        const forecast = parseValue(event.forecast);
        const previous = parseValue(event.previous);

        // Define which target to compare against (Forecast first, then Previous)
        const target = forecast !== null ? forecast : previous;

        if (actual === null || target === null) {
            // Fallback to absolute value logic if comparison targets are missing
            if (actual !== null) {
                return actual > 0 ? "text-emerald-500" : actual < 0 ? "text-red-500" : "text-amber-500";
            }
            return "text-amber-500";
        }

        // Standard comparison logic
        if (actual > target) return "text-emerald-500";
        if (actual < target) return "text-red-500";
        return "text-amber-500"; // Neutral/Equal
    };

    const getSimpleValueColor = (val: string | null | undefined) => {
        const num = parseValue(val);
        if (num === null) return "text-muted-foreground";
        if (num > 0) return "text-emerald-500/80";
        if (num < 0) return "text-red-500/80";
        return "text-muted-foreground";
    };

    const renderEventRow = (event: EconomicEvent) => {
        const isNextUp = event._id === nextUpId;
        const eventTime = parseISO(event.event_time_utc);
        const isPast = eventTime <= now;
        const isUpcoming = eventTime > now;

        // Live if explicitly status 'live' OR happened in the last 30 minutes and no actual yet
        const isRecentlyReleased = isPast && !event.actual && differenceInMinutes(now, eventTime) <= 30;
        const isLive = event.status === 'live' || isRecentlyReleased;

        return (
            <div
                key={event._id}
                className={cn(
                    "relative group flex flex-col md:flex-row items-center gap-4 py-4 px-6 mb-3 rounded-2xl border border-border/50 bg-card/80 hover:bg-card transition-all duration-300 shadow-sm",
                    isNextUp && "border-blue-500/30 bg-blue-500/[0.02] shadow-[0_0_20px_rgba(59,130,246,0.05)]",
                    isLive && "border-amber-500/20 bg-amber-500/[0.01]"
                )}
            >
                {/* Badges */}
                <div className="absolute top-2 right-4 flex gap-2">
                    {isLive && <StatusBadge status="live" />}
                    {isNextUp && <StatusBadge status="next-up" />}
                </div>

                {/* Left: Time & Currency */}
                <div className="flex items-center gap-6 min-w-[200px]">
                    <span className={cn(
                        "text-sm font-bold font-mono transition-colors",
                        isLive ? "text-amber-500" : isPast ? "text-muted-foreground/60" : "text-amber-500/80"
                    )}>
                        {format(eventTime, 'hh:mm a')}
                    </span>
                    <div className="flex items-center gap-4">
                        <CountryFlag currency={event.currency} className="w-10 h-10 shadow-lg" />
                        <div className="bg-secondary/50 border border-border/50 px-3 py-1.5 rounded-xl flex items-center justify-center min-w-[60px]">
                            <span className="text-sm font-black text-foreground uppercase tracking-tight">{event.currency}</span>
                        </div>
                    </div>
                </div>

                {/* Impact */}
                <div className="w-24">
                    <ImpactBadge impact={event.impact_level} />
                </div>

                {/* Event Name */}
                <div className="flex-1 min-w-0">
                    <h4 className={cn(
                        "text-sm font-bold truncate group-hover:text-foreground transition-colors",
                        isPast ? "text-muted-foreground" : "text-foreground"
                    )}>
                        {event.event_name}
                    </h4>
                </div>

                {/* Data Values with Labels */}
                <div className="flex items-center gap-8 text-right">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none mb-1.5">Actual</span>
                        <span className={cn(
                            "text-sm font-mono font-bold leading-none transition-colors duration-500",
                            getActualColor(event),
                            (!event.actual && (isUpcoming || isRecentlyReleased)) && "italic text-xs font-normal"
                        )}>
                            {event.actual ? event.actual : (isUpcoming || isRecentlyReleased ? 'Awaiting...' : '—')}
                        </span>
                    </div>
                    <div className="flex flex-col items-end min-w-[60px]">
                        <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none mb-1.5">Forecast</span>
                        <span className={cn(
                            "text-sm font-mono leading-none font-bold",
                            getSimpleValueColor(event.forecast)
                        )}>
                            {event.forecast || '—'}
                        </span>
                    </div>
                    <div className="flex flex-col items-end min-w-[60px]">
                        <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none mb-1.5">Previous</span>
                        <span className={cn(
                            "text-sm font-mono leading-none font-bold",
                            getSimpleValueColor(event.previous)
                        )}>
                            {event.previous || '—'}
                        </span>
                    </div>
                </div>

                {/* Chevron */}
                <div className="ml-4 opacity-20 group-hover:opacity-100 transition-opacity">
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-up pb-10">
            {/* Header */}
            {!isNested && (
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
                            Economic Calendar
                        </h1>
                        <p className="text-muted-foreground text-xs">
                            Track high-impact economic events and news that move the markets
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/40 border border-border/50 text-xs font-mono text-muted-foreground">
                            <span>GMT +5.5 (IST)</span>
                            <StatusBadge status="live" />
                            <span className="border-l border-border/50 pl-2 ml-1">
                                Updated {format(currentTime, 'hh:mm a')}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Bar */}
            <div className="p-3 bg-card border border-border/50 rounded-2xl flex flex-wrap items-center gap-4">
                {/* Date Pills */}
                <div className="flex bg-secondary/40 p-1 rounded-xl items-center gap-1 border border-border/50">
                    {(['upcoming', 'today', 'tomorrow', 'this_week', 'all'] as const).map((filter) => {
                        const isLocked = isFreePlan && filter !== 'today';
                        return (
                            <button
                                key={filter}
                                onClick={() => handleDateFilterChange(filter)}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize flex items-center gap-2",
                                    activeDateFilter === filter
                                        ? "bg-primary text-primary-foreground shadow-md mx-0.5"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {filter.replace('_', ' ')}
                                {isLocked && <Lock className="w-2.5 h-2.5 opacity-50 ml-0.5" />}
                            </button>
                        );
                    })}
                </div>

                {/* Impact Pills */}
                <div className="flex bg-secondary/40 p-1 rounded-xl items-center gap-1 border border-border/50">
                    <button
                        onClick={() => !isFreePlan && setFilters(prev => ({ ...prev, impacts: [], highImpactOnly: false }))}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                            (!filters.impacts?.length && !filters.highImpactOnly)
                                ? "bg-secondary text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        All {isFreePlan && <Lock className="w-2.5 h-2.5 opacity-50" />}
                    </button>
                    <button
                        onClick={() => setFilters(prev => ({ ...prev, highImpactOnly: true, impacts: [] }))}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2",
                            filters.highImpactOnly
                                ? "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20 shadow-sm"
                                : "text-muted-foreground border-transparent hover:text-foreground"
                        )}
                    >
                        High
                    </button>
                    <button
                        onClick={() => setFilters(prev => ({ ...prev, highImpactOnly: false, impacts: ['medium'] }))}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2",
                            (filters.impacts?.includes('medium') && !filters.highImpactOnly)
                                ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
                                : "text-muted-foreground border-transparent hover:text-foreground"
                        )}
                    >
                        Med
                    </button>
                    <button
                        onClick={() => !isFreePlan && setFilters(prev => ({ ...prev, highImpactOnly: false, impacts: ['low'] }))}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1",
                            (filters.impacts?.includes('low') && !filters.highImpactOnly)
                                ? "text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-sm"
                                : "text-muted-foreground border-transparent hover:text-foreground"
                        )}
                    >
                        Low {isFreePlan && <Lock className="w-2.5 h-2.5 opacity-50" />}
                    </button>
                </div>

                {/* US Only */}
                <div className="flex-none">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (isFreePlan) return;
                            const isUSOnly = filters.currencies?.includes('USD') && filters.currencies.length === 1;
                            setFilters(prev => ({ ...prev, currencies: isUSOnly ? [] : ['USD'] }));
                        }}
                        className={cn(
                            "h-9 px-4 rounded-xl border-border/50 bg-secondary/40 text-xs font-bold gap-2 transition-all",
                            (filters.currencies?.includes('USD') && filters.currencies.length === 1) || isFreePlan
                                ? "text-primary bg-primary/10 border-primary/20"
                                : "text-muted-foreground hover:bg-secondary/60"
                        )}
                    >
                        <span className={cn("transition-all", (filters.currencies?.includes('USD') && filters.currencies.length === 1) || isFreePlan ? "grayscale-0" : "grayscale")}>🇺🇸</span>
                        US Only
                        {isFreePlan && <Lock className="w-3 h-3 opacity-50" />}
                    </Button>
                </div>

                {/* Search */}
                <div className="flex-1 relative min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <Input
                        placeholder="Search events..."
                        className="h-10 pl-10 pr-4 bg-secondary/40 border-border/50 rounded-xl text-xs font-medium focus:ring-0 focus:border-border/10 placeholder:text-muted-foreground/30"
                        value={filters.searchQuery}
                        onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                    />
                </div>

                {/* Refresh */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl bg-secondary/40 border border-border/50 hover:bg-secondary/60"
                    onClick={fetchEvents}
                >
                    <RefreshCw className={cn("w-4 h-4 text-muted-foreground", loading && "animate-spin")} />
                </Button>
            </div>

            {/* Event List */}
            <div className="space-y-8">
                {sortedDates.map(dateStr => {
                    const groupTitle = isToday(parseISO(dateStr)) ? 'Today'
                        : isTomorrow(parseISO(dateStr)) ? 'Tomorrow'
                            : format(parseISO(dateStr), 'EEEE, MMM d');

                    return (
                        <div key={dateStr} className="mb-10 last:mb-0">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em]">
                                    {groupTitle}
                                </h3>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">
                                    {groupedEvents[dateStr].length} events
                                </span>
                            </div>

                            <div className="space-y-3">
                                {groupedEvents[dateStr].map(renderEventRow)}
                            </div>
                        </div>
                    );
                })}

                {events.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Calendar className="w-12 h-12 mb-4 opacity-20" />
                        <p>No events found matching your filters</p>
                        <Button
                            variant="link"
                            className="mt-2 text-primary"
                            onClick={() => {
                                setFilters({
                                    currencies: [],
                                    impacts: [],
                                    dateRange: { start: null, end: null },
                                    highImpactOnly: false,
                                    searchQuery: '',
                                    status: 'all'
                                });
                                setActiveDateFilter('all');
                            }}
                        >
                            Clear all filters
                        </Button>
                    </div>
                )}
                {loading && events.length === 0 && (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
