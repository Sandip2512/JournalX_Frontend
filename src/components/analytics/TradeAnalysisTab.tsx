import React from "react";
import { TradeSidebar } from "./TradeSidebar";
import { TradeDetailView } from "./TradeDetailView";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

export function TradeAnalysisTab() {
    const { user } = useAuth();
    const [trades, setTrades] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedTradeNo, setSelectedTradeNo] = React.useState<number | null>(null);

    React.useEffect(() => {
        const fetchTrades = async () => {
            if (!user?.user_id) return;
            try {
                const res = await api.get(`/trades/user/${user.user_id}?limit=1000&sort=desc`);
                const items = Array.isArray(res.data) ? res.data : (res.data.items || []);
                setTrades(items);
                if (items.length > 0 && !selectedTradeNo) {
                    setSelectedTradeNo(items[0].trade_no);
                }
            } catch (error) {
                console.error("Error fetching trades for analysis:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrades();
    }, [user?.user_id]);

    const selectedTrade = React.useMemo(() => {
        return trades.find(t => t.trade_no === selectedTradeNo) || null;
    }, [trades, selectedTradeNo]);

    const handleUpdateTrade = (updatedTrade: any) => {
        setTrades(prev => prev.map(t => t.trade_no === updatedTrade.trade_no ? updatedTrade : t));
    };

    if (loading) {
        return (
            <div className="h-[700px] glass-card-premium rounded-3xl border border-white/5 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Loading Analysis data...</p>
            </div>
        );
    }

    return (
        <div className="h-[800px] glass-card-premium rounded-3xl border border-white/5 flex overflow-hidden">
            <TradeSidebar
                trades={trades}
                selectedTradeNo={selectedTradeNo}
                onSelectTrade={setSelectedTradeNo}
                className="w-1/3 lg:w-1/4 flex-shrink-0"
            />
            <TradeDetailView
                trade={selectedTrade}
                onUpdate={handleUpdateTrade}
                className="flex-1"
            />
        </div>
    );
}
