import { useState } from "react";
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
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TradeEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
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
const predefinedMistakes = [
  "No Mistake",
  "Overtrading",
  "No Risk Management",
  "No Stop-Loss",
  "Revenge Trading",
  "FOMO",
  "Letting Losses Run",
  "No Trading Plan",
  "Custom" // Option to enter custom mistake
];

export function TradeEntryForm({ open, onOpenChange, onSuccess }: TradeEntryFormProps) {
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
    open_time: "",
    close_time: "",
    strategy: "",
    session: "",
    emotion: "",
  });

  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [rrRatio, setRrRatio] = useState<string | null>(null);

  const [selectedMistake, setSelectedMistake] = useState("No Mistake");
  const [customMistake, setCustomMistake] = useState("");
  const [symbolOpen, setSymbolOpen] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

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
        mistake: formData.mistake,
        open_time: formData.open_time ? new Date(formData.open_time).toISOString() : new Date().toISOString(),
        close_time: formData.close_time ? new Date(formData.close_time).toISOString() : new Date().toISOString(),
        strategy: formData.strategy,
        session: formData.session,
        emotion: formData.emotion,
      };

      await api.post("/trades", payload);

      toast({
        title: "Trade Added",
        description: `Trade for ${formData.symbol} has been recorded.`,
      });

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
        open_time: "",
        close_time: "",
        strategy: "",
        session: "",
        emotion: "",
      });
      setShowMoreOptions(false);
      setRrRatio(null);
      setSelectedMistake("No Mistake");
      setCustomMistake("");
      setSymbolOpen(false);

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
            New Trade Entry
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
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
                  className="bg-muted/50 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Trade Notes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Trade Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Why did you take this trade?"
                  value={formData.reason}
                  onChange={(e) => handleChange("reason", e.target.value)}
                  className="bg-muted/50 min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mistake" className="text-warning">Mistake (if any)</Label>
                <Select value={selectedMistake} onValueChange={handleMistakeChange}>
                  <SelectTrigger className="bg-muted/50 border-warning/30 focus:border-warning">
                    <SelectValue placeholder="Select mistake" />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedMistakes.map((mistake) => (
                      <SelectItem key={mistake} value={mistake}>{mistake}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedMistake === "Custom" && (
                  <Textarea
                    id="custom-mistake"
                    placeholder="Describe your custom mistake..."
                    value={customMistake}
                    onChange={(e) => handleCustomMistakeChange(e.target.value)}
                    className="bg-muted/50 min-h-[100px] border-warning/30 focus:border-warning mt-2"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <div className="border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="w-full flex items-center justify-between text-muted-foreground hover:text-foreground"
            >
              <span className="font-semibold uppercase tracking-wider text-sm">More Options (Strategy, Session, Mood)</span>
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
