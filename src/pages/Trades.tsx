import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRightLeft, Search, Filter, Download, Plus, ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
import { TradeEntryForm } from "@/components/dashboard/TradeEntryForm";
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
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const Trades = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [symbolFilter, setSymbolFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const { user } = useAuth();
  const [trades, setTrades] = useState<any[]>([]);

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

  // Sorting state
  const [sortField, setSortField] = useState<string>("trade_no");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Handle sort click
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc"); // Default to desc (newest/highest first) for new fields
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 aurora-bg pointer-events-none" />
      <div className="absolute inset-0 bg-grid-white/5 pointer-events-none" />

      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 lg:px-6 py-12">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 opacity-0 animate-fade-up">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <ArrowRightLeft className="w-8 h-8" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
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
            <div className="bg-background/40 backdrop-blur-md rounded-xl p-4 flex flex-col lg:flex-row gap-4 border border-white/5">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <Input
                  placeholder="Search by trade number, symbol..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 transition-all"
                />
              </div>
              <Select value={symbolFilter} onValueChange={setSymbolFilter}>
                <SelectTrigger className="w-full lg:w-40 bg-white/5 border-white/10 hover:border-primary/30 transition-colors">
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
                <SelectTrigger className="w-full lg:w-32 bg-white/5 border-white/10 hover:border-primary/30 transition-colors">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="buy">BUY</SelectItem>
                  <SelectItem value="sell">SELL</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2 bg-white/5 border-white/10 hover:bg-white/10">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <Button variant="outline" className="gap-2 bg-white/5 border-white/10 hover:bg-white/10">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Trades Table */}
          <div className="glass-card-premium rounded-2xl overflow-hidden opacity-0 animate-fade-up shadow-2xl border border-white/10" style={{ animationDelay: "0.2s" }}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black/5 hover:bg-black/5 border-b border-white/10">
                    <TableHead
                      className="font-semibold text-muted-foreground whitespace-nowrap py-4 cursor-pointer hover:bg-white/5 transition-colors"
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
                      className="font-semibold text-muted-foreground cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => handleSort("net_profit")}
                    >
                      <div className="flex items-center gap-1 hover:text-foreground transition-colors">
                        Net P/L <ArrowUpDown className={cn("w-3 h-3", sortField === "net_profit" && "text-primary")} />
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-muted-foreground whitespace-nowrap">Date & Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedTrades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                            <Search className="w-6 h-6 opacity-50" />
                          </div>
                          <p>{trades.length === 0 ? "No trades recorded yet." : "No trades match your filters."}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedTrades.map((trade, idx) => (
                      <TableRow
                        key={trade.trade_no}
                        className="cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5 group"
                        style={{ animationDelay: `${0.1 + (idx * 0.05)}s` }}
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

          </div>

          <TradeEntryForm open={showForm} onOpenChange={setShowForm} onSuccess={fetchTrades} />
        </main>
      </div>
    </div>
  );
};

export default Trades;
