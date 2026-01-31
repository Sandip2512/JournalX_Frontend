import React from "react";
import { Check, Star, BookOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface JournalEntryFormProps {
    trade: any;
    onUpdate: (updatedTrade: any) => void;
    className?: string;
}

export function JournalEntryForm({ trade, onUpdate, className }: JournalEntryFormProps) {
    const [loading, setLoading] = React.useState(false);

    const toggleFlag = async (field: string) => {
        setLoading(true);
        try {
            const updatedData = { [field]: !trade[field], is_journaled: true };
            const res = await api.put(`/trades/${trade.trade_no}/journal`, updatedData);
            onUpdate(res.data.trade);
        } catch (error) {
            console.error("Error updating flag:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateRating = async (rating: number) => {
        setLoading(true);
        try {
            const res = await api.put(`/trades/${trade.trade_no}/journal`, { rating, is_journaled: true });
            onUpdate(res.data.trade);
        } catch (error) {
            console.error("Error updating rating:", error);
        } finally {
            setLoading(false);
        }
    };

    const flags = [
        { id: "followed_plan", label: "Followed Plan" },
        { id: "proper_risk", label: "Proper Risk" },
        { id: "good_entry", label: "Good Entry" },
        { id: "patient_exit", label: "Patient Exit" },
        { id: "pre_analysis", label: "Pre-analysis" },
        { id: "post_review", label: "Post-review" },
    ];

    return (
        <div className={cn("glass-card-premium p-6 rounded-3xl border border-border dark:border-white/5 space-y-6", className)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground dark:text-white">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Journal Entry</h3>
                </div>
                {trade.is_journaled && (
                    <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full uppercase">
                        Journaled
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                {flags.map((flag) => (
                    <button
                        key={flag.id}
                        disabled={loading}
                        onClick={() => toggleFlag(flag.id)}
                        className={cn(
                            "flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 group",
                            trade[flag.id]
                                ? "bg-primary/10 border-primary/20 text-foreground dark:text-white"
                                : "bg-muted dark:bg-white/5 border-border dark:border-white/5 text-muted-foreground hover:bg-muted/80 dark:hover:bg-white/10 hover:border-border dark:hover:border-white/10"
                        )}
                    >
                        <div className={cn(
                            "w-5 h-5 rounded-lg flex items-center justify-center border transition-all",
                            trade[flag.id]
                                ? "bg-primary border-primary text-white"
                                : "bg-transparent border-muted-foreground/30 dark:border-white/20 text-transparent group-hover:border-muted-foreground/50 dark:group-hover:border-white/40"
                        )}>
                            <Check className="w-3 h-3" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wide">{flag.label}</span>
                    </button>
                ))}
            </div>

            <div className="space-y-3 pt-2 border-t border-border dark:border-white/5">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <span>Rating</span>
                    <span className="text-foreground dark:text-white">{(trade.rating || 0)}/10</span>
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                        <button
                            key={star}
                            disabled={loading}
                            onClick={() => updateRating(star)}
                            className={cn(
                                "w-6 h-6 flex items-center justify-center transition-all",
                                star <= (trade.rating || 0) ? "text-amber-500 scale-110" : "text-muted-foreground/20 dark:text-white/10 hover:text-muted-foreground/40 dark:hover:text-white/30"
                            )}
                        >
                            <Star className={cn("w-5 h-5", star <= (trade.rating || 0) ? "fill-current" : "")} />
                        </button>
                    ))}
                </div>
            </div>

            <button className="w-full h-12 rounded-2xl bg-muted dark:bg-white/5 border border-border dark:border-white/5 flex items-center justify-center gap-2 hover:bg-muted/80 dark:hover:bg-white/10 transition-all group">
                <span className="text-[11px] font-black text-foreground dark:text-white uppercase tracking-widest">View Full Journal</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
}
