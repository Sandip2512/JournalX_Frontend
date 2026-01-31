import React, { useState, useMemo } from "react";
import { Trade } from "@/types/trade-types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, X, BarChart3, Clock, DollarSign, Target } from "lucide-react";
import { format } from "date-fns";

interface DayTradesModalProps {
    date: Date | null;
    trades: Trade[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DayTradesModal({ date, trades, open, onOpenChange }: DayTradesModalProps) {
    const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

    // Sort trades by time (desc) to ensure consistency
    const sortedTrades = useMemo(() => {
        return [...trades].sort((a, b) => new Date(b.close_time).getTime() - new Date(a.close_time).getTime());
    }, [trades]);

    // Set initial selected trade
    React.useEffect(() => {
        if (open && sortedTrades.length > 0 && !selectedTrade) {
            setSelectedTrade(sortedTrades[0]);
        }
    }, [open, sortedTrades, selectedTrade]);

    if (!date) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl w-[94vw] h-[85vh] p-0 overflow-hidden bg-[#0a0a0b] border-white/5 shadow-2xl flex flex-col border-none sm:rounded-[32px]">
                {/* Manual Glass Effect Wrapper */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

                <DialogHeader className="p-6 border-b border-white/5 flex flex-row items-center justify-between shrink-0 relative z-10">
                    <div className="space-y-1 self-start text-left">
                        <DialogTitle className="text-xl font-black text-white tracking-tight">
                            Trades on {format(date, "MMM dd")}
                        </DialogTitle>
                        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                            {trades.length} {trades.length === 1 ? 'trade' : 'trades'} recorded
                        </p>
                    </div>
                </DialogHeader>

                <div className="flex-1 flex overflow-hidden relative z-10">
                    {/* Sidebar: Trade List */}
                    <div className="w-[320px] border-r border-white/5 overflow-y-auto p-4 space-y-3 bg-black/20 overflow-x-hidden">
                        {sortedTrades.map((trade) => {
                            const isProfit = trade.net_profit >= 0;
                            const isSelected = selectedTrade?.trade_no === trade.trade_no;

                            return (
                                <div
                                    key={trade.trade_no}
                                    onClick={() => setSelectedTrade(trade)}
                                    className={cn(
                                        "p-4 rounded-[20px] cursor-pointer transition-all duration-500 border relative group overflow-hidden",
                                        isSelected
                                            ? "bg-[#111114] border-primary/30 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
                                            : "bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/5"
                                    )}
                                >
                                    {isSelected && (
                                        <div className="absolute inset-0 border border-primary/40 rounded-[20px] pointer-events-none shadow-[inset_0_0_10px_rgba(11,102,228,0.1)]" />
                                    )}

                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.1)] shrink-0">
                                                <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center">
                                                    <span className="text-[6px] font-black text-white/80">{trade.symbol?.charAt(0)}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-black text-white tracking-tight uppercase leading-none">{trade.symbol}</p>
                                                <span className={cn(
                                                    "text-[8px] font-black uppercase tracking-widest",
                                                    trade.type.includes("BUY") ? "text-blue-400" : "text-orange-400"
                                                )}>
                                                    {trade.type.includes("BUY") ? "LONG" : "SHORT"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn(
                                                "text-xs font-black tracking-tighter",
                                                trade.net_profit >= 0 ? "text-[#3b82f6]" : "text-red-500"
                                            )}>
                                                {trade.net_profit >= 0 ? "+" : ""}${trade.net_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                            <p className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-widest">{trade.volume} Lots</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-[9px] font-bold text-muted-foreground/30">
                                        <div className="space-y-0.5">
                                            <p className="uppercase tracking-[0.15em] text-[7px] opacity-60">Entry:</p>
                                            <p className="text-white/80 font-mono text-[10px]">${trade.price_open}</p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="uppercase tracking-[0.15em] text-[7px] opacity-60">Exit:</p>
                                            <p className="text-white/80 font-mono text-[10px]">${trade.price_close}</p>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em] pt-3 border-t border-white/[0.02]">
                                        <span className="text-muted-foreground/20">Size: <span className="text-muted-foreground/60">{trade.volume}</span></span>
                                        <span className="text-muted-foreground/20">{format(new Date(trade.close_time), "hh:mm a")}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Main Content: Trade Detail */}
                    <div className="flex-1 overflow-x-hidden overflow-y-auto p-8 bg-[#080809]">
                        {selectedTrade ? (
                            <div className="h-full flex flex-col">
                                {/* Top Header: Exact match to screenshot - Scaled for fit */}
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.1)] shrink-0">
                                                <div className="w-4 h-4 rounded-full border border-white/40 flex items-center justify-center overflow-hidden">
                                                    <span className="text-[6px] font-black text-white/80">{selectedTrade.symbol?.charAt(0)}</span>
                                                </div>
                                            </div>
                                            <h2 className="text-2xl font-black text-white tracking-tighter uppercase whitespace-nowrap">{selectedTrade.symbol}</h2>
                                        </div>

                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <div className={cn(
                                                "px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border shrink-0",
                                                selectedTrade.type.includes("BUY") ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                            )}>
                                                {selectedTrade.type.includes("BUY") ? "LONG" : "SHORT"}
                                            </div>
                                            <div className={cn(
                                                "px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border shrink-0",
                                                selectedTrade.net_profit >= 0 ? "bg-[#10b98110] text-[#10b981] border-[#10b98120]" : "bg-red-500/10 text-red-400 border-red-500/20"
                                            )}>
                                                {selectedTrade.net_profit >= 0 ? 'Winner' : 'Loser'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-5 text-right">
                                        <div className="space-y-0.5 shrink-0">
                                            <p className="text-[7px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">ENTRY</p>
                                            <p className="text-lg font-black text-white tracking-tighter font-mono">${selectedTrade.price_open.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                        </div>
                                        <div className="space-y-0.5 shrink-0">
                                            <p className="text-[7px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">EXIT</p>
                                            <p className="text-lg font-black text-white tracking-tighter font-mono">${selectedTrade.price_close.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                        </div>
                                        <div className="space-y-0.5 shrink-0">
                                            <p className="text-[7px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">SIZE</p>
                                            <p className="text-lg font-black text-white tracking-tighter font-mono">{selectedTrade.volume}</p>
                                        </div>
                                        <div className="space-y-0.5 shrink-0">
                                            <p className="text-[7px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">P&L</p>
                                            <p className={cn(
                                                "text-lg font-black tracking-tighter whitespace-nowrap",
                                                selectedTrade.net_profit >= 0 ? "text-[#3b82f6]" : "text-red-500"
                                            )}>
                                                {selectedTrade.net_profit >= 0 ? "+" : ""}${selectedTrade.net_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Dash Box: Visual matching user's reference */}
                                <div className="flex-1 w-full rounded-[32px] border border-dashed border-white/[0.05] bg-white/[0.01] relative flex flex-col">
                                    {/* Redundant Internal Header: EXACT match to screenshot - Even Smaller */}
                                    <div className="p-6 pb-0 flex items-center gap-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-full bg-amber-400/90 flex items-center justify-center shrink-0">
                                                <div className="w-3.5 h-3.5 rounded-full border border-white/40 flex items-center justify-center">
                                                    <span className="text-[5px] font-black text-white/80">{selectedTrade.symbol?.charAt(0)}</span>
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-black text-white tracking-tight uppercase">{selectedTrade.symbol}</h3>
                                            <div className={cn(
                                                "px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border",
                                                selectedTrade.type.includes("BUY") ? "bg-blue-500/5 text-blue-500/60 border-blue-500/10" : "bg-orange-500/5 text-orange-500/60 border-orange-500/10"
                                            )}>
                                                {selectedTrade.type.includes("BUY") ? "LONG" : "SHORT"}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-[7px] font-black text-muted-foreground/20 uppercase tracking-[0.2em]">ENTRY</span>
                                                <span className="text-sm font-black text-white/90 tracking-tighter font-mono">${selectedTrade.price_open.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-[7px] font-black text-muted-foreground/20 uppercase tracking-[0.2em]">EXIT</span>
                                                <span className="text-sm font-black text-white/90 tracking-tighter font-mono">${selectedTrade.price_close.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-[7px] font-black text-muted-foreground/20 uppercase tracking-[0.2em]">P&L</span>
                                                <span className={cn(
                                                    "text-sm font-black tracking-tighter whitespace-nowrap",
                                                    selectedTrade.net_profit >= 0 ? "text-[#3b82f6]/90" : "text-red-500/90"
                                                )}>
                                                    {selectedTrade.net_profit >= 0 ? "+" : ""}${selectedTrade.net_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Centered Message */}
                                    <div className="flex-1 flex flex-col items-center justify-center">
                                        <div className="w-20 h-20 rounded-[28px] bg-white/[0.02] border border-white/5 flex items-center justify-center text-muted-foreground/10 mb-6">
                                            <BarChart3 className="w-10 h-10" />
                                        </div>
                                        <div className="text-center space-y-3">
                                            <h4 className="text-2xl font-black text-white/20 tracking-tighter uppercase">Chart Not Available</h4>
                                            <p className="text-[11px] text-muted-foreground/10 uppercase tracking-[0.2em] max-w-sm leading-relaxed font-bold">
                                                This trade was added manually. Connect a trading account to view real-time charts for your trades.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="p-10 pt-0">
                                        <button className="px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:bg-white/10 hover:text-white transition-all shadow-xl">
                                            Manual Entry
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
                                <Target className="w-16 h-16 text-primary" />
                                <p className="text-xs font-black uppercase tracking-widest">Select a trade to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
