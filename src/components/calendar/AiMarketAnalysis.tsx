import React, { useState, useEffect } from "react";
import { Sparkles, History, AlignLeft, Target, AlertTriangle, Link2, Clock, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { EconomicEvent } from "@/types/calendar";
import { calendarApi } from '@/services/api/calendarApi';

interface AiMarketAnalysisProps {
    event: EconomicEvent;
}

export function AiMarketAnalysis({ event }: AiMarketAnalysisProps) {
    const isHighImpact = event.impact_level === "high";
    const [newsFeed, setNewsFeed] = useState<any[]>([]);
    const [isLoadingNews, setIsLoadingNews] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchLiveNews = async () => {
            try {
                setIsLoadingNews(true);
                const query = `${event.currency} ${event.event_name}`;
                const response = await calendarApi.searchNews(query, 3);
                if (isMounted && response?.success && response?.news) {
                    setNewsFeed(response.news);
                }
            } catch (error) {
                console.error("Error fetching live news", error);
            } finally {
                if (isMounted) setIsLoadingNews(false);
            }
        };
        fetchLiveNews();
        return () => { isMounted = false; };
    }, [event._id]);

    const generatePreviousContext = () => {
        if (!event.previous) return "Data regarding the previous market reaction is currently unavailable for this specific indicator.";
        return `During the last reporting period, this figure was recorded at ${event.previous}. This data point indicated deeper shifts in the underlying economy, significantly altering bond yield trajectories and shifting broader macro-economic expectations globally.`;
    };

    const generateCurrentScenario = () => {
        return `Heading into this release, the broader macroeconomic landscape is heavily focused on inflation stickiness and labor market cooling. Recent secondary indicators have shown softening consumer demand, making this upcoming ${event.event_name} publication a critical gauge for economists tracking the risk of a potential economic slowdown.`;
    };

    const generateForecast = () => {
        if (!event.forecast) return "Economists have not established a consolidated forecast parameter for this upcoming release.";

        return `The consensus economic estimate currently stands at ${event.forecast}. If the actual data aligns with this projection, it reinforces the ongoing 'soft landing' narrative for the ${event.currency} economy. A substantial deviation, however, may force central banking officials to aggressively re-evaluate their upcoming quarterly interest rate decisions.`;
    };

    return (
        <div className="w-full mt-4 bg-black/40 border border-primary/20 rounded-2xl overflow-hidden shadow-inner flex flex-col">
            <div className="bg-primary/10 border-b border-primary/10 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-xs font-black text-primary uppercase tracking-widest">Ai Market Intelligence</span>
                </div>
                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-[9px] uppercase tracking-wider">
                    Context Engine
                </Badge>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Previous Area */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-orange-400" />
                        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Previous Impact</h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed border-l-2 border-orange-400/30 pl-3">
                        {generatePreviousContext()}
                    </p>
                </div>

                {/* Current Area */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <AlignLeft className="w-4 h-4 text-primary" />
                        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Current Scenario</h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">
                        {generateCurrentScenario()}
                    </p>
                </div>

                {/* Forecast Area */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Forecast & Outlook</h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed border-l-2 border-emerald-400/30 pl-3">
                        {generateForecast()}
                    </p>
                </div>
            </div>

            {/* Live Web Scraped News Feed */}
            <div className="px-5 pb-5">
                <div className="w-full rounded-xl bg-card border border-border/50 overflow-hidden shadow-sm">
                    <div className="bg-secondary/40 border-b border-border/50 p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse ml-1" />
                            <span className="text-[10px] font-bold text-foreground uppercase tracking-widest flex items-center gap-1.5">
                                <Globe className="w-3 h-3 text-muted-foreground" />
                                Live Internet Radar
                            </span>
                        </div>
                        {isLoadingNews && (
                            <span className="text-[9px] text-muted-foreground uppercase flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 border-t border-r border-blue-500 rounded-full animate-spin" />
                                Scraping Web...
                            </span>
                        )}
                    </div>
                    <div className="p-1 divide-y divide-border/30">
                        {isLoadingNews ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="p-3 animate-pulse flex flex-col gap-2">
                                    <div className="bg-border/50 h-3 w-3/4 rounded-sm" />
                                    <div className="bg-border/30 h-2 w-1/4 rounded-sm" />
                                </div>
                            ))
                        ) : newsFeed.length > 0 ? (
                            newsFeed.map((news, idx) => (
                                <a
                                    key={idx}
                                    href={news.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex flex-col gap-2 p-3 hover:bg-secondary/40 transition-colors"
                                >
                                    <h5 className="text-xs font-semibold text-foreground/90 group-hover:text-primary transition-colors leading-relaxed line-clamp-2">
                                        {news.title}
                                    </h5>
                                    <div className="flex items-center gap-3 text-[9px] font-medium text-muted-foreground/60 uppercase tracking-wider mt-1">
                                        <span className="flex items-center gap-1">
                                            <Globe className="w-3 h-3 text-blue-400" />
                                            {news.source}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {news.pubDate?.split(' ').slice(0, 4).join(' ')}
                                        </span>
                                        <Link2 className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                    </div>
                                </a>
                            ))
                        ) : (
                            <div className="p-4 flex justify-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50">
                                No direct web coverage detected
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isHighImpact && (
                <div className="mx-5 mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3 items-start">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-amber-500">Major Economic Catalyst</span>
                        <p className="text-[10px] text-amber-500/70 leading-relaxed">
                            This is a tier-1 economic release. Data prints of this magnitude have historically caused immediate baseline shifts in currency valuations, forcing global markets to rapidly re-price asset classes across the board.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

// Minimal Badge polyfill if required by import context (since it wasn't strictly imported)
function Badge({ children, variant, className }: any) {
    return <span className={cn("px-2 py-0.5 rounded-md", className)}>{children}</span>
}
