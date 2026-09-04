import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    TrendingUp, TrendingDown, 
    Zap, AlertTriangle, 
    Settings2 
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface TradePanelProps {
    session: any;
    openTrade: any;
    currentPrice: number;
    currentTime: string;
    onTradeSuccess: () => void;
}

export const TradePanel = ({ session, openTrade, onTradeSuccess }: TradePanelProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [price, setPrice] = useState(0);
    const [time, setTime] = useState("");
    const [volume, setVolume] = useState("0.1");
    const [tp, setTp] = useState("");
    const [sl, setSl] = useState("");
    const [loading, setLoading] = useState(false);
    const [unrealizedPL, setUnrealizedPL] = useState<number | null>(null);

    // Sync with global backtest state
    useEffect(() => {
        const handleTick = () => {
            const currentPrice = (window as any).__BT_CURRENT_PRICE || 0;
            const currentTime = (window as any).__BT_CURRENT_TIME || "";
            setPrice(currentPrice);
            setTime(currentTime);

            // Calculate unrealized P&L
            if (openTrade && currentPrice) {
                const type = openTrade.trade_type.toLowerCase();
                const diff = type === 'buy' 
                    ? currentPrice - openTrade.entry_price 
                    : openTrade.entry_price - currentPrice;
                
                const pl = diff * openTrade.lot_size;
                setUnrealizedPL(pl);
            } else {
                setUnrealizedPL(null);
            }
        };

        window.addEventListener('bt-tick', handleTick);
        // Initial sync
        handleTick();
        
        return () => window.removeEventListener('bt-tick', handleTick);
    }, [openTrade]);

    const handleTrade = useCallback(async (type: 'buy' | 'sell') => {
        if (!price || !time || !user?.user_id) {
            toast({
                title: "Wait",
                description: "Missing price, time, or user credentials.",
            });
            return;
        }

        try {
            setLoading(true);

            // Block any new trade if a position is already open
            if (openTrade) {
                toast({
                    title: "Action Blocked",
                    description: `You must close your current ${openTrade.trade_type.toUpperCase()} position before opening a new trade.`,
                    variant: "destructive"
                });
                setLoading(false);
                return;
            }

            // Create new trade
            const payload = {
                session_id: session._id,
                pair: session.pairs[0],
                trade_type: type,
                entry_price: price,
                entry_time: time,
                lot_size: parseFloat(volume),
                tp_price: tp ? parseFloat(tp) : null,
                sl_price: sl ? parseFloat(sl) : null,
                status: 'open'
            };

            await api.post(`/api/backtest/trades?user_id=${user.user_id}`, payload);
            
            toast({
                title: `${type.toUpperCase()} Order Executed`,
                description: `Entered ${session.pairs[0]} at ${price}${tp ? ` (TP: ${tp})` : ''}${sl ? ` (SL: ${sl})` : ''}`,
            });
            
            onTradeSuccess();
            // Clear TP/SL after execution
            setTp("");
            setSl("");
        } catch (error) {
            console.error("Trade execution error:", error);
            toast({
                title: "Execution Failed",
                description: "Could not place simulated trade.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [price, time, user, session, volume, tp, sl, openTrade, onTradeSuccess, toast]);

    // Listen for on-chart trade requests
    useEffect(() => {
        const handleRequest = (e: any) => {
            handleTrade(e.detail);
        };
        window.addEventListener('bt-request-trade', handleRequest);
        return () => window.removeEventListener('bt-request-trade', handleRequest);
    }, [handleTrade]);

    const handleClosePosition = async () => {
        if (!openTrade || !price || !time) return;

        try {
            setLoading(true);
            await api.patch(`/api/backtest/trades/${openTrade._id}`, {
                status: 'closed',
                exit_price: price,
                exit_time: time
            });
            
            toast({
                title: "Position Closed",
                description: `Manual exit at ${price}`,
            });
            
            onTradeSuccess();
        } catch (error) {
            console.error("Close position error:", error);
            toast({
                title: "Error",
                description: "Could not close position.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // Listen for on-chart trade requests
    useEffect(() => {
        const handleRequest = (e: any) => {
            handleTrade(e.detail);
        };
        window.addEventListener('bt-request-trade', handleRequest);
        return () => window.removeEventListener('bt-request-trade', handleRequest);
    }, [handleTrade]);

    return (
        <div className="glass-card-premium p-6 rounded-2xl border border-border/50 bg-card shadow-xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Execution Panel
            </h3>

            <div className="space-y-6">
                <div className="bg-black/20 p-4 rounded-2xl border border-white/5 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Current Price</p>
                    <p className="text-3xl font-mono font-bold text-foreground">
                        {price ? price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "---"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1 truncate">
                        {time ? new Date(time).toLocaleTimeString() : "No time data"}
                    </p>
                </div>

                {openTrade && unrealizedPL !== null && (
                    <div className={cn(
                        "p-4 rounded-2xl border flex flex-col items-center justify-center animate-in zoom-in-95",
                        unrealizedPL >= 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"
                    )}>
                        <p className="text-[10px] uppercase font-bold tracking-widest mb-1 opacity-70">Unrealized P&L</p>
                        <p className={cn(
                            "text-2xl font-mono font-bold",
                            unrealizedPL >= 0 ? "text-emerald-500" : "text-red-500"
                        )}>
                            {unrealizedPL >= 0 ? '+' : ''}${unrealizedPL.toFixed(2)}
                        </p>
                    </div>
                )}

                <div className="space-y-2">
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Lot Size</label>
                                <Input 
                                    value={volume} 
                                    onChange={(e) => setVolume(e.target.value)}
                                    className="h-10 bg-black/40 border-white/10 rounded-xl font-mono text-center text-sm"
                                    placeholder="0.10"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase px-1 text-emerald-500">Take Profit</label>
                                <Input 
                                    value={tp} 
                                    onChange={(e) => setTp(e.target.value)}
                                    className="h-10 bg-emerald-500/5 border-emerald-500/20 rounded-xl font-mono text-center text-sm text-emerald-500 placeholder:text-emerald-500/30"
                                    placeholder="Auto TP"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase px-1 text-red-500">Stop Loss</label>
                            <Input 
                                value={sl} 
                                onChange={(e) => setSl(e.target.value)}
                                className="h-10 bg-red-500/5 border-red-500/20 rounded-xl font-mono text-center text-sm text-red-500 placeholder:text-red-500/30"
                                placeholder="Auto SL Level"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                    <Button 
                        onClick={() => handleTrade('buy')}
                        disabled={loading || !price}
                        className="h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20 flex flex-col gap-1"
                    >
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-bold uppercase tracking-widest text-xs">Buy / Long</span>
                    </Button>
                    <Button 
                        onClick={() => handleTrade('sell')}
                        disabled={loading || !price}
                        className="h-16 rounded-2xl bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-900/20 flex flex-col gap-1"
                    >
                        <TrendingDown className="w-5 h-5" />
                        <span className="font-bold uppercase tracking-widest text-xs">Sell / Short</span>
                    </Button>
                </div>

                {openTrade && (
                    <Button 
                        onClick={handleClosePosition}
                        disabled={loading || !price}
                        variant="destructive"
                        className="w-full h-12 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold uppercase tracking-widest text-xs animate-in slide-in-from-bottom-2"
                    >
                        Close Position Now
                    </Button>
                )}

                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-muted-foreground leading-tight">
                        Orders are executed at the current replay price. TP/SL settings can be added in trade details.
                    </p>
                </div>
                
                <Button variant="ghost" size="sm" className="w-full text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground gap-2">
                    <Settings2 className="w-3.5 h-3.5" /> Advanced Settings
                </Button>
            </div>
        </div>
    );
};
