import React from "react";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlayCircle, Eye, Calendar, Clock, DollarSign, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface SessionListProps {
    sessions: any[];
    loading: boolean;
    onSelectSession: (id: string) => void;
    onDeleteSession: (id: string) => void;
}

export const SessionList = ({ sessions, loading, onSelectSession, onDeleteSession }: SessionListProps) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (sessions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <PlayCircle className="w-8 h-8 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">No sessions yet</h3>
                <p className="text-muted-foreground max-w-xs">
                    Start your first backtesting session to practice your strategies.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="grid grid-cols-6 gap-2 px-4 py-2 bg-white/5 border-b border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                <div className="col-span-2">Strategy Name</div>
                <div>Pairs</div>
                <div>Timeframe</div>
                <div>Balance</div>
                <div className="text-right">Actions</div>
            </div>
            
            <div className="divide-y divide-white/5">
                {sessions.map((session, index) => (
                    <div 
                        key={session._id} 
                        className="group grid grid-cols-6 gap-2 px-4 py-3 items-center hover:bg-white/[0.02] transition-all duration-300 cursor-pointer relative overflow-hidden"
                        onClick={() => onSelectSession(session._id)}
                    >
                        {/* Subtle left border accent on hover */}
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="col-span-2 flex flex-col gap-0.5">
                            <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-tight">
                                {session.strategy_name}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-medium">
                                    {format(new Date(session.created_at), 'MMM d, yyyy')}
                                </span>
                                {session.mode === 'tv_sync' && (
                                    <span className="px-1 py-0.2 rounded-sm bg-blue-500/10 text-blue-400 text-[7px] font-black uppercase tracking-tighter border border-blue-500/10">
                                        TV
                                    </span>
                                )}
                            </div>
                        </div>
 
                        <div>
                            <div className="flex flex-wrap gap-1">
                                {session.pairs.slice(0, 2).map((pair: string) => (
                                    <span key={pair} className="px-1.5 py-0.2 rounded-md bg-white/5 border border-white/10 text-foreground/60 text-[9px] font-bold">
                                        {pair}
                                    </span>
                                ))}
                                {session.pairs.length > 2 && <span className="text-[9px] text-muted-foreground/40">+{session.pairs.length - 2}</span>}
                            </div>
                        </div>
 
                        <div>
                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-muted-foreground/70 group-hover:text-foreground/80 transition-colors border border-white/5">
                                <Clock className="w-2.5 h-2.5 text-primary/40" />
                                {session.timeframe}
                            </div>
                        </div>
 
                        <div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-0.5 font-mono text-xs text-emerald-500/80 font-black">
                                    <DollarSign className="w-2.5 h-2.5" />
                                    {session.starting_balance.toLocaleString()}
                                </div>
                            </div>
                        </div>
 
                        <div className="flex items-center justify-end gap-1.5">
                            <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-7 w-7 p-0 rounded-lg bg-white/5 border border-white/5 hover:bg-primary/20 hover:border-primary/30 hover:text-primary transition-all group/btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectSession(session._id);
                                }}
                            >
                                <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-7 w-7 p-0 rounded-lg bg-white/5 border border-white/5 hover:bg-destructive/10 hover:border-destructive/20 hover:text-destructive text-muted-foreground/40 transition-all opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteSession(session._id);
                                }}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

