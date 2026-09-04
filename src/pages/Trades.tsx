import React, { useState, useEffect } from "react";
import UserLayout from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRightLeft, Search, Filter, Download, Plus, ArrowUpDown, TrendingUp, TrendingDown, Edit2, Trash2, MoreHorizontal, Eye, Share2 } from "lucide-react";
import { TradeEntryForm } from "@/components/dashboard/TradeEntryForm";
import { ExportDialog } from "@/components/dashboard/ExportDialog";
import { TradeDetail } from "@/components/dashboard/TradeDetail";
import { ShareTradeModal } from "@/components/dashboard/ShareTradeModal";
import { Trade } from "@/types/trade-types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const Trades = () => {
    const [showForm, setShowForm] = useState(false);
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();
    const [symbolFilter, setSymbolFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const { user } = useAuth();
    const [trades, setTrades] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;
    const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
    const [showTradeDetail, setShowTradeDetail] = useState(false);
    const [sharingTrade, setSharingTrade] = useState<any | null>(null);

    // Custom Filter State
    const [minProfit, setMinProfit] = useState<string>("");
    const [maxProfit, setMaxProfit] = useState<string>("");
    const [minVolume, setMinVolume] = useState<string>("");
    const [maxVolume, setMaxVolume] = useState<string>("");

    // Time & Outcome Filter State
    const [timeframe, setTimeframe] = useState<string>("all_time");
    const [customStartDate, setCustomStartDate] = useState<string>("");
    const [customEndDate, setCustomEndDate] = useState<string>("");
    const [outcomeFilter, setOutcomeFilter] = useState<string>("all");

    // Wrap fetchTrades in useCallback to allow passing it to TradeEntryForm
    const fetchTrades = React.useCallback(async () => {
        if (user?.user_id) {
            try {
                const response = await api.get(`/trades/user/${user.user_id}`);
                setTrades(response.data);
            } catch (error) {
                console.error("Error fetching trades:", error);
            }
        }
    }, [user?.user_id]);

    useEffect(() => {
        fetchTrades();
    }, [fetchTrades]);

    // Global + button can fire this event to open the trade form
    useEffect(() => {
        const handler = () => setShowForm(true);
        window.addEventListener("journalx-open-trade-form", handler);
        return () => window.removeEventListener("journalx-open-trade-form", handler);
    }, []);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, symbolFilter, typeFilter]);

    const handlePageChange = (page: number) => {
        console.log("Changing to page:", page);
        setCurrentPage(page);
    };

    // Scroll to top of table when page changes
    useEffect(() => {
        const tableElement = document.getElementById('trades-table-container');
        if (tableElement) {
            const offset = 100; // Adjust for header
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = tableElement.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }, [currentPage]);

    // Sorting state
    const [sortField, setSortField] = useState<string>("trade_no");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    // Handle sort click
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc"); // Default to desc (newest/highest first) for new fields
        }
        setCurrentPage(1); // Reset to first page on sort change
    };

    const handleEdit = (trade: Trade) => {
        setEditingTrade(trade);
        setShowForm(true);
    };

    const handleViewTrade = (trade: Trade) => {
        setSelectedTrade(trade);
        setShowTradeDetail(true);
    };

    const handleDelete = async (tradeNo: number) => {
        if (window.confirm(`Are you sure you want to delete trade #${tradeNo}?`)) {
            try {
                await api.delete(`/trades/trade/${tradeNo}`);
                toast({
                    title: "Trade Deleted",
                    description: `Trade #${tradeNo} has been removed.`,
                });
                fetchTrades();
            } catch (error) {
                console.error("Error deleting trade:", error);
                toast({
                    title: "Error",
                    description: "Failed to delete trade.",
                    variant: "destructive",
                });
            }
        }
    };

    // Filter and Sort trades based on search query, symbol, and type
    const filteredAndSortedTrades = React.useMemo(() => {
        let result = trades.filter((trade) => {
            // Search filter (trade_no, symbol)
            const matchesSearch = searchQuery === "" ||
                trade.trade_no?.toString().includes(searchQuery) ||
                trade.symbol?.toLowerCase().includes(searchQuery.toLowerCase());

            // Symbol filter
            const matchesSymbol = symbolFilter === "all" || trade.symbol === symbolFilter;

            // Type filter
            const matchesType = typeFilter === "all" ||
                trade.type?.toLowerCase() === typeFilter.toLowerCase();

            // Outcome Filter
            if (outcomeFilter === "profit" && (trade.net_profit == null || trade.net_profit < 0)) return false;
            if (outcomeFilter === "loss" && (trade.net_profit == null || trade.net_profit >= 0)) return false;

            // Date Range Timeframe Logic
            if (timeframe !== "all_time") {
                const tradeDate = new Date(trade.open_time);
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                if (timeframe === "today") {
                    if (tradeDate < today) return false;
                } else if (timeframe === "this_week") {
                    const firstDayOfWeek = new Date(today);
                    firstDayOfWeek.setDate(today.getDate() - today.getDay());
                    if (tradeDate < firstDayOfWeek) return false;
                } else if (timeframe === "this_month") {
                    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    if (tradeDate < firstDayOfMonth) return false;
                } else if (timeframe === "last_week") {
                    const lastWeekStart = new Date(today);
                    lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
                    const lastWeekEnd = new Date(today);
                    lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
                    lastWeekEnd.setHours(23, 59, 59, 999);
                    if (tradeDate < lastWeekStart || tradeDate > lastWeekEnd) return false;
                } else if (timeframe === "last_month") {
                    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                    lastMonthEnd.setHours(23, 59, 59, 999);
                    if (tradeDate < lastMonthStart || tradeDate > lastMonthEnd) return false;
                } else if (timeframe === "last_30_days") {
                    const thirtyDaysAgo = new Date(today);
                    thirtyDaysAgo.setDate(today.getDate() - 30);
                    if (tradeDate < thirtyDaysAgo) return false;
                } else if (timeframe === "last_3_months") {
                    const threeMonthsAgo = new Date(today);
                    threeMonthsAgo.setMonth(today.getMonth() - 3);
                    if (tradeDate < threeMonthsAgo) return false;
                } else if (timeframe === "custom") {
                    if (customStartDate) {
                        const startBound = new Date(customStartDate);
                        if (tradeDate < startBound) return false;
                    }
                    if (customEndDate) {
                        const endBound = new Date(customEndDate);
                        endBound.setHours(23, 59, 59, 999);
                        if (tradeDate > endBound) return false;
                    }
                }
            }

            // Custom Profit filter
            let passesProfit = true;
            if (minProfit !== "" && trade.net_profit != null) {
                if (trade.net_profit < parseFloat(minProfit)) passesProfit = false;
            }
            if (maxProfit !== "" && trade.net_profit != null) {
                if (trade.net_profit > parseFloat(maxProfit)) passesProfit = false;
            }

            // Custom Volume filter
            let passesVolume = true;
            if (minVolume !== "" && trade.volume != null) {
                if (trade.volume < parseFloat(minVolume)) passesVolume = false;
            }
            if (maxVolume !== "" && trade.volume != null) {
                if (trade.volume > parseFloat(maxVolume)) passesVolume = false;
            }

            return matchesSearch && matchesSymbol && matchesType && passesProfit && passesVolume;
        });

        // Sort result
        result.sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];

            // Handle specific fields if needed
            if (sortField === "net_profit") valA = a.net_profit ?? 0;
            if (sortField === "net_profit") valB = b.net_profit ?? 0;

            if (valA < valB) return sortDirection === "asc" ? -1 : 1;
            if (valA > valB) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

        return result;
    }, [trades, searchQuery, symbolFilter, typeFilter, sortField, sortDirection, minProfit, maxProfit, minVolume, maxVolume, timeframe, customStartDate, customEndDate, outcomeFilter]);

    // Count active custom filters
    const activeCustomFilters =
        [minProfit, maxProfit, minVolume, maxVolume, customStartDate, customEndDate].filter(val => val !== "").length +
        (timeframe !== "all_time" ? 1 : 0) +
        (outcomeFilter !== "all" ? 1 : 0);

    const resetCustomFilters = () => {
        setMinProfit(""); setMaxProfit(""); setMinVolume(""); setMaxVolume("");
        setTimeframe("all_time"); setCustomStartDate(""); setCustomEndDate(""); setOutcomeFilter("all");
    };

    return (
        <UserLayout>
            <main className="container mx-auto px-4 lg:px-6 pt-0 pb-6">

                {/* Filters */}
                <div className="glass-card-premium p-1 rounded-2xl mb-3 opacity-0 animate-fade-up shadow-md" style={{ animationDelay: "0.1s" }}>
                    <div className="bg-card/40 dark:bg-background/40 backdrop-blur-md rounded-[12px] p-2 flex flex-col lg:flex-row gap-2 border border-border dark:border-white/5">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Input
                                placeholder="Search by trade number, symbol..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 text-xs bg-muted dark:bg-white/5 border-border dark:border-white/10 focus:border-primary/50 transition-all rounded-lg"
                            />
                        </div>
                        <Select value={symbolFilter} onValueChange={setSymbolFilter}>
                            <SelectTrigger className="w-full lg:w-40 h-9 text-xs bg-muted dark:bg-white/5 border-border dark:border-white/10 hover:border-primary/30 transition-colors rounded-lg">
                                <SelectValue placeholder="Symbol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs">All Symbols</SelectItem>
                                {Array.from(new Set(trades.map(t => t.symbol))).filter(Boolean).map((symbol) => (
                                    <SelectItem key={symbol as string} value={symbol as string} className="text-xs">{symbol as string}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full lg:w-32 h-9 text-xs bg-muted dark:bg-white/5 border-border dark:border-white/10 hover:border-primary/30 transition-colors rounded-lg">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs">All Types</SelectItem>
                                <SelectItem value="buy" className="text-xs">BUY</SelectItem>
                                <SelectItem value="sell" className="text-xs">SELL</SelectItem>
                            </SelectContent>
                        </Select>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="gap-2 h-9 text-xs rounded-lg bg-muted dark:bg-white/5 border-border dark:border-white/10 hover:bg-muted/80 dark:hover:bg-white/10 relative cursor-pointer">
                                    <Filter className="w-3.5 h-3.5" />
                                    Filters
                                    {activeCustomFilters > 0 && (
                                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary text-[8px] text-primary-foreground font-bold rounded-full flex items-center justify-center shadow-sm">
                                            {activeCustomFilters}
                                        </span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[340px] lg:w-[380px] p-0 rounded-2xl border border-border/50 dark:border-white/10 shadow-2xl bg-card/95 backdrop-blur-2xl overflow-hidden" align="end">
                                <div className="p-3 border-b border-white/5 flex items-center justify-between bg-white/5">
                                    <h4 className="font-bold text-sm">Advanced Log Filters</h4>
                                    {activeCustomFilters > 0 && (
                                        <Button variant="ghost" size="sm" className="h-6 px-3 text-[9px] bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors rounded-full font-bold uppercase tracking-wider" onClick={resetCustomFilters}>
                                            Reset Filters
                                        </Button>
                                    )}
                                </div>
                                <div className="p-3 space-y-3">
                                    {/* Timeframe Section */}
                                    <div className="space-y-2">
                                        <Label className="text-[9px] text-muted-foreground font-bold tracking-wider uppercase ml-1">Timeframe Range</Label>
                                        <div className="grid grid-cols-4 gap-1.5">
                                            {[
                                                { id: 'all_time', label: 'All Time' },
                                                { id: 'today', label: 'Today' },
                                                { id: 'this_week', label: 'This Week' },
                                                { id: 'this_month', label: 'This Month' },
                                                { id: 'last_week', label: 'Last Week' },
                                                { id: 'last_month', label: 'Last Month' },
                                                { id: 'last_30_days', label: '30 Days' },
                                                { id: 'last_3_months', label: '90 Days' }
                                            ].map(tf => (
                                                <button
                                                    key={tf.id}
                                                    onClick={() => setTimeframe(tf.id)}
                                                    className={cn(
                                                        "text-[9px] font-bold py-1.5 rounded-lg transition-all",
                                                        timeframe === tf.id
                                                            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                                                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                    )}
                                                >
                                                    {tf.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Custom Date Overlay */}
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => setTimeframe("custom")}
                                                className={cn(
                                                    "flex-1 text-[9px] font-bold py-1.5 rounded-lg transition-all uppercase tracking-wider",
                                                    timeframe === "custom"
                                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-dashed border-white/20"
                                                )}
                                            >
                                                Custom Date Range
                                            </button>
                                        </div>

                                        {timeframe === "custom" && (
                                            <div className="flex items-center gap-2 pt-1 animate-fade-in-up">
                                                <div className="flex-1 space-y-1.5">
                                                    <Label className="text-[9px] text-muted-foreground ml-1">Start Date</Label>
                                                    <Input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="h-7 text-[10px] bg-muted/30 focus:border-primary/50" />
                                                </div>
                                                <div className="flex-1 space-y-1.5">
                                                    <Label className="text-[9px] text-muted-foreground ml-1">End Date</Label>
                                                    <Input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="h-7 text-[10px] bg-muted/30 focus:border-primary/50" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-full h-px bg-white/5" />

                                    {/* Outcome Section */}
                                    <div className="space-y-2.5">
                                        <Label className="text-[9px] text-muted-foreground font-bold tracking-wider uppercase ml-1">Trade Outcome</Label>
                                        <div className="flex gap-1.5">
                                            <button onClick={() => setOutcomeFilter("all")} className={cn("flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all border", outcomeFilter === "all" ? "bg-card border-primary/50 text-foreground shadow-sm" : "bg-transparent border-white/5 text-muted-foreground hover:bg-white/5")}>All Outcomes</button>
                                            <button onClick={() => setOutcomeFilter("profit")} className={cn("flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all border", outcomeFilter === "profit" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-sm" : "bg-transparent border-white/5 text-muted-foreground hover:bg-emerald-500/5 hover:text-emerald-500")}>Profitable</button>
                                            <button onClick={() => setOutcomeFilter("loss")} className={cn("flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all border", outcomeFilter === "loss" ? "bg-red-500/10 border-red-500/30 text-red-500 shadow-sm" : "bg-transparent border-white/5 text-muted-foreground hover:bg-red-500/5 hover:text-red-500")}>Losses</button>
                                        </div>
                                    </div>


                                </div>
                            </PopoverContent>
                        </Popover>
                        <Button
                            variant="outline"
                            className="gap-2 h-9 text-xs rounded-lg bg-muted dark:bg-white/5 border-border dark:border-white/10 hover:bg-muted/80 dark:hover:bg-white/10"
                            onClick={() => setShowExportDialog(true)}
                        >
                            <Download className="w-3.5 h-3.5" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Trades Table */}
                <div
                    id="trades-table-container"
                    className="glass-card-premium rounded-2xl overflow-hidden opacity-0 animate-fade-up shadow-2xl border border-border dark:border-white/10 !transform-none bg-card/50 dark:bg-card"
                    style={{ animationDelay: "0.2s" }}
                >
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted dark:bg-black/5 hover:bg-muted dark:hover:bg-black/5 border-b border-border dark:border-white/10">
                                    <TableHead
                                        className="font-semibold text-xs text-muted-foreground whitespace-nowrap py-3 px-4 cursor-pointer hover:bg-muted/50 dark:hover:bg-white/5 transition-colors"
                                        onClick={() => handleSort("trade_no")}
                                    >
                                        <div className="flex items-center gap-1 hover:text-foreground transition-colors">
                                            Trade No <ArrowUpDown className={cn("w-3 h-3", sortField === "trade_no" && "text-primary")} />
                                        </div>
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs py-3 px-4 text-muted-foreground">Symbol</TableHead>
                                    <TableHead className="font-semibold text-xs py-3 px-4 text-muted-foreground">Type</TableHead>
                                    <TableHead className="font-semibold text-xs py-3 px-4 text-muted-foreground">Volume</TableHead>
                                    <TableHead className="font-semibold text-xs py-3 px-4 text-muted-foreground whitespace-nowrap">Entry Price</TableHead>
                                    <TableHead className="font-semibold text-xs py-3 px-4 text-muted-foreground whitespace-nowrap">Exit Price</TableHead>
                                    <TableHead
                                        className="font-semibold text-xs py-3 px-4 text-muted-foreground cursor-pointer hover:bg-muted/50 dark:hover:bg-white/5 transition-colors"
                                        onClick={() => handleSort("net_profit")}
                                    >
                                        <div className="flex items-center gap-1 hover:text-foreground transition-colors">
                                            Net P/L <ArrowUpDown className={cn("w-3 h-3", sortField === "net_profit" && "text-primary")} />
                                        </div>
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs py-3 px-4 text-muted-foreground whitespace-nowrap">Date & Time</TableHead>
                                    <TableHead className="font-semibold text-xs py-3 px-4 text-muted-foreground text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody key={`page-${currentPage}`}>
                                {filteredAndSortedTrades.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-muted dark:bg-white/5 flex items-center justify-center">
                                                    <Search className="w-6 h-6 opacity-50" />
                                                </div>
                                                <p>{trades.length === 0 ? "No manual trades found. Login to MT5 to sync your trades." : "No trades match your filters."}</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAndSortedTrades.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((trade, idx) => (
                                        <TableRow
                                            key={`${trade.trade_no}-${currentPage}`}
                                            className="cursor-pointer hover:bg-muted dark:hover:bg-white/5 transition-colors border-b border-border dark:border-white/5 group"
                                            style={{ animationDelay: `${0.1 + (idx * 0.05)}s` }}
                                            onClick={() => handleViewTrade(trade)}
                                        >
                                            <TableCell className="font-mono text-xs whitespace-nowrap text-muted-foreground group-hover:text-foreground transition-colors py-2 px-4">
                                                #{trade.trade_no}
                                            </TableCell>
                                            <TableCell className="font-bold py-2 px-4 text-xs">
                                                <div className="flex items-center gap-2">
                                                    {trade.symbol?.includes('XAU') ? (
                                                        <img src="/gold.png" alt="Gold" className="w-5 h-5 object-contain shrink-0 drop-shadow-sm" />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-amber-400/90 flex items-center justify-center shrink-0">
                                                            <div className="w-2.5 h-2.5 rounded-full border border-white/40 flex items-center justify-center">
                                                                <span className="text-[5px] font-black text-white/80">{trade.symbol?.charAt(0)}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <span>{trade.symbol}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-2 px-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${trade.type?.toString().toUpperCase().includes("BUY") ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" : "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                                                    }`}>
                                                    {trade.type?.toString().toUpperCase().includes("BUY") ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                    {trade.type}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-medium text-xs text-muted-foreground py-2 px-4">{trade.volume} Lot</TableCell>
                                            <TableCell className="font-mono text-xs tabular-nums text-muted-foreground py-2 px-4">{trade.price_open}</TableCell>
                                            <TableCell className="font-mono text-xs tabular-nums text-muted-foreground py-2 px-4">{trade.price_close}</TableCell>
                                            <TableCell className={`font-bold whitespace-nowrap text-xs tabular-nums py-2 px-4 ${trade.net_profit >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                                {trade.net_profit >= 0 ? "+" : ""}${trade.net_profit?.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-[10px] whitespace-nowrap font-medium py-2 px-4">
                                                {new Date(trade.open_time).toLocaleDateString()}
                                                <span className="ml-1.5 opacity-50">{new Date(trade.open_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </TableCell>
                                            <TableCell className="text-right py-2 px-4">
                                                <div className="flex items-center justify-end gap-1.5">

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-7 h-7 rounded-lg bg-primary/5 border border-primary/10 text-primary hover:bg-primary/20 hover:border-primary/30 transition-all duration-300 shadow-sm"
                                                        title="Edit Trade"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(trade);
                                                        }}
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-7 h-7 rounded-lg bg-blue-500/5 border border-blue-500/10 text-blue-500 hover:bg-blue-500/20 hover:border-blue-500/30 transition-all duration-300 shadow-sm"
                                                        title="Share Trade"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSharingTrade(trade);
                                                        }}
                                                    >
                                                        <Share2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-7 h-7 rounded-lg bg-destructive/5 border border-destructive/10 text-destructive hover:bg-destructive/20 hover:border-destructive/30 transition-all duration-300 shadow-sm"
                                                        title="Delete Trade"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(trade.trade_no);
                                                        }}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    {filteredAndSortedTrades.length > ITEMS_PER_PAGE && (
                        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border dark:border-white/10 bg-muted dark:bg-black/5 relative z-50">
                            <div className="text-sm font-medium text-muted-foreground">
                                Showing <span className="text-foreground font-bold">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to <span className="text-foreground font-bold">{Math.min(filteredAndSortedTrades.length, currentPage * ITEMS_PER_PAGE)}</span> of <span className="text-foreground font-bold">{filteredAndSortedTrades.length}</span> trades
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="bg-muted dark:bg-white/5 border-border dark:border-white/10 text-muted-foreground hover:bg-muted/80 dark:hover:bg-white/10 hover:text-foreground disabled:opacity-50 cursor-pointer"
                                >
                                    ‹ Prev
                                </Button>

                                <div className="hidden sm:flex items-center gap-1">
                                    {Array.from({ length: Math.ceil(filteredAndSortedTrades.length / ITEMS_PER_PAGE) }).map((_, i) => {
                                        const pageNum = i + 1;
                                        const totalPages = Math.ceil(filteredAndSortedTrades.length / ITEMS_PER_PAGE);

                                        // Logic to show only 1, current-1, current, current+1, and last page
                                        if (
                                            pageNum === 1 ||
                                            pageNum === totalPages ||
                                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                        ) {
                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={currentPage === pageNum ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={cn(
                                                        "w-9 h-9 p-0 font-bold transition-all cursor-pointer",
                                                        currentPage === pageNum
                                                            ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20"
                                                            : "bg-muted dark:bg-white/5 border-border dark:border-white/10 text-muted-foreground hover:bg-muted/80 dark:hover:bg-white/10 hover:text-foreground"
                                                    )}
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        }

                                        // Show ellipsis
                                        if (
                                            (pageNum === 2 && currentPage > 3) ||
                                            (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                                        ) {
                                            return <span key={`ellipsis-${pageNum}`} className="text-muted-foreground px-1">...</span>;
                                        }

                                        return null;
                                    })}
                                </div>

                                <div className="sm:hidden font-bold text-sm text-muted-foreground">
                                    Page {currentPage} of {Math.ceil(filteredAndSortedTrades.length / ITEMS_PER_PAGE)}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(Math.min(currentPage + 1, Math.ceil(filteredAndSortedTrades.length / ITEMS_PER_PAGE)))}
                                    disabled={currentPage === Math.ceil(filteredAndSortedTrades.length / ITEMS_PER_PAGE)}
                                    className="bg-muted dark:bg-white/5 border-border dark:border-white/10 text-muted-foreground hover:bg-muted/80 dark:hover:bg-white/10 hover:text-foreground disabled:opacity-50 cursor-pointer"
                                >
                                    Next ›
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <TradeEntryForm
                    open={showForm}
                    onOpenChange={(open) => {
                        setShowForm(open);
                        if (!open) setEditingTrade(null);
                    }}
                    onSuccess={fetchTrades}
                    initialData={editingTrade}
                />
                <ExportDialog
                    open={showExportDialog}
                    onOpenChange={setShowExportDialog}
                    data={filteredAndSortedTrades}
                />
                <TradeDetail
                    trade={selectedTrade}
                    open={showTradeDetail}
                    onOpenChange={setShowTradeDetail}
                />
                {sharingTrade && (
                    <ShareTradeModal
                        trade={sharingTrade}
                        open={!!sharingTrade}
                        onClose={() => setSharingTrade(null)}
                    />
                )}
            </main>
        </UserLayout >
    );
};

export default Trades;
