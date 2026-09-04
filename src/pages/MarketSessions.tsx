import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format, addHours, startOfToday, isWithinInterval, setHours, setMinutes, differenceInSeconds } from 'date-fns';
import { Clock, Globe, Zap, AlertCircle, ChevronRight, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

interface Session {
    name: string;
    city: string;
    startUTC: number; // Hour in UTC
    endUTC: number;   // Hour in UTC
    color: string;
    flag: string;
    countryCode: string;
}

const SESSIONS: Session[] = [
    { name: 'Sydney', city: 'Sydney', startUTC: 22, endUTC: 7, color: 'emerald', flag: '🇦🇺', countryCode: 'au' },
    { name: 'Tokyo', city: 'Tokyo', startUTC: 0, endUTC: 9, color: 'red', flag: '🇯🇵', countryCode: 'jp' },
    { name: 'London', city: 'London', startUTC: 8, endUTC: 17, color: 'blue', flag: '🇬🇧', countryCode: 'gb' },
    { name: 'New York', city: 'New York', startUTC: 13, endUTC: 22, color: 'amber', flag: '🇺🇸', countryCode: 'us' },
];

const SESSION_COLORS: Record<string, { bg: string, text: string, border: string, shadow: string, glow: string }> = {
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500/30', shadow: 'shadow-emerald-500/20', glow: 'bg-emerald-500' },
    red: { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500/30', shadow: 'shadow-red-500/20', glow: 'bg-red-500' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500/30', shadow: 'shadow-blue-500/20', glow: 'bg-blue-500' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500/30', shadow: 'shadow-amber-500/20', glow: 'bg-amber-500' },
};

const MarketSessions = () => {
    const [now, setNow] = useState(new Date());
    const [is24H, setIs24H] = useState(false);
    const [scrubTime, setScrubTime] = useState<Date | null>(null);
    const [isScrubbing, setIsScrubbing] = useState(false);
    const timelineRef = useRef<HTMLDivElement>(null);
    const timezoneOffset = 5.5; // IST

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleTimelineInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!timelineRef.current) return;

        const rect = timelineRef.current.getBoundingClientRect();
        const paddingLeft = 96; // px-24 * 4 is not accurate, but looking at padding in code
        // The time markers are between px-24 and px-24. 
        // Actually the timeline bars are in a container "flex-1".
        // Let's refine the calculation.

        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
        const width = rect.width;

        // Calculate percentage (0 to 1)
        let percent = x / width;
        percent = Math.max(0, Math.min(1, percent));

        // Convert percentage to seconds in a day (86400)
        const seconds = percent * 86400;
        const newScrubTime = addHours(startOfToday(), seconds / 3600);
        setScrubTime(newScrubTime);
    }, []);

    const onMouseDown = (e: React.MouseEvent) => {
        setIsScrubbing(true);
        handleTimelineInteraction(e);
    };

    useEffect(() => {
        const handleGlobalMouseUp = () => {
            setIsScrubbing(false);
            setScrubTime(null);
        };

        if (isScrubbing) {
            window.addEventListener('mouseup', handleGlobalMouseUp);
            window.addEventListener('mousemove', handleTimelineInteraction as any);
        }

        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp);
            window.removeEventListener('mousemove', handleTimelineInteraction as any);
        };
    }, [isScrubbing, handleTimelineInteraction]);

    const activeTime = scrubTime || now;

    const getSessionTimes = (session: Session) => {
        const today = startOfToday();

        // Calculate UTC start and end for "today"
        let start = setMinutes(setHours(today, session.startUTC), 0);
        let end = setMinutes(setHours(today, session.endUTC), 0);

        // Handle cross-day sessions in UTC
        if (session.endUTC < session.startUTC) {
            end = addHours(end, 24);
        }

        // Convert to IST
        let startIST = addHours(start, timezoneOffset);
        let endIST = addHours(end, timezoneOffset);

        // We need to check three possible cycles: Yesterday, Today, Tomorrow
        // This ensures cross-day sessions are detected correctly regardless of current time
        const checkCycle = (offsetDays: number) => {
            const s = addHours(startIST, offsetDays * 24);
            const e = addHours(endIST, offsetDays * 24);
            return isWithinInterval(activeTime, { start: s, end: e }) ? { s, e, active: true } : { s, e, active: false };
        };

        const yesterday = checkCycle(-1);
        const todayCycle = checkCycle(0);
        const tomorrow = checkCycle(1);

        if (yesterday.active) return { startIST: yesterday.s, endIST: yesterday.e, isActive: true };
        if (todayCycle.active) return { startIST: todayCycle.s, endIST: todayCycle.e, isActive: true };
        if (tomorrow.active) return { startIST: tomorrow.s, endIST: tomorrow.e, isActive: true };

        // If not active, return the closest future cycle (today or tomorrow)
        return { startIST: todayCycle.s, endIST: todayCycle.e, isActive: false };
    };

    const currentSessions = SESSIONS.filter(s => getSessionTimes(s).isActive);

    return (
        <div className="space-y-6 animate-in mt-2 pb-10">
            {/* Top Bar: Title & Big Clock */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-foreground">Forex Market Hours</h1>
                        <p className="text-[11px] text-muted-foreground font-medium">Professional global session tracking in real-time</p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    {/* Time Format Toggle */}
                    <div className="flex items-center gap-3 bg-secondary/40 p-1 rounded-xl border border-border/50">
                        <button
                            onClick={() => setIs24H(false)}
                            className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", !is24H ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                        >12H</button>
                        <button
                            onClick={() => setIs24H(true)}
                            className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", is24H ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                        >24H</button>
                    </div>

                    {/* Main Clock Card */}
                    <div className="bg-primary px-4 py-1.5 rounded-xl shadow-lg flex items-center gap-3 border border-primary-foreground/10">
                        <div className="w-7 h-7 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground">
                            <Globe className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left">
                            <p className="text-lg font-black text-primary-foreground leading-none">
                                {format(now, is24H ? 'HH:mm' : 'hh:mm a')}
                            </p>
                            <p className="text-[8px] font-black text-primary-foreground/60 uppercase tracking-[0.1em] mt-0.5">
                                {format(now, 'EEEE, MMM dd')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Session Board */}
            <div className="glass-card-premium rounded-[1.5rem] border border-border/50 overflow-hidden shadow-2xl relative bg-card/60 backdrop-blur-2xl">
                {/* Active Indicator Floating */}
                <div className="absolute top-5 left-5 z-20">
                    <div className="px-3.5 py-1 rounded-full bg-secondary/50 border border-border/50 flex items-center gap-2 backdrop-blur-xl">
                        <div className={cn(
                            "w-1.5 h-1.5 rounded-full ring-2",
                            currentSessions.length > 0 ? "bg-emerald-500 ring-emerald-500/20 animate-pulse" : "bg-muted-foreground/40 ring-transparent"
                        )} />
                        <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest",
                            currentSessions.length > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                        )}>
                            {currentSessions.length > 0 ? `${currentSessions.map(s => s.name).join(' & ')} Active` : 'No Active Sessions'}
                        </span>
                    </div>
                </div>

                {/* Timeline Background & Labels */}
                <div
                    ref={timelineRef}
                    onMouseDown={onMouseDown}
                    className={cn(
                        "p-6 pt-16 relative min-h-[350px] cursor-crosshair select-none transition-colors duration-300",
                        isScrubbing ? "bg-white/[0.03]" : ""
                    )}
                >
                    {/* Time Grid Header */}
                    <div className="flex justify-between mb-8 px-24 text-muted-foreground/60 text-[7px] font-black uppercase tracking-[0.4em] font-mono whitespace-nowrap overflow-hidden">
                        {Array.from({ length: 13 }).map((_, i) => {
                            const date = addHours(startOfToday(), i * 2 + 5.5);
                            const hour = date.getHours();
                            const isNight = hour < 6 || hour >= 18;
                            return (
                                <span key={i} className="flex flex-col items-center gap-1.5 min-w-[40px]">
                                    <div className="flex items-center gap-1">
                                        {isNight ? <Moon className="w-2.5 h-2.5 text-blue-500 dark:text-blue-400" /> : <Sun className="w-2.5 h-2.5 text-amber-500 dark:text-amber-400" />}
                                        {format(date, is24H ? 'HH:mm' : 'h a')}
                                    </div>
                                    <div className="h-0.5 w-px bg-border/50" />
                                </span>
                            );
                        })}
                    </div>

                    {/* Session Rows */}
                    <div className="space-y-4 relative">
                        {/* Current Time INDICATOR LINE (Premium Lime Green) */}
                        {(() => {
                            const hour = now.getHours();
                            const isNight = hour < 6 || hour >= 18;
                            return (
                                <div
                                    className={cn(
                                        "absolute top-[-35px] bottom-[-15px] w-px z-50 flex flex-col items-center transition-all",
                                        isScrubbing ? "bg-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.5)]" : "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                    )}
                                    style={{ left: `${(differenceInSeconds(activeTime, startOfToday()) / 86400) * 100}%` }}
                                >
                                    <div className={cn(
                                        "absolute top-[-38px] whitespace-nowrap px-2 py-0.5 text-white text-[9px] font-black rounded-md shadow-xl transform -translate-x-1/2 flex items-center gap-1.5 border border-black/10 transition-colors",
                                        isScrubbing ? "bg-amber-600" : "bg-emerald-600"
                                    )}>
                                        <div className="flex items-center gap-1.5">
                                            {isNight ? (
                                                <Moon className="w-3 h-3 text-white fill-white/10" strokeWidth={3} />
                                            ) : (
                                                <Sun className="w-3 h-3 text-white fill-white/10" strokeWidth={3} />
                                            )}
                                            {format(activeTime, is24H ? 'HH:mm' : 'hh:mm a')}
                                            {isScrubbing && (
                                                <span className="ml-1 px-1 bg-black/20 text-white text-[7px] rounded uppercase animate-pulse">Preview</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "w-2.5 h-2.5 rounded-full -mt-1 border border-background z-10 transition-colors shadow-sm",
                                        isScrubbing ? "bg-amber-500" : "bg-emerald-500"
                                    )} />
                                    <div className={cn(
                                        "flex-1 w-px bg-gradient-to-b via-transparent to-transparent opacity-80",
                                        isScrubbing ? "from-amber-500" : "from-emerald-500"
                                    )} />
                                </div>
                            );
                        })()}

                        {SESSIONS.map((session) => {
                            const { startIST, endIST, isActive } = getSessionTimes(session);
                            const startPercent = (differenceInSeconds(startIST, startOfToday()) / 86400) * 100;
                            const endPercent = (differenceInSeconds(endIST, startOfToday()) / 86400) * 100;
                            const durationPercent = endPercent - startPercent;
                            const colors = SESSION_COLORS[session.color];

                            return (
                                <div key={session.name} className="relative group/row flex items-center h-12">
                                    {/* Capsule & Flag (Matching user screenshot style) */}
                                    <div className="w-24 flex-none flex items-center gap-4">
                                        <div className={cn(
                                            "w-9 h-14 rounded-full flex flex-col items-center justify-center bg-secondary/30 border border-border/50 transition-all duration-500 overflow-hidden relative group/capsule",
                                            isActive && "bg-secondary border-primary/50 shadow-lg scale-110",
                                            isActive && colors.text
                                        )}>
                                            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-foreground/5 to-transparent pointer-events-none" />
                                            <img
                                                src={`https://flagcdn.com/w80/${session.countryCode}.png`}
                                                alt={session.name}
                                                className="w-6 h-6 rounded-full object-cover shadow-2xl mb-1 z-10 border border-border/50"
                                            />
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-tighter z-10 transition-colors",
                                                isActive ? "text-foreground" : "text-muted-foreground/60"
                                            )}>
                                                {session.countryCode}
                                            </span>
                                        </div>
                                        <div className="hidden lg:block">
                                            <h4 className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isActive ? "text-foreground" : "text-muted-foreground/40")}>{session.name}</h4>
                                            <div className="flex flex-col mt-1">
                                                <p className={cn("text-[9px] font-bold font-mono", isActive ? "text-primary" : "text-muted-foreground/30")}>
                                                    {format(startIST, is24H ? 'HH:mm' : 'ha')}
                                                </p>
                                                <p className={cn("text-[8px] font-black uppercase tracking-tighter transition-all mt-0.5", isActive ? "text-emerald-500" : "text-amber-500/70")}>
                                                    {isActive ? (
                                                        `Closes ${Math.floor(differenceInSeconds(endIST, activeTime) / 3600)}h ${Math.floor((differenceInSeconds(endIST, activeTime) % 3600) / 60)}m`
                                                    ) : (
                                                        `Opens ${Math.floor(differenceInSeconds(startIST, activeTime) / 3600)}h ${Math.floor((differenceInSeconds(startIST, activeTime) % 3600) / 60)}m`
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline Bar Container */}
                                    <div className="flex-1 h-8 bg-secondary/20 rounded-xl relative overflow-hidden border border-border/30">
                                        <div
                                            className={cn(
                                                "absolute inset-y-0 rounded-lg flex items-center px-4 transition-all duration-700",
                                                isActive ? `${colors.bg}/20 border border-primary/20 shadow-inner` : "bg-muted/10",
                                                isActive && "backdrop-blur-sm"
                                            )}
                                            style={{
                                                left: `${startPercent % 100}%`,
                                                width: `${durationPercent % 100}%`
                                            }}
                                        >
                                            <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-r from-transparent via-foreground to-transparent -translate-x-full animate-[shimmer_3s_infinite]", isActive ? "block" : "hidden")} />
                                            <div className="flex items-center gap-2 truncate">
                                                <img
                                                    src={`https://flagcdn.com/w40/${session.countryCode}.png`}
                                                    alt={session.flag}
                                                    className="w-3.5 h-3.5 rounded-full object-cover shadow-sm"
                                                />
                                                <span className={cn("text-[7px] font-black uppercase tracking-[0.2em]", isActive ? "text-foreground" : "text-muted-foreground/40")}>
                                                    {session.name} SESSION {isActive ? 'OPEN' : 'CLOSED'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Grid Helper Lines */}
                                        <div className="absolute inset-0 pointer-events-none flex justify-between divide-x divide-border/10">
                                            {Array.from({ length: 24 }).map((_, i) => <div key={i} className="flex-1" />)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Time Grid Footer (Added for better "Down Values" visibility) */}
                    <div className="flex justify-between mt-10 px-24 text-muted-foreground/60 text-[7px] font-black uppercase tracking-[0.4em] font-mono whitespace-nowrap overflow-hidden border-t border-border/10 pt-6">
                        {Array.from({ length: 13 }).map((_, i) => {
                            const date = addHours(startOfToday(), i * 2 + 5.5);
                            const hour = date.getHours();
                            const isNight = hour < 6 || hour >= 18;
                            return (
                                <span key={i} className="flex flex-col items-center gap-1.5 min-w-[40px]">
                                    <div className="h-0.5 w-px bg-border/50 mb-1" />
                                    <div className="flex items-center gap-1">
                                        {isNight ? <Moon className="w-2.5 h-2.5 text-blue-500 dark:text-blue-400" /> : <Sun className="w-2.5 h-2.5 text-amber-500 dark:text-amber-400" />}
                                        {format(date, is24H ? 'HH:mm' : 'h a')}
                                    </div>
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Best Times Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <h2 className="text-lg font-bold italic tracking-tight uppercase text-foreground">Best Times to Trade</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Highest Volatility */}
                    <div className="group relative bg-card/60 backdrop-blur-xl p-6 rounded-[1.5rem] border border-border/50 hover:border-emerald-500/20 transition-all duration-500">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-emerald-500/20">
                                    <Zap className="w-2 h-2" />
                                    Highest Volume
                                </div>
                                <div className="flex -space-x-1.5">
                                    <span className="text-[10px] w-5 h-5 rounded-full bg-secondary border border-border/50 flex items-center justify-center shadow-sm">🇬🇧</span>
                                    <span className="text-[10px] w-5 h-5 rounded-full bg-secondary border border-border/50 flex items-center justify-center shadow-sm">🇺🇸</span>
                                </div>
                            </div>
                            <span className="text-[9px] text-muted-foreground font-bold italic">London + NY Overlap</span>
                        </div>
                        <h3 className="text-xl font-black mb-2 text-foreground">06:30 pm - 10:30 pm</h3>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">Maximum liquidity, tightest spreads. Peak at 7:30 pm - 9:30 pm. Best for EUR/USD, GBP/USD.</p>
                        <ChevronRight className="absolute bottom-5 right-5 w-4 h-4 opacity-0 group-hover:opacity-40 -translate-x-3 group-hover:translate-x-0 transition-all text-emerald-500" />
                    </div>

                    {/* London Open */}
                    <div className="group relative bg-card/60 backdrop-blur-xl p-6 rounded-[1.5rem] border border-border/50 hover:border-blue-500/20 transition-all duration-500">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-500/10 text-blue-600 dark:text-blue-500 px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-blue-500/20">
                                    <Clock className="w-2 h-2" />
                                    London Open
                                </div>
                                <span className="text-[10px] w-5 h-5 rounded-full bg-secondary border border-border/50 flex items-center justify-center shadow-sm">🇬🇧</span>
                            </div>
                            <span className="text-[9px] text-muted-foreground font-bold italic">High Volatility Window</span>
                        </div>
                        <h3 className="text-xl font-black mb-2 text-foreground">01:30 pm - 03:30 pm</h3>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">Day's first major expansion in volatility. Sets directional bias for EUR/GBP crosses.</p>
                        <ChevronRight className="absolute bottom-5 right-5 w-4 h-4 opacity-0 group-hover:opacity-40 -translate-x-3 group-hover:translate-x-0 transition-all text-blue-500" />
                    </div>

                    {/* Tokyo Open */}
                    <div className="group relative bg-card/60 backdrop-blur-xl p-6 rounded-[1.5rem] border border-border/50 hover:border-amber-500/20 transition-all duration-500">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <div className="bg-amber-500/10 text-amber-600 dark:text-amber-500 px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-amber-500/20">
                                    <Globe className="w-2 h-2" />
                                    Tokyo Open
                                </div>
                                <span className="text-[10px] w-5 h-5 rounded-full bg-secondary border border-border/50 flex items-center justify-center shadow-sm">🇯🇵</span>
                            </div>
                            <span className="text-[9px] text-muted-foreground font-bold italic">Best Asia Window</span>
                        </div>
                        <h3 className="text-xl font-black mb-2 text-foreground">05:30 am - 08:30 am</h3>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">Strongest Asian session activity. Best for USD/JPY, EUR/JPY, AUD/USD.</p>
                        <ChevronRight className="absolute bottom-5 right-5 w-4 h-4 opacity-0 group-hover:opacity-40 -translate-x-3 group-hover:translate-x-0 transition-all text-amber-500" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketSessions;
