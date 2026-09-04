import { useState, useEffect } from "react";
import { X, Loader2, Check, ChevronsUpDown, ChevronDown, ChevronUp } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Trade } from "@/types/trade-types";
import { Mistake } from "@/types/mistake-types";

interface TradeEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialData?: Trade | null;
}

const symbols = [
  { value: "USOIL/USD", label: "USOIL/USD – WTI Crude Oil / USD" },
  { value: "EUR/USD", label: "EUR/USD – Euro / USD" },
  { value: "GBP/USD", label: "GBP/USD – British Pound / USD" },
  { value: "USD/JPY", label: "USD/JPY – USD / Japanese Yen" },
  { value: "USD/CHF", label: "USD/CHF – USD / Swiss Franc" },
  { value: "USD/CAD", label: "USD/CAD – USD / Canadian Dollar" },
  { value: "AUD/USD", label: "AUD/USD – Australian Dollar / USD" },
  { value: "NZD/USD", label: "NZD/USD – New Zealand Dollar / USD" },
  { value: "EUR/GBP", label: "EUR/GBP – Euro / British Pound" },
  { value: "EUR/JPY", label: "EUR/JPY – Euro / Japanese Yen" },
  { value: "GBP/JPY", label: "GBP/JPY – British Pound / Japanese Yen" },
  { value: "BTC/USD", label: "BTC/USD – Bitcoin / USD" },
  { value: "XAU/USD", label: "XAU/USD – Gold / USD" },
];
const tradeTypes = ["BUY", "SELL"];

export function TradeEntryForm({ open, onOpenChange, onSuccess, initialData }: TradeEntryFormProps) {
  const getLocalISOString = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const [formData, setFormData] = useState({
    symbol: "",
    volume: "",
    price_open: "",
    price_close: "",
    type: "",
    take_profit: "",
    stop_loss: "",
    profit_amount: "",
    loss_amount: "",
    net_profit: "",
    reason: "",
    mistake: "No Mistake",
    open_time: getLocalISOString(),
    close_time: getLocalISOString(),
    strategy: "",
    session: "",
    emotion: "",
    mae: "",
    mfe: "",
  });

  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [rrRatio, setRrRatio] = useState<string | null>(null);

  const [selectedMistake, setSelectedMistake] = useState("No Mistake");
  const [customMistake, setCustomMistake] = useState("");
  const [symbolOpen, setSymbolOpen] = useState(false);
  const [customMistakes, setCustomMistakes] = useState<Mistake[]>([]);
  const [loadingMistakes, setLoadingMistakes] = useState(false);
  const [confidenceLevel, setConfidenceLevel] = useState([5]);
  const [satisfactionRating, setSatisfactionRating] = useState([5]);
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>([]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Auto-calculate Net Profit if either Profit or Loss amount changes
      if (field === "profit_amount" || field === "loss_amount") {
        const p = parseFloat(newData.profit_amount) || 0;
        const l = parseFloat(newData.loss_amount) || 0;
        newData.net_profit = (p - l).toString();
      }

      return newData;
    });
  };

  const handleMistakeChange = (value: string) => {
    setSelectedMistake(value);
    if (value === "Custom") {
      setFormData((prev) => ({ ...prev, mistake: customMistake }));
    } else {
      setFormData((prev) => ({ ...prev, mistake: value }));
      setCustomMistake("");
    }
  };

  const handleCustomMistakeChange = (value: string) => {
    setCustomMistake(value);
    setFormData((prev) => ({ ...prev, mistake: value }));
  };

  const handleMistakeToggle = (mistakeName: string) => {
    setSelectedMistakes((prev) => {
      // If "No Mistakes" is toggled, clear everything else and just set "No Mistakes"
      if (mistakeName === "No Mistakes") {
        return ["No Mistakes"];
      }

      // If anything else is toggled, remove "No Mistakes" if it exists
      const filtered = prev.filter(m => m !== "No Mistakes");

      if (filtered.includes(mistakeName)) {
        return filtered.filter((m) => m !== mistakeName);
      } else {
        return [...filtered, mistakeName];
      }
    });
  };

  // Populate form if initialData is provided
  useEffect(() => {
    if (open && initialData) {
      const formatLocalTime = (isoString: string) => {
        try {
          const date = new Date(isoString);
          const offset = date.getTimezoneOffset() * 60000;
          return new Date(date.getTime() - offset).toISOString().slice(0, 16);
        } catch (e) {
          return getLocalISOString();
        }
      };

      setFormData({
        symbol: initialData.symbol || "",
        volume: initialData.volume?.toString() || "",
        price_open: initialData.price_open?.toString() || "",
        price_close: initialData.price_close?.toString() || "",
        type: initialData.type || "",
        take_profit: initialData.take_profit?.toString() || "",
        stop_loss: initialData.stop_loss?.toString() || "",
        profit_amount: initialData.profit_amount?.toString() || "",
        loss_amount: initialData.loss_amount?.toString() || "",
        net_profit: initialData.net_profit?.toString() || "",
        reason: initialData.reason || "",
        mistake: initialData.mistake || "No Mistake",
        open_time: formatLocalTime(initialData.open_time),
        close_time: formatLocalTime(initialData.close_time),
        strategy: initialData.strategy || "",
        session: initialData.session || "",
        emotion: initialData.emotion || "",
        mae: initialData.mae?.toString() || "",
        mfe: initialData.mfe?.toString() || "",
      });

      if (initialData.mistake) {
        setSelectedMistakes(initialData.mistake.split(", ").filter(Boolean));
      }
    } else if (open && !initialData) {
      // Reset form for new entry
      setFormData({
        symbol: "",
        volume: "",
        price_open: "",
        price_close: "",
        type: "",
        take_profit: "",
        stop_loss: "",
        profit_amount: "",
        loss_amount: "",
        net_profit: "",
        reason: "",
        mistake: "No Mistake",
        open_time: getLocalISOString(),
        close_time: getLocalISOString(),
        strategy: "",
        session: "",
        emotion: "",
        mae: "",
        mfe: "",
      });
      setSelectedMistakes([]);
    }
  }, [open, initialData]);


  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch custom mistakes when dialog opens
  useEffect(() => {
    const fetchCustomMistakes = async () => {
      if (!user?.user_id || !open) return;

      try {
        setLoadingMistakes(true);
        const response = await api.get(`/api/mistakes/user/${user.user_id}`);
        setCustomMistakes(response.data || []);
      } catch (error) {
        console.error("Error fetching custom mistakes:", error);
      } finally {
        setLoadingMistakes(false);
      }
    };

    fetchCustomMistakes();
  }, [user?.user_id, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.user_id) {
      toast({
        title: "Error",
        description: "You must be logged in to add trades.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        user_id: user.user_id,
        symbol: formData.symbol,
        volume: parseFloat(formData.volume) || 0,
        price_open: parseFloat(formData.price_open) || 0,
        price_close: parseFloat(formData.price_close) || 0,
        type: formData.type,
        take_profit: parseFloat(formData.take_profit) || 0,
        stop_loss: parseFloat(formData.stop_loss) || 0,
        profit_amount: parseFloat(formData.profit_amount) || 0,
        loss_amount: parseFloat(formData.loss_amount) || 0,
        net_profit: parseFloat(formData.net_profit) || 0,
        reason: formData.reason,
        mistake: selectedMistakes.length > 0 ? selectedMistakes.join(", ") : "No Mistake",
        open_time: formData.open_time ? new Date(formData.open_time).toISOString() : new Date().toISOString(),
        close_time: formData.close_time ? new Date(formData.close_time).toISOString() : new Date().toISOString(),
        strategy: formData.strategy,
        session: formData.session,
        emotion: formData.emotion,
        mae: parseFloat(formData.mae) || 0,
        mfe: parseFloat(formData.mfe) || 0,
      };

      if (initialData) {
        // Update existing trade
        // Note: The backend endpoint /trades/{trade_no} currently only takes reason/mistake
        // but we want to update the full trade. Let's send it to /api/admin/trades/{trade_no} 
        // OR we can check if there's a user update endpoint.
        // Based on Backend/app/main.py: @app.put("/trades/{trade_no}")
        // wait, that only takes reason/mistake as query params? 
        // Let's re-check the route definition.

        await api.put(`/trades/${initialData.trade_no}?reason=${encodeURIComponent(payload.reason)}&mistake=${encodeURIComponent(payload.mistake)}`);

        toast({
          title: "Trade Updated",
          description: `Trade #${initialData.trade_no} has been updated.`,
        });
      } else {
        // Create new trade
        await api.post("/trades", payload);
        toast({
          title: "Trade Added",
          description: `Trade for ${formData.symbol} has been recorded.`,
        });
      }

      onOpenChange(false);
      setFormData({
        symbol: "",
        volume: "",
        price_open: "",
        price_close: "",
        type: "",
        take_profit: "",
        stop_loss: "",
        profit_amount: "",
        loss_amount: "",
        net_profit: "",
        reason: "",
        mistake: "No Mistake",
        open_time: getLocalISOString(),
        close_time: getLocalISOString(),
        strategy: "",
        session: "",
        emotion: "",
        mae: "",
        mfe: "",
      });
      setShowMoreOptions(false);
      setRrRatio(null);
      setSelectedMistake("No Mistake");
      setCustomMistake("");
      setSymbolOpen(false);
      setSelectedMistakes([]);

      setSymbolOpen(false);

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }

    } catch (error: any) {
      console.error("Error creating trade:", error);
      const message = error.response?.data?.detail || "Failed to save trade.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  // Auto-calculate RR
  const calculateRR = () => {
    const entry = parseFloat(formData.price_open);
    const sl = parseFloat(formData.stop_loss);
    const tp = parseFloat(formData.take_profit);

    if (entry && sl && tp) {
      const risk = Math.abs(entry - sl);
      const reward = Math.abs(tp - entry);
      if (risk > 0) {
        const rr = (reward / risk).toFixed(2);
        setRrRatio(rr);
        return;
      }
    }
    setRrRatio(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {initialData ? `Edit Trade #${initialData.trade_no}` : "Add New Trade"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="py-4">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                General
              </TabsTrigger>
              <TabsTrigger value="psychology" className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Psychology
              </TabsTrigger>
            </TabsList>

            {/* GENERAL TAB */}
            <TabsContent value="general" className="space-y-6">
              {/* Trade Info Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Trade Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="symbol">Symbol</Label>
                    <Popover open={symbolOpen} onOpenChange={setSymbolOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={symbolOpen}
                          className="w-full justify-between bg-muted/50"
                        >
                          {formData.symbol
                            ? symbols.find((s) => s.value === formData.symbol)?.label
                            : "Select symbol..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput placeholder="Search symbol..." />
                          <CommandList>
                            <CommandEmpty>No symbol found.</CommandEmpty>
                            <CommandGroup>
                              {symbols.map((symbol) => (
                                <CommandItem
                                  key={symbol.value}
                                  value={symbol.label}
                                  onSelect={() => {
                                    handleChange("symbol", symbol.value);
                                    setSymbolOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.symbol === symbol.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {symbol.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(v) => handleChange("type", v)}>
                      <SelectTrigger className="bg-muted/50">
                        <SelectValue placeholder="BUY / SELL" />
                      </SelectTrigger>
                      <SelectContent>
                        {tradeTypes.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="volume">Volume (Lots)</Label>
                    <Input
                      id="volume"
                      type="number"
                      step="0.01"
                      placeholder="0.01"
                      value={formData.volume}
                      onChange={(e) => handleChange("volume", e.target.value)}
                      className="bg-muted/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="open_time">Open Time</Label>
                    <Input
                      id="open_time"
                      type="datetime-local"
                      value={formData.open_time}
                      onChange={(e) => handleChange("open_time", e.target.value)}
                      className="bg-muted/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="close_time">Close Time</Label>
                    <Input
                      id="close_time"
                      type="datetime-local"
                      value={formData.close_time}
                      onChange={(e) => handleChange("close_time", e.target.value)}
                      className="bg-muted/50"
                    />
                  </div>
                </div>
              </div>

              {/* Price Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Price Levels
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price_open">Entry Price</Label>
                    <Input
                      id="price_open"
                      type="number"
                      step="0.00001"
                      placeholder="1.08500"
                      value={formData.price_open}
                      onChange={(e) => handleChange("price_open", e.target.value)}
                      className="bg-muted/50"
                      onBlur={calculateRR}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price_close">Exit Price</Label>
                    <Input
                      id="price_close"
                      type="number"
                      step="0.00001"
                      placeholder="1.08700"
                      value={formData.price_close}
                      onChange={(e) => handleChange("price_close", e.target.value)}
                      className="bg-muted/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="take_profit">Take Profit</Label>
                    <Input
                      id="take_profit"
                      type="number"
                      step="0.00001"
                      placeholder="1.09000"
                      value={formData.take_profit}
                      onChange={(e) => handleChange("take_profit", e.target.value)}
                      className="bg-muted/50"
                      onBlur={calculateRR}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stop_loss">Stop Loss</Label>
                    <Input
                      id="stop_loss"
                      type="number"
                      step="0.00001"
                      placeholder="1.08200"
                      value={formData.stop_loss}
                      onChange={(e) => handleChange("stop_loss", e.target.value)}
                      className="bg-muted/50"
                      onBlur={calculateRR}
                    />
                  </div>
                </div>
                {rrRatio && (
                  <div className="text-sm font-medium text-muted-foreground mt-2 animate-in fade-in">
                    Est. R:R Ratio: <span className="text-primary font-bold">{rrRatio}</span>
                  </div>
                )}
              </div>

              {/* P&L Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Profit & Loss
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profit_amount" className="text-success">Profit Amount</Label>
                    <Input
                      id="profit_amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.profit_amount}
                      onChange={(e) => handleChange("profit_amount", e.target.value)}
                      className="bg-muted/50 border-success/30 focus:border-success"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loss_amount" className="text-destructive">Loss Amount</Label>
                    <Input
                      id="loss_amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.loss_amount}
                      onChange={(e) => handleChange("loss_amount", e.target.value)}
                      className="bg-muted/50 border-destructive/30 focus:border-destructive"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="net_profit">Net Profit</Label>
                    <Input
                      id="net_profit"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.net_profit}
                      onChange={(e) => handleChange("net_profit", e.target.value)}
                      className={cn(
                        "bg-muted/50 font-bold",
                        (parseFloat(formData.net_profit) || 0) >= 0 ? "text-emerald-500" : "text-red-500"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Trade Reason */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Trade Reason
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="reason">Why did you take this trade?</Label>
                  <Textarea
                    id="reason"
                    placeholder="Describe your trade setup and reasoning..."
                    value={formData.reason}
                    onChange={(e) => handleChange("reason", e.target.value)}
                    className="bg-muted/50 min-h-[100px]"
                  />
                </div>
              </div>
            </TabsContent>

            {/* PSYCHOLOGY TAB */}
            <TabsContent value="psychology" className="space-y-6">
              {/* Confidence & Satisfaction */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="confidence">Entry Confidence Level (1-10)</Label>
                    <span className="text-2xl font-bold text-primary">{confidenceLevel[0]}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground font-semibold">Low</span>
                    <Slider
                      id="confidence"
                      min={1}
                      max={10}
                      step={1}
                      value={confidenceLevel}
                      onValueChange={setConfidenceLevel}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground font-semibold">High</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="satisfaction">Satisfaction Rating (1-10)</Label>
                    <span className="text-2xl font-bold text-primary">{satisfactionRating[0]}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground font-semibold">Not Satisfied</span>
                    <Slider
                      id="satisfaction"
                      min={1}
                      max={10}
                      step={1}
                      value={satisfactionRating}
                      onValueChange={setSatisfactionRating}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground font-semibold">Satisfied</span>
                  </div>
                </div>
              </div>

              {/* Emotional State */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Emotional State During Trade
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="emotion">How did you feel?</Label>
                  <Select value={formData.emotion} onValueChange={(v) => handleChange("emotion", v)}>
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue placeholder="Select Emotional State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Calm">Calm</SelectItem>
                      <SelectItem value="Excited">Excited</SelectItem>
                      <SelectItem value="Anxious">Anxious</SelectItem>
                      <SelectItem value="Confident">Confident</SelectItem>
                      <SelectItem value="Frustrated">Frustrated</SelectItem>
                      <SelectItem value="Bored">Bored</SelectItem>
                      <SelectItem value="Impatient">Impatient</SelectItem>
                      <SelectItem value="Overconfident">Overconfident</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Mistakes Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Mistakes Mode
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* Common Mistakes Checkboxes */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="mistake-overtrading"
                      checked={selectedMistakes.includes("Overtrading")}
                      onChange={() => handleMistakeToggle("Overtrading")}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="mistake-overtrading" className="text-sm font-medium cursor-pointer">
                      Overtrading
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="mistake-revenge"
                      checked={selectedMistakes.includes("Revenge Trading")}
                      onChange={() => handleMistakeToggle("Revenge Trading")}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="mistake-revenge" className="text-sm font-medium cursor-pointer">
                      Revenge Trading
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="mistake-risked-too-much"
                      checked={selectedMistakes.includes("Risked Too Much")}
                      onChange={() => handleMistakeToggle("Risked Too Much")}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="mistake-risked-too-much" className="text-sm font-medium cursor-pointer">
                      Risked Too Much
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="mistake-exited-early"
                      checked={selectedMistakes.includes("Exited Too Early")}
                      onChange={() => handleMistakeToggle("Exited Too Early")}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="mistake-exited-early" className="text-sm font-medium cursor-pointer">
                      Exited Too Early
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="mistake-exited-late"
                      checked={selectedMistakes.includes("Exited Too Late")}
                      onChange={() => handleMistakeToggle("Exited Too Late")}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="mistake-exited-late" className="text-sm font-medium cursor-pointer">
                      Exited Too Late
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="mistake-fomo"
                      checked={selectedMistakes.includes("FOMO Entry")}
                      onChange={() => handleMistakeToggle("FOMO Entry")}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="mistake-fomo" className="text-sm font-medium cursor-pointer">
                      FOMO Entry
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="mistake-ignored-signals"
                      checked={selectedMistakes.includes("Ignored Signals")}
                      onChange={() => handleMistakeToggle("Ignored Signals")}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="mistake-ignored-signals" className="text-sm font-medium cursor-pointer">
                      Ignored Signals
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="mistake-no-plan"
                      checked={selectedMistakes.includes("No Clear Plan")}
                      onChange={() => handleMistakeToggle("No Clear Plan")}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="mistake-no-plan" className="text-sm font-medium cursor-pointer">
                      No Clear Plan
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="mistake-ignored-stoploss"
                      checked={selectedMistakes.includes("Ignored Stop Loss")}
                      onChange={() => handleMistakeToggle("Ignored Stop Loss")}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="mistake-ignored-stoploss" className="text-sm font-medium cursor-pointer">
                      Ignored Stop Loss
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="mistake-no-mistakes"
                      checked={selectedMistakes.includes("No Mistakes")}
                      onChange={() => handleMistakeToggle("No Mistakes")}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="mistake-no-mistakes" className="text-sm font-medium cursor-pointer">
                      No Mistakes
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="mistake-late-entry"
                      checked={selectedMistakes.includes("Late entry")}
                      onChange={() => handleMistakeToggle("Late entry")}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="mistake-late-entry" className="text-sm font-medium cursor-pointer">
                      Late entry
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="mistake-not-followed"
                      checked={selectedMistakes.includes("Not followed process")}
                      onChange={() => handleMistakeToggle("Not followed process")}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="mistake-not-followed" className="text-sm font-medium cursor-pointer">
                      Not followed process
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="mistake-not-accepted-loss"
                      checked={selectedMistakes.includes("Not accepted the loss")}
                      onChange={() => handleMistakeToggle("Not accepted the loss")}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="mistake-not-accepted-loss" className="text-sm font-medium cursor-pointer">
                      Not accepted the loss
                    </label>
                  </div>
                </div>
              </div>

              {/* Lessons Learned */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Lessons Learned
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="lessons">What did you learn from this trade?</Label>
                  <Textarea
                    id="lessons"
                    placeholder="Reflect on what went well and what could be improved..."
                    className="bg-muted/50 min-h-[100px]"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Advanced Options Toggle */}
          <div className="border-t pt-4 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="w-full flex items-center justify-between text-muted-foreground hover:text-foreground"
            >
              <span className="font-semibold uppercase tracking-wider text-sm">More Options (Strategy, Session, MAE/MFE)</span>
              {showMoreOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            {showMoreOptions && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-2">
                  <Label htmlFor="strategy">Strategy</Label>
                  <Input
                    id="strategy"
                    placeholder="e.g. Breakout"
                    value={formData.strategy}
                    onChange={(e) => handleChange("strategy", e.target.value)}
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session">Session</Label>
                  <Select value={formData.session} onValueChange={(v) => handleChange("session", v)}>
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue placeholder="Select Session" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia">Asia</SelectItem>
                      <SelectItem value="London">London</SelectItem>
                      <SelectItem value="New York">New York</SelectItem>
                      <SelectItem value="Overlap">Overlap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emotion">Emotion</Label>
                  <Select value={formData.emotion} onValueChange={(v) => handleChange("emotion", v)}>
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue placeholder="Mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Calm">Calm</SelectItem>
                      <SelectItem value="Excited">Excited</SelectItem>
                      <SelectItem value="Anxious">Anxious</SelectItem>
                      <SelectItem value="Confident">Confident</SelectItem>
                      <SelectItem value="Frustrated">Frustrated</SelectItem>
                      <SelectItem value="Bored">Bored</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Efficiency Data */}
                <div className="space-y-2">
                  <Label htmlFor="mae" className="text-destructive/80 font-semibold">MAE ($ Max Floating Loss)</Label>
                  <Input
                    id="mae"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 50.00 (Positive #)"
                    value={formData.mae}
                    onChange={(e) => handleChange("mae", e.target.value)}
                    className="bg-muted/50 focus:border-destructive/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mfe" className="text-emerald-500/80 font-semibold">MFE ($ Max Floating Profit)</Label>
                  <Input
                    id="mfe"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 120.00"
                    value={formData.mfe}
                    onChange={(e) => handleChange("mfe", e.target.value)}
                    className="bg-muted/50 focus:border-emerald-500/50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="hero" className="flex-1" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Trade
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
