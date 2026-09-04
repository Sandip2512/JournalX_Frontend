import { Trade } from "@/types/trade-types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Target, Shield, Calendar, DollarSign, Brain, Heart, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from "recharts";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

interface TradeDetailProps {
    trade: Trade | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TradeDetail({ trade, open, onOpenChange }: TradeDetailProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [showChart, setShowChart] = useState(false);

    // Reset chart visibility when modal closes
    useEffect(() => {
        if (!open) {
            setShowChart(false);
        }
    }, [open]);

    if (!trade) return null;

    const isBuy = trade.type?.toUpperCase().includes("BUY");
    const isProfit = trade.net_profit >= 0;

    // Theme-aware colors
    const gridColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
    const axisColor = isDark ? "#9CA3AF" : "#6B7280";
    const textColor = isDark ? "#E5E7EB" : "#374151";

    // Use solid dark background for better contrast in dark mode
    const bgGradient = isDark
        ? "bg-[#09090b] border-white/10"
        : "bg-white border-black/5";

    const legendBg = isDark ? "bg-[#18181b]" : "bg-gray-50";
    const borderColor = isDark ? "border-white/10" : "border-black/5";

    // Generate chart data
    const generateChartData = () => {
        const openTime = new Date(trade.open_time).getTime();
        const closeTime = new Date(trade.close_time).getTime();
        const entryPrice = trade.price_open;
        const exitPrice = trade.price_close;

        const priceRange = Math.abs(exitPrice - entryPrice);
        const volatility = priceRange * 0.3;

        const data = [];
        const numPoints = 50;
        const timeStep = Math.max((closeTime - openTime) / numPoints, 60000); // At least 1 minute

        for (let i = 0; i <= numPoints; i++) {
            const time = openTime + i * timeStep;
            const progress = i / numPoints;

            const basePrice = entryPrice + (exitPrice - entryPrice) * progress;
            const noise = (Math.random() - 0.5) * volatility;
            const price = basePrice + noise;

            data.push({
                time: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                price: parseFloat(price.toFixed(5)),
                entry: entryPrice,
                exit: exitPrice,
                tp: trade.take_profit || null,
                sl: trade.stop_loss || null,
            });
        }

        return data;
    };

    const chartData = generateChartData();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Trade #{trade.trade_no} - {trade.symbol}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Trade Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass-card-premium p-4 space-y-2 border border-border dark:border-white/5">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                {isBuy ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                Type
                            </div>
                            <Badge className={cn(
                                "text-sm font-bold",
                                isBuy ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                            )}>
                                {trade.type}
                            </Badge>
                        </div>

                        <div className="glass-card-premium p-4 space-y-2 border border-border dark:border-white/5">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <DollarSign className="w-4 h-4" />
                                Net P/L
                            </div>
                            <div className={cn(
                                "text-2xl font-bold tabular-nums",
                                isProfit ? "text-emerald-500" : "text-red-500"
                            )}>
                                {isProfit ? "+" : ""}${trade.net_profit?.toFixed(2)}
                            </div>
                        </div>

                        <div className="glass-card-premium p-4 space-y-2 border border-border dark:border-white/5">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Calendar className="w-4 h-4" />
                                Duration
                            </div>
                            <div className="text-lg font-semibold text-foreground dark:text-white">
                                {(() => {
                                    const duration = new Date(trade.close_time).getTime() - new Date(trade.open_time).getTime();
                                    const hours = Math.floor(duration / (1000 * 60 * 60));
                                    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
                                    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                                })()}
                            </div>
                        </div>

                        <div className="glass-card-premium p-4 space-y-2 border border-border dark:border-white/5">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Target className="w-4 h-4" />
                                Volume
                            </div>
                            <div className="text-lg font-semibold text-foreground dark:text-white">
                                {trade.volume} Lot
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="glass-card p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                                Trade Visualization
                            </h3>
                            {!showChart && (
                                <Button
                                    onClick={() => setShowChart(true)}
                                    className="gap-2"
                                    variant="outline"
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    View Chart
                                </Button>
                            )}
                        </div>

                        {showChart ? (
                            <>
                                <div className={cn("w-full h-[450px] rounded-xl overflow-hidden p-6 border shadow-inner", bgGradient)}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={chartData}>
                                            <defs>
                                                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                                                    <stop offset="50%" stopColor="#10b981" stopOpacity={0.2} />
                                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                                                </linearGradient>
                                                <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                                                    <stop offset="50%" stopColor="#ef4444" stopOpacity={0.2} />
                                                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
                                                </linearGradient>
                                            </defs>

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke={gridColor}
                                                vertical={false}
                                            />

                                            <XAxis
                                                dataKey="time"
                                                stroke={axisColor}
                                                tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
                                                axisLine={{ stroke: gridColor }}
                                                tickLine={false}
                                            />

                                            <YAxis
                                                stroke={axisColor}
                                                tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
                                                axisLine={{ stroke: gridColor }}
                                                tickLine={false}
                                                domain={['dataMin - 10', 'dataMax + 10']}
                                                tickFormatter={(value) => `$${value.toFixed(2)}`}
                                            />

                                            <Tooltip
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload;
                                                        return (
                                                            <div className="glass-card p-4 border border-white/10 shadow-2xl">
                                                                <div className="space-y-2">
                                                                    <div className="text-xs text-muted-foreground font-medium">{data.time}</div>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={cn(
                                                                            "w-2 h-2 rounded-full",
                                                                            isProfit ? "bg-emerald-500" : "bg-red-500"
                                                                        )} />
                                                                        <span className="text-sm font-bold text-foreground">
                                                                            ${data.price.toFixed(5)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />

                                            <Area
                                                type="monotone"
                                                dataKey="price"
                                                fill={isProfit ? "url(#profitGradient)" : "url(#lossGradient)"}
                                                stroke={isProfit ? "#10b981" : "#ef4444"}
                                                strokeWidth={3}
                                                dot={false}
                                                animationDuration={1500}
                                                animationEasing="ease-in-out"
                                            />

                                            <ReferenceLine
                                                y={trade.price_open}
                                                stroke="#3b82f6"
                                                strokeWidth={2.5}
                                                label={{
                                                    value: `Entry: $${trade.price_open}`,
                                                    fill: '#3b82f6',
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    position: 'insideTopLeft'
                                                }}
                                            />

                                            <ReferenceLine
                                                y={trade.price_close}
                                                stroke={isProfit ? "#10b981" : "#ef4444"}
                                                strokeWidth={2.5}
                                                label={{
                                                    value: `Exit: $${trade.price_close}`,
                                                    fill: isProfit ? "#10b981" : "#ef4444",
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    position: 'insideBottomLeft'
                                                }}
                                            />

                                            {trade.take_profit > 0 && (
                                                <ReferenceLine
                                                    y={trade.take_profit}
                                                    stroke="#22c55e"
                                                    strokeWidth={2}
                                                    strokeDasharray="8 4"
                                                    label={{
                                                        value: `TP: $${trade.take_profit}`,
                                                        fill: '#22c55e',
                                                        fontSize: 11,
                                                        fontWeight: 600,
                                                        position: 'insideTopRight'
                                                    }}
                                                />
                                            )}

                                            {trade.stop_loss > 0 && (
                                                <ReferenceLine
                                                    y={trade.stop_loss}
                                                    stroke="#f59e0b"
                                                    strokeWidth={2}
                                                    strokeDasharray="8 4"
                                                    label={{
                                                        value: `SL: $${trade.stop_loss}`,
                                                        fill: '#f59e0b',
                                                        fontSize: 11,
                                                        fontWeight: 600,
                                                        position: 'insideBottomRight'
                                                    }}
                                                />
                                            )}
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className={cn("flex flex-wrap gap-4 text-sm rounded-lg p-4 border", legendBg, borderColor)}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-1 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" />
                                        <span className="text-muted-foreground font-medium">Entry: <span className="text-foreground font-bold">${trade.price_open}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-4 h-1 rounded-full shadow-lg",
                                            isProfit ? "bg-emerald-500 shadow-emerald-500/50" : "bg-red-500 shadow-red-500/50"
                                        )} />
                                        <span className="text-muted-foreground font-medium">Exit: <span className={cn("font-bold", isProfit ? "text-emerald-500" : "text-red-500")}>${trade.price_close}</span></span>
                                    </div>
                                    {trade.take_profit > 0 && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-1 bg-green-500 rounded-full shadow-lg shadow-green-500/50" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #22c55e 0, #22c55e 4px, transparent 4px, transparent 8px)' }} />
                                            <span className="text-muted-foreground font-medium">TP: <span className="text-green-500 font-bold">${trade.take_profit}</span></span>
                                        </div>
                                    )}
                                    {trade.stop_loss > 0 && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-1 bg-amber-500 rounded-full shadow-lg shadow-amber-500/50" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b 0, #f59e0b 4px, transparent 4px, transparent 8px)' }} />
                                            <span className="text-muted-foreground font-medium">SL: <span className="text-amber-500 font-bold">${trade.stop_loss}</span></span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className={cn("w-full h-[200px] rounded-xl border flex items-center justify-center", bgGradient, borderColor)}>
                                <div className="text-center space-y-3">
                                    <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground/50" />
                                    <p className="text-muted-foreground text-sm">Click "View Chart" to visualize this trade</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Trade Details */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="glass-card-premium p-6 space-y-3 border border-border dark:border-white/5">
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground dark:text-white">
                                <Brain className="w-5 h-5 text-primary" />
                                Trade Reason
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {trade.reason || "No reason provided"}
                            </p>
                        </div>

                        <div className="glass-card-premium p-6 space-y-3 border border-border dark:border-white/5">
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground dark:text-white">
                                <Shield className="w-5 h-5 text-amber-500" />
                                Mistakes
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {trade.mistake?.split(", ").map((mistake, idx) => (
                                    <Badge key={idx} variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                        {mistake}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Psychology & Strategy */}
                    {(trade.emotion || trade.strategy || trade.session) && (
                        <div className="glass-card-premium p-6 space-y-4 border border-border dark:border-white/5">
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground dark:text-white">
                                <Heart className="w-5 h-5 text-pink-500" />
                                Psychology & Context
                            </h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                {trade.emotion && (
                                    <div className="space-y-2">
                                        <div className="text-sm text-muted-foreground">Emotion</div>
                                        <Badge variant="secondary">{trade.emotion}</Badge>
                                    </div>
                                )}
                                {trade.strategy && (
                                    <div className="space-y-2">
                                        <div className="text-sm text-muted-foreground">Strategy</div>
                                        <Badge variant="secondary">{trade.strategy}</Badge>
                                    </div>
                                )}
                                {trade.session && (
                                    <div className="space-y-2">
                                        <div className="text-sm text-muted-foreground">Session</div>
                                        <Badge variant="secondary">{trade.session}</Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="glass-card-premium p-6 border border-border dark:border-white/5">
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <div className="text-muted-foreground">Open Time</div>
                                <div className="font-semibold text-foreground dark:text-white">
                                    {new Date(trade.open_time).toLocaleString()}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-muted-foreground">Close Time</div>
                                <div className="font-semibold text-foreground dark:text-white">
                                    {new Date(trade.close_time).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
