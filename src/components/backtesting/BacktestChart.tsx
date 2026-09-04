import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as LightweightCharts from 'lightweight-charts';
import api from '@/lib/api';
import { 
    Play, Pause, FastForward, RotateCcw, 
    Settings, Clock, CalendarDays,
    ChevronDown, Zap, AlertCircle, Loader2,
    MousePointer2, TrendingUp as Trendline, Square, Type, 
    ShoppingCart, Bookmark, Trash2
} from "lucide-react";
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

interface BacktestChartProps {
    session: any;
    trades: any[];
    onTradeSuccess: () => void;
}

export const BacktestChart: React.FC<BacktestChartProps> = ({
    session,
    trades,
    onTradeSuccess
}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<LightweightCharts.IChartApi | null>(null);
    const seriesRef = useRef<LightweightCharts.ISeriesApi<"Candlestick"> | null>(null);
    const ema20Ref = useRef<LightweightCharts.ISeriesApi<"Line"> | null>(null);
    const ema50Ref = useRef<LightweightCharts.ISeriesApi<"Line"> | null>(null);
    const lastPriceLineRef = useRef<LightweightCharts.IPriceLine | null>(null);
    
    const [fullData, setFullData] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [intervalMs, setIntervalMs] = useState(1000);
    const [currentTimeframe, setCurrentTimeframe] = useState(session.timeframe);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTool, setActiveTool] = useState<string>("cursor"); // "cursor", "trendline", "rectangle"
    const [drawings, setDrawings] = useState<any[]>([]);
    const { toast } = useToast();

    const timerRef = useRef<any>(null);
    const countdownRef = useRef<any>(null);
    const priceLinesRef = useRef<{ entry?: any, tp?: any, sl?: any }>({});
    const dragInfoRef = useRef<{ type: 'entry' | 'tp' | 'sl', line: any } | null>(null);
    const drawingSeriesRef = useRef<any[]>([]);
    const pendingDrawingRef = useRef<any>(null);

    const timeframes = ["1m", "5m", "15m", "1H", "4H", "1D"];
    const timeToMs = (tf: string) => {
        const value = parseInt(tf);
        const unit = tf.slice(-1).toLowerCase();
        switch (unit) {
            case 'm': return value * 60 * 1000;
            case 'h': return value * 60 * 60 * 1000;
            case 'd': return value * 24 * 60 * 60 * 1000;
            default: return 60 * 1000;
        }
    };

    const [speedPreset, setSpeedPreset] = useState<string>("Fast");
    const speedPresets = [
        { label: "Real Time", value: timeToMs(currentTimeframe), id: 'realtime' },
        { label: "Fast", value: 1000, id: 'fast' },
        { label: "2x Fast", value: 500, id: '2x' },
        { label: "5x Fast", value: 200, id: '5x' },
        { label: "10x Fast", value: 50, id: '10x' },
        { label: "Turbo", value: 10, id: 'turbo' },
    ];

    // Replay logic
    useEffect(() => {
        if (isPlaying) {
            timerRef.current = setInterval(() => {
                setCurrentIndex(prev => {
                    if (prev < fullData.length - 1) {
                        return prev + 1;
                    }
                    setIsPlaying(false);
                    return prev;
                });
            }, intervalMs);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isPlaying, intervalMs, fullData]);
    // Update interval if Real Time is selected and timeframe changes
    useEffect(() => {
        if (speedPreset === 'Real Time') {
            setIntervalMs(timeToMs(currentTimeframe));
        }
    }, [currentTimeframe, speedPreset]);

    // Helper to calculate EMA
    const calculateEMA = (data: any[], period: number) => {
        if (data.length === 0) return [];
        const k = 2 / (period + 1);
        let emaData = [];
        let ema = data[0].close;
        for (let i = 0; i < data.length; i++) {
            ema = data[i].close * k + ema * (1 - k);
            emaData.push({ time: data[i].time, value: ema });
        }
        return emaData;
    };

    // Update chart when currentIndex changes
    useEffect(() => {
        if (seriesRef.current && fullData.length > 0) {
            const visibleData = fullData.slice(0, currentIndex + 1);
            seriesRef.current.setData(visibleData);
            
            // Update EMAs
            if (ema20Ref.current) {
                const ema20Data = calculateEMA(visibleData, 20);
                ema20Ref.current.setData(ema20Data);
            }
            if (ema50Ref.current) {
                const ema50Data = calculateEMA(visibleData, 50);
                ema50Ref.current.setData(ema50Data);
            }

            const currentCandle = fullData[currentIndex];
            if (currentCandle) {
                const price = currentCandle.close;
                
                // Update Last Price Line
                if (lastPriceLineRef.current) {
                    seriesRef.current.removePriceLine(lastPriceLineRef.current);
                }
                lastPriceLineRef.current = seriesRef.current.createPriceLine({
                    price: price,
                    color: '#2962FF',
                    lineWidth: 1,
                    lineStyle: LightweightCharts.LineStyle.Dashed,
                    axisLabelVisible: true,
                    title: 'Last',
                });

                (window as any).__BT_CURRENT_PRICE = price;
                (window as any).__BT_CURRENT_TIME = new Date(currentCandle.time * 1000).toISOString();
                window.dispatchEvent(new CustomEvent('bt-tick'));

                // Auto-close check for TP/SL
                const openTrade = trades.find(t => t.status === 'open');
                if (openTrade) {
                    const type = openTrade.trade_type.toLowerCase();
                    const isTP = openTrade.tp_price && (
                        type === 'buy' ? price >= openTrade.tp_price : price <= openTrade.tp_price
                    );
                    const isSL = openTrade.sl_price && (
                        type === 'buy' ? price <= openTrade.sl_price : price >= openTrade.sl_price
                    );

                    if (isTP || isSL) {
                        setIsPlaying(false);
                        api.patch(`/api/backtest/trades/${openTrade._id}`, {
                            status: 'closed',
                            exit_price: price,
                            exit_time: new Date(currentCandle.time * 1000).toISOString()
                        }).then(() => {
                            onTradeSuccess();
                            toast({
                                title: isTP ? "Take Profit Hit!" : "Stop Loss Hit!",
                                description: `Closed ${type.toUpperCase()} position at ${price}`,
                                variant: isTP ? "default" : "destructive"
                            });
                        });
                    }
                }
            }
        }
    }, [currentIndex, fullData, trades]);

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const start = new Date(session.start_date).getTime();
            const end = new Date(session.end_date).getTime();

            const response = await api.get('/api/market-data/klines', {
                params: {
                    symbol: session.pairs[0],
                    interval: currentTimeframe,
                    start_time: start,
                    end_time: end,
                    limit: 2000 
                }
            });

            if (response.data.length === 0) {
                throw new Error("No market data found for this range.");
            }

            setFullData(response.data);
            setCurrentIndex(Math.min(50, response.data.length - 1));
            setLoading(false);
        } catch (err: any) {
            console.error("Backtest Chart Fetch Error:", err);
            setError(err.message || "Failed to load historical data");
            setLoading(false);
        }
    }, [session, currentTimeframe]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    useEffect(() => {
        if (!chartContainerRef.current || fullData.length === 0) return;

        if (chartRef.current) {
            chartRef.current.remove();
        }

        const chart = LightweightCharts.createChart(chartContainerRef.current, {
            layout: {
                background: { type: LightweightCharts.ColorType.Solid, color: '#131722' },
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0.5)', style: LightweightCharts.LineStyle.SparseDotted },
                horzLines: { color: 'rgba(42, 46, 57, 0.5)', style: LightweightCharts.LineStyle.SparseDotted },
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
                vertLine: {
                    width: 1,
                    color: '#758696',
                    style: LightweightCharts.LineStyle.Dashed,
                    labelBackgroundColor: '#131722',
                },
                horzLine: {
                    width: 1,
                    color: '#758696',
                    style: LightweightCharts.LineStyle.Dashed,
                    labelBackgroundColor: '#131722',
                },
            },
            width: chartContainerRef.current.clientWidth,
            height: 500,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: 'rgba(42, 46, 57, 0.5)',
            },
        });

        // Use applyOptions for watermark to avoid potential type issues in some versions
        chart.applyOptions({
            watermark: {
                visible: true,
                fontSize: 48,
                horzAlign: 'center',
                vertAlign: 'center',
                color: 'rgba(255, 255, 255, 0.05)',
                text: session.pairs[0] || 'JOURNALX',
            },
        } as any);

        const candlestickSeries = chart.addSeries(LightweightCharts.CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
            lastValueVisible: true,
            priceLineVisible: false, // We'll manage our own last price line
        });

        const ema20 = chart.addSeries(LightweightCharts.LineSeries, {
            color: '#2962FF',
            lineWidth: 2,
            title: 'EMA 20',
            lastValueVisible: false,
            priceLineVisible: false,
        });

        const ema50 = chart.addSeries(LightweightCharts.LineSeries, {
            color: '#FF9800',
            lineWidth: 2,
            title: 'EMA 50',
            lastValueVisible: false,
            priceLineVisible: false,
        });

        seriesRef.current = candlestickSeries;
        ema20Ref.current = ema20;
        ema50Ref.current = ema50;
        chartRef.current = chart;

        const markers = trades.map(t => ({
            time: Math.floor(new Date(t.entry_time).getTime() / 1000),
            position: t.trade_type === 'buy' ? 'belowBar' : 'aboveBar',
            color: t.trade_type === 'buy' ? '#3B82F6' : '#F97316',
            shape: t.trade_type === 'buy' ? 'arrowUp' : 'arrowDown',
            text: `ENTRY ${t.trade_type.toUpperCase()} @ ${t.entry_price}`,
        }));
        
        trades.filter(t => t.status === 'closed' && t.exit_time).forEach(t => {
             markers.push({
                time: Math.floor(new Date(t.exit_time).getTime() / 1000),
                position: t.trade_type === 'buy' ? 'aboveBar' : 'belowBar',
                color: (t.profit_loss >= 0) ? '#10B981' : '#EF4444',
                shape: t.trade_type === 'buy' ? 'arrowDown' : 'arrowUp',
                text: `EXIT ${t.trade_type.toUpperCase()} @ ${t.exit_price}`,
            } as any);
        });

        LightweightCharts.createSeriesMarkers(candlestickSeries, markers as any);

        // Manage Price Lines
        const activeTrade = trades.find(t => t.status === 'open');
        
        // Cleanup existing lines
        Object.values(priceLinesRef.current).forEach(line => {
            if (line) candlestickSeries.removePriceLine(line);
        });
        priceLinesRef.current = {};

        if (activeTrade) {
            // Entry Line
            priceLinesRef.current.entry = candlestickSeries.createPriceLine({
                price: activeTrade.entry_price,
                color: '#3B82F6',
                lineWidth: 1,
                lineStyle: LightweightCharts.LineStyle.Dashed,
                axisLabelVisible: true,
                title: 'ENTRY',
            });

            // TP Line
            if (activeTrade.tp_price) {
                priceLinesRef.current.tp = candlestickSeries.createPriceLine({
                    price: activeTrade.tp_price,
                    color: '#10B981',
                    lineWidth: 1,
                    lineStyle: LightweightCharts.LineStyle.Dashed,
                    axisLabelVisible: true,
                    title: 'TP',
                });
            }

            // SL Line
            if (activeTrade.sl_price) {
                priceLinesRef.current.sl = candlestickSeries.createPriceLine({
                    price: activeTrade.sl_price,
                    color: '#EF4444',
                    lineWidth: 1,
                    lineStyle: LightweightCharts.LineStyle.Dashed,
                    axisLabelVisible: true,
                    title: 'SL',
                });
            }
        }

        // Manage Drawings
        drawingSeriesRef.current.forEach(s => chart.removeSeries(s));
        drawingSeriesRef.current = [];

        drawings.forEach(d => {
            if (d.type === 'trendline') {
                const s = chart.addSeries(LightweightCharts.LineSeries, {
                    color: '#3B82F6',
                    lineWidth: 2,
                    lineType: LightweightCharts.LineType.Simple,
                });
                s.setData(d.points);
                drawingSeriesRef.current.push(s);
            } else if (d.type === 'rectangle') {
                const s = chart.addSeries(LightweightCharts.AreaSeries, {
                    topColor: 'rgba(59, 130, 246, 0.2)',
                    bottomColor: 'rgba(59, 130, 246, 0.2)',
                    lineColor: '#3B82F6',
                    lineWidth: 1,
                });
                s.setData(d.points);
                drawingSeriesRef.current.push(s);
            }
        });

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);
        
        // Drawing Click Handler
        const handleChartClick = (param: any) => {
            if (!param.point || activeTool === 'cursor') return;

            const time = param.time;
            const price = candlestickSeries.coordinateToPrice(param.point.y);
            if (time === undefined || price === null) return;

            if (!pendingDrawingRef.current) {
                // Start drawing
                pendingDrawingRef.current = { type: activeTool, start: { time, price } };
                toast({ title: "Drawing started", description: "Click again to finish the drawing." });
            } else {
                // Finish drawing
                const newDrawing = {
                    id: Date.now(),
                    type: pendingDrawingRef.current.type,
                    points: [
                        pendingDrawingRef.current.start,
                        { time, price }
                    ]
                };
                
                // If rectangle, we need to create a boxed area
                if (newDrawing.type === 'rectangle') {
                    const t1 = Math.min(pendingDrawingRef.current.start.time, time);
                    const t2 = Math.max(pendingDrawingRef.current.start.time, time);
                    const p1 = Math.min(pendingDrawingRef.current.start.price, price);
                    const p2 = Math.max(pendingDrawingRef.current.start.price, price);
                    
                    // Simple representation for now: fill between t1 and t2 at constant level p1/p2
                    // Real rectangles in LW-charts are complex, but AreaSeries works for simple zones
                    newDrawing.points = [
                        { time: t1, value: p1 },
                        { time: t1, value: p2 },
                        { time: t2, value: p2 },
                        { time: t2, value: p1 },
                    ] as any;
                } else {
                    newDrawing.points = [
                        { time: pendingDrawingRef.current.start.time, value: pendingDrawingRef.current.start.price },
                        { time, value: price }
                    ];
                }

                setDrawings(prev => [...prev, newDrawing]);
                pendingDrawingRef.current = null;
                setActiveTool('cursor');
            }
        };

        chart.subscribeClick(handleChartClick);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.unsubscribeClick(handleChartClick);
        };
    }, [fullData.length, trades.length, drawings, activeTool]);

    const updateTradePrice = async (type: 'entry' | 'tp' | 'sl', price: number) => {
        const activeTrade = trades.find(t => t.status === 'open');
        if (!activeTrade) return;

        const payload: any = {};
        if (type === 'entry') payload.entry_price = price;
        else if (type === 'tp') payload.tp_price = price;
        else if (type === 'sl') payload.sl_price = price;

        try {
            await api.patch(`/api/backtest/trades/${activeTrade._id}`, payload);
            onTradeSuccess();
        } catch (error) {
            console.error("Error updating price:", error);
        }
    };

    // Interaction Effect for Draggable Lines
    useEffect(() => {
        const container = chartContainerRef.current;
        if (!container || !chartRef.current || !seriesRef.current) return;

        const handleMouseDown = (e: MouseEvent) => {
            const series = seriesRef.current;
            const chart = chartRef.current;
            if (!series || !chart) return;
            
            const rect = container.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const price = series.coordinateToPrice(y);
            if (price === null) return;

            const threshold = 15; // pixels
            let closest: { type: 'entry' | 'tp' | 'sl', line: any, dist: number } | null = null;

            Object.entries(priceLinesRef.current).forEach(([type, line]) => {
                const linePrice = line.options().price;
                const lineY = series.priceToCoordinate(linePrice);
                if (lineY !== null) {
                    const dist = Math.abs(lineY - y);
                    if (dist < threshold && (!closest || dist < closest.dist)) {
                        closest = { type: type as any, line, dist };
                    }
                }
            });

            if (closest) {
                dragInfoRef.current = closest;
                container.style.cursor = 'ns-resize';
                e.stopPropagation();
                e.preventDefault();
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!dragInfoRef.current || !seriesRef.current) return;

            const rect = container.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const price = seriesRef.current.coordinateToPrice(y);
            if (price !== null) {
                dragInfoRef.current.line.applyOptions({ price });
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (!dragInfoRef.current || !seriesRef.current) return;

            const rect = container.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const price = seriesRef.current.coordinateToPrice(y);
            
            if (price !== null) {
                updateTradePrice(dragInfoRef.current.type, price);
            }

            dragInfoRef.current = null;
            container.style.cursor = 'default';
        };

        container.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            container.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [trades, onTradeSuccess]);

    return (
        <div className="relative w-full h-full flex flex-row bg-[#131722]">
            {/* TradingView Drawing Toolbar (Left) */}
            <div className="w-14 border-r border-white/5 flex flex-col items-center py-6 gap-3 z-40 bg-[#1e222d]/50 backdrop-blur-sm shadow-2xl">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                        "w-10 h-10 rounded-xl transition-all duration-200", 
                        activeTool === 'cursor' ? "text-primary bg-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "text-white/40 hover:text-white hover:bg-white/5"
                    )}
                    onClick={() => setActiveTool('cursor')}
                >
                    <MousePointer2 className="w-5 h-5" />
                </Button>
                <div className="w-6 h-[1px] bg-white/5 mx-auto my-1" />
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                        "w-10 h-10 rounded-xl transition-all duration-200", 
                        activeTool === 'trendline' ? "text-primary bg-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "text-white/40 hover:text-white hover:bg-white/5"
                    )}
                    onClick={() => setActiveTool('trendline')}
                >
                    <Trendline className="w-5 h-5" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                        "w-10 h-10 rounded-xl transition-all duration-200", 
                        activeTool === 'rectangle' ? "text-primary bg-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "text-white/40 hover:text-white hover:bg-white/5"
                    )}
                    onClick={() => setActiveTool('rectangle')}
                >
                    <Square className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
                    <Type className="w-5 h-5" />
                </Button>
                <div className="flex-1" />
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-10 h-10 rounded-xl text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all mb-2" 
                    onClick={() => setDrawings([])}
                >
                    <Trash2 className="w-5 h-5" />
                </Button>
            </div>

            <div className="relative flex-1 flex flex-col">
                {/* Visual Chart Header (Symbol, Timeframe, Buttons) */}
                <div className="absolute top-4 left-4 right-4 z-30 flex items-start justify-between pointer-events-none">
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <div className="flex items-center bg-[#1e222d] border border-white/10 rounded-lg overflow-hidden shadow-2xl">
                            <Button 
                                variant="ghost" 
                                className="h-10 px-4 gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 font-black border-r border-white/10 rounded-none italic"
                                onClick={() => window.dispatchEvent(new CustomEvent('bt-request-trade', { detail: 'sell' }))}
                            >
                                SELL
                            </Button>
                            <div className="px-3 py-1 text-[10px] font-mono font-bold text-white/70">
                                {fullData[currentIndex]?.close || "---"}
                            </div>
                            <Button 
                                variant="ghost" 
                                className="h-10 px-4 gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 font-black border-l border-white/10 rounded-none italic"
                                onClick={() => window.dispatchEvent(new CustomEvent('bt-request-trade', { detail: 'buy' }))}
                            >
                                BUY
                            </Button>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-10 px-3 bg-[#1e222d] border border-white/10 rounded-lg hover:bg-white/5 text-white gap-2 font-bold text-xs">
                                    <Clock className="w-3.5 h-3.5 text-primary" />
                                    {currentTimeframe}
                                    <ChevronDown className="w-3 h-3 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#1e222d] border-white/10 shadow-2xl">
                                {timeframes.map((tf) => (
                                    <DropdownMenuItem 
                                        key={tf} 
                                        onClick={() => setCurrentTimeframe(tf)}
                                        className="text-xs text-white focus:bg-primary/20"
                                    >
                                        {tf}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="pointer-events-auto">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10 bg-[#1e222d] border border-white/10 rounded-lg hover:bg-white/5 text-white">
                                    <Zap className={cn("w-4 h-4", speedPreset === 'Real Time' ? "text-blue-400" : "text-amber-500")} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#1e222d] border-white/10">
                                {speedPresets.map((s) => (
                                    <DropdownMenuItem 
                                        key={s.label} 
                                        onClick={() => {
                                            setIntervalMs(s.value);
                                            setSpeedPreset(s.label);
                                        }}
                                        className={cn("text-xs text-white focus:bg-primary/20", intervalMs === s.value && "bg-primary/20 text-primary font-bold")}
                                    >
                                        {s.label} {s.label === 'Real Time' && `(${currentTimeframe})`}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div ref={chartContainerRef} className="flex-1 w-full" />

                {/* Bottom Navigation / Replay Controls */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 bg-[#1e222d] border border-white/10 p-1 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md pointer-events-auto">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                        onClick={() => setCurrentIndex(0)}
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                    <div className="w-[1px] h-4 bg-white/10 mx-1" />
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                            "h-10 w-10 rounded-full transition-all duration-300",
                            isPlaying ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(59,130,246,0.5)]" : "bg-white/5 text-white hover:bg-white/10"
                        )}
                        onClick={() => setIsPlaying(!isPlaying)}
                    >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </Button>
                    <div className="w-[1px] h-4 bg-white/10 mx-1" />
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                        onClick={() => {
                            if (currentIndex < fullData.length - 1) setCurrentIndex(prev => prev + 1);
                        }}
                    >
                        <FastForward className="w-4 h-4" />
                    </Button>
                </div>
                
                {loading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#131722]/80 backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
};
