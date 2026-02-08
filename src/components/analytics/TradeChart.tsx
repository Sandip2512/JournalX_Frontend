import React, { useEffect, useRef, useState } from 'react';
import * as LightweightCharts from 'lightweight-charts';
import api from '@/lib/api';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TradeChartProps {
    symbol: string;
    openTime: string;
    closeTime: string | null;
    openPrice: number;
    closePrice: number | null;
    type: string;
    className?: string;
}

export const TradeChart: React.FC<TradeChartProps> = ({
    symbol,
    openTime,
    closeTime,
    openPrice,
    closePrice,
    type,
    className
}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<LightweightCharts.IChartApi | null>(null);
    const seriesRef = useRef<LightweightCharts.ISeriesApi<"Candlestick"> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedInterval, setSelectedInterval] = useState<string>("1h");

    const intervals = [
        { label: "1m", value: "1m" },
        { label: "5m", value: "5m" },
        { label: "15m", value: "15m" },
        { label: "1h", value: "1h" },
        { label: "4h", value: "4h" },
        { label: "1d", value: "1d" },
    ];

    useEffect(() => {
        // Initial interval determination based on trade duration
        const start = new Date(openTime).getTime();
        const end = closeTime ? new Date(closeTime).getTime() : Date.now();
        const duration = end - start;

        if (duration < 3600000 * 2) setSelectedInterval("1m");
        else if (duration < 3600000 * 24) setSelectedInterval("5m");
        else if (duration < 3600000 * 24 * 7) setSelectedInterval("1h");
        else setSelectedInterval("1d");
    }, [openTime, closeTime]);

    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true);
            setError(null);
            try {
                const start = new Date(openTime).getTime();
                const end = closeTime ? new Date(closeTime).getTime() : Date.now();

                // Calculate interval in milliseconds
                const intervalWeights: Record<string, number> = {
                    "1m": 60 * 1000,
                    "5m": 5 * 60 * 1000,
                    "15m": 15 * 60 * 1000,
                    "1h": 60 * 60 * 1000,
                    "4h": 4 * 60 * 60 * 1000,
                    "1d": 24 * 60 * 60 * 1000,
                };
                const intervalMs = intervalWeights[selectedInterval] || 3600000;

                // Show 100 candles before entry and 20 candles after exit
                const paddedStart = start - (intervalMs * 100);
                const paddedEnd = end + (intervalMs * 20);

                const response = await api.get('/api/market-data/klines', {
                    params: {
                        symbol,
                        interval: selectedInterval,
                        start_time: Math.floor(paddedStart),
                        end_time: Math.floor(paddedEnd),
                        limit: 1000
                    }
                });

                if (!chartContainerRef.current) return;

                // Cleanup previous chart
                if (chartRef.current) {
                    chartRef.current.remove();
                }

                // Create chart
                const chart = LightweightCharts.createChart(chartContainerRef.current, {
                    layout: {
                        background: { type: LightweightCharts.ColorType.Solid, color: 'transparent' },
                        textColor: '#9CA3AF',
                    },
                    grid: {
                        vertLines: { color: 'rgba(75, 85, 99, 0.1)' },
                        horzLines: { color: 'rgba(75, 85, 99, 0.1)' },
                    },
                    width: chartContainerRef.current.clientWidth,
                    height: 350,
                    timeScale: {
                        timeVisible: true,
                        secondsVisible: false,
                        borderColor: 'rgba(75, 85, 99, 0.1)',
                    },
                    rightPriceScale: {
                        borderColor: 'rgba(75, 85, 99, 0.1)',
                    }
                });

                const candlestickSeries = chart.addSeries(LightweightCharts.CandlestickSeries, {
                    upColor: '#10B981',
                    downColor: '#EF4444',
                    borderVisible: false,
                    wickUpColor: '#10B981',
                    wickDownColor: '#EF4444',
                });

                candlestickSeries.setData(response.data);

                // Add Markers for Entry and Exit
                const markers = [];

                markers.push({
                    time: Math.floor(new Date(openTime).getTime() / 1000),
                    position: type.toUpperCase() === 'BUY' ? 'belowBar' : 'aboveBar',
                    color: '#3B82F6',
                    shape: 'arrowUp',
                    text: 'Entry @ ' + openPrice.toFixed(2),
                });

                if (closeTime && closePrice) {
                    markers.push({
                        time: Math.floor(new Date(closeTime).getTime() / 1000),
                        position: type.toUpperCase() === 'BUY' ? 'aboveBar' : 'belowBar',
                        color: type.toUpperCase() === 'BUY' ? (closePrice > openPrice ? '#10B981' : '#EF4444') : (closePrice < openPrice ? '#10B981' : '#EF4444'),
                        shape: 'arrowDown',
                        text: 'Exit @ ' + closePrice.toFixed(2),
                    });
                }

                LightweightCharts.createSeriesMarkers(candlestickSeries, markers as any);

                chartRef.current = chart;
                seriesRef.current = candlestickSeries;
                setLoading(false);

                // Handle Resize
                const handleResize = () => {
                    if (chartContainerRef.current && chartRef.current) {
                        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
                    }
                };
                window.addEventListener('resize', handleResize);
                return () => window.removeEventListener('resize', handleResize);

            } catch (err: any) {
                console.error("Chart Fetch Error:", err);
                setError(err.response?.data?.detail || err.message || "Failed to load market data");
                setLoading(false);
            }
        };

        fetchChartData();

    }, [symbol, openTime, closeTime, openPrice, closePrice, type, selectedInterval]);

    return (
        <div className={cn("relative w-full space-y-4", className)}>
            <div className="flex items-center justify-center gap-1 bg-muted/30 dark:bg-white/5 p-1 rounded-2xl w-fit mx-auto border border-border dark:border-white/5">
                {intervals.map((interval) => (
                    <button
                        key={interval.value}
                        onClick={() => setSelectedInterval(interval.value)}
                        className={cn(
                            "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200",
                            selectedInterval === interval.value
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-white/5"
                        )}
                    >
                        {interval.label}
                    </button>
                ))}
            </div>

            <div className="relative w-full h-[350px]">
                {loading && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-3xl">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Fetching {selectedInterval} Data...</p>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-3xl p-6 text-center">
                        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
                        <p className="text-sm font-bold text-white uppercase mb-2">Error Loading Chart</p>
                        <p className="text-xs text-muted-foreground max-w-xs">{error}</p>
                        <button
                            onClick={() => setSelectedInterval("1h")}
                            className="mt-4 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary text-[10px] font-black uppercase rounded-xl transition-colors"
                        >
                            Try 1H Interval
                        </button>
                    </div>
                )}

                <div ref={chartContainerRef} className="w-full h-full" />
            </div>
        </div>
    );
};
