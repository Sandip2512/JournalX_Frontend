import React, { useState, useEffect } from "react";
import UserLayout from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRightLeft, Search, Filter, Download, Plus, ArrowUpDown, TrendingUp, TrendingDown, Edit2, Trash2, MoreHorizontal, Eye } from "lucide-react";
import { TradeEntryForm } from "@/components/dashboard/TradeEntryForm";
import { ExportDialog } from "@/components/dashboard/ExportDialog";
import { TradeDetail } from "@/components/dashboard/TradeDetail";
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

            return matchesSearch && matchesSymbol && matchesType;
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
    }, [trades, searchQuery, symbolFilter, typeFilter, sortField, sortDirection]);

    return (
        <UserLayout>
            <main className="container mx-auto px-4 lg:px-6 py-12">
                {/* Page Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 opacity-0 animate-fade-up">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <ArrowRightLeft className="w-8 h-8" />
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground to-foreground/70 dark:from-white dark:via-white dark:to-white/70">
                                Trade History
                            </h1>
                        </div>
                        <p className="text-lg text-muted-foreground max-w-2xl">
                            View detailed logs and manage all your historical trading activity.
                        </p>
                    </div>
                    <Button
                        variant="default"
                        size="xl"
                        className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 rounded-full"
                        onClick={() => setShowForm(true)}
                    >
                        <Plus className="w-5 h-5" />
                        <span className="font-semibold">New Trade Entry</span>
                    </Button>
                </div>

                {/* Filters */}
                <div className="glass-card-premium p-1.5 rounded-2xl mb-8 opacity-0 animate-fade-up shadow-xl" style={{ animationDelay: "0.1s" }}>
                    <div className="bg-card/40 dark:bg-background/40 backdrop-blur-md rounded-xl p-4 flex flex-col lg:flex-row gap-4 border border-border dark:border-white/5">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Input
                                placeholder="Search by trade number, symbol..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-muted dark:bg-white/5 border-border dark:border-white/10 focus:border-primary/50 transition-all"
                            />
                        </div>
                        <Select value={symbolFilter} onValueChange={setSymbolFilter}>
                            <SelectTrigger className="w-full lg:w-40 bg-muted dark:bg-white/5 border-border dark:border-white/10 hover:border-primary/30 transition-colors">
                                <SelectValue placeholder="Symbol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Symbols</SelectItem>
                                {Array.from(new Set(trades.map(t => t.symbol))).map((symbol) => (
                                    <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full lg:w-32 bg-muted dark:bg-white/5 border-border dark:border-white/10 hover:border-primary/30 transition-colors">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="buy">BUY</SelectItem>
                                <SelectItem value="sell">SELL</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="gap-2 bg-muted dark:bg-white/5 border-border dark:border-white/10 hover:bg-muted/80 dark:hover:bg-white/10">
                            <Filter className="w-4 h-4" />
                            Filters
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2 bg-muted dark:bg-white/5 border-border dark:border-white/10 hover:bg-muted/80 dark:hover:bg-white/10"
                            onClick={() => setShowExportDialog(true)}
                        >
                            <Download className="w-4 h-4" />
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
                                        className="font-semibold text-muted-foreground whitespace-nowrap py-4 cursor-pointer hover:bg-muted/50 dark:hover:bg-white/5 transition-colors"
                                        onClick={() => handleSort("trade_no")}
                                    >
                                        <div className="flex items-center gap-1 hover:text-foreground transition-colors">
                                            Trade No <ArrowUpDown className={cn("w-3 h-3", sortField === "trade_no" && "text-primary")} />
                                        </div>
                                    </TableHead>
                                    <TableHead className="font-semibold text-muted-foreground">Symbol</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground">Type</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground">Volume</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground whitespace-nowrap">Entry Price</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground whitespace-nowrap">Exit Price</TableHead>
                                    <TableHead
                                        className="font-semibold text-muted-foreground cursor-pointer hover:bg-muted/50 dark:hover:bg-white/5 transition-colors"
                                        onClick={() => handleSort("net_profit")}
                                    >
                                        <div className="flex items-center gap-1 hover:text-foreground transition-colors">
                                            Net P/L <ArrowUpDown className={cn("w-3 h-3", sortField === "net_profit" && "text-primary")} />
                                        </div>
                                    </TableHead>
                                    <TableHead className="font-semibold text-muted-foreground whitespace-nowrap">Date & Time</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground text-right">Actions</TableHead>
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
                                                <p>{trades.length === 0 ? "No trades recorded yet." : "No trades match your filters."}</p>
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
                                            <TableCell className="font-mono text-sm whitespace-nowrap text-muted-foreground group-hover:text-foreground transition-colors">
                                                #{trade.trade_no}
                                            </TableCell>
                                            <TableCell className="font-bold">{trade.symbol}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm ${trade.type?.toString().toUpperCase().includes("BUY") ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" : "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                                                    }`}>
                                                    {trade.type?.toString().toUpperCase().includes("BUY") ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                    {trade.type}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-medium text-muted-foreground">{trade.volume} Lot</TableCell>
                                            <TableCell className="font-mono text-sm tabular-nums text-muted-foreground">{trade.price_open}</TableCell>
                                            <TableCell className="font-mono text-sm tabular-nums text-muted-foreground">{trade.price_close}</TableCell>
                                            <TableCell className={`font-bold whitespace-nowrap tabular-nums ${trade.net_profit >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                                {trade.net_profit >= 0 ? "+" : ""}${trade.net_profit?.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs whitespace-nowrap font-medium">
                                                {new Date(trade.open_time).toLocaleDateString()}
                                                <span className="ml-2 opacity-50">{new Date(trade.open_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-9 h-9 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all duration-300 shadow-sm"
                                                        title="View Trade Details"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewTrade(trade);
                                                        }}
                                                    >
                                                        <Eye className="w-4.5 h-4.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-9 h-9 rounded-xl bg-primary/5 border border-primary/10 text-primary hover:bg-primary/20 hover:border-primary/30 transition-all duration-300 shadow-sm"
                                                        title="Edit Trade"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(trade);
                                                        }}
                                                    >
                                                        <Edit2 className="w-4.5 h-4.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-9 h-9 rounded-xl bg-destructive/5 border border-destructive/10 text-destructive hover:bg-destructive/20 hover:border-destructive/30 transition-all duration-300 shadow-sm"
                                                        title="Delete Trade"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(trade.trade_no);
                                                        }}
                                                    >
                                                        <Trash2 className="w-4.5 h-4.5" />
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
            </main>
        </UserLayout>
    );
};

export default Trades;
