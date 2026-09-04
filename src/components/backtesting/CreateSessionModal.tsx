import React, { useState } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Sparkles, Zap } from "lucide-react";

interface CreateSessionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (newSession: any) => void;
}

export const CreateSessionModal = ({ open, onOpenChange, onSuccess }: CreateSessionModalProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        strategy_name: "",
        pairs: "BTCUSDT",
        timeframe: "15m",
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        starting_balance: "10000",
        mode: "tv_sync",
        tv_email: ""
    });


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.user_id) return;

        try {
            setLoading(true);
            const payload = {
                ...formData,
                pairs: formData.pairs.split(',').map(p => p.trim()),
                starting_balance: parseFloat(formData.starting_balance),
                start_date: new Date(formData.start_date).toISOString(),
                end_date: new Date(formData.end_date).toISOString(),
            };

            const response = await api.post(`/api/backtest/sessions?user_id=${user.user_id}`, payload);
            
            toast({
                title: "Session Created",
                description: "Your backtesting session is ready.",
            });
            
            onSuccess(response.data);
            onOpenChange(false);
        } catch (error) {
            console.error("Error creating session:", error);
            toast({
                title: "Error",
                description: "Failed to create session.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px] bg-card border-card-border shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Plus className="w-4 h-4 text-primary" />
                        New Backtest Session
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="strategy_name" className="text-xs font-semibold text-muted-foreground">Strategy Name</Label>
                            <Input 
                                id="strategy_name"
                                placeholder="SMC, EMA Cross, etc." 
                                value={formData.strategy_name}
                                onChange={e => setFormData({...formData, strategy_name: e.target.value})}
                                className="bg-muted/50 border-white/5 h-9 text-sm"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="pairs" className="text-xs font-semibold text-muted-foreground">Trading Pair(s)</Label>
                                <Input 
                                    id="pairs"
                                    placeholder="BTCUSDT" 
                                    value={formData.pairs}
                                    onChange={e => setFormData({...formData, pairs: e.target.value})}
                                    className="bg-muted/50 border-white/5 h-9 text-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="timeframe" className="text-xs font-semibold text-muted-foreground">Timeframe</Label>
                                <Select 
                                    value={formData.timeframe} 
                                    onValueChange={v => setFormData({...formData, timeframe: v})}
                                >
                                    <SelectTrigger className="bg-muted/50 border-white/5 h-9 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["1m", "5m", "15m", "1h", "4h", "1d"].map(tf => (
                                            <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="start_date" className="text-xs font-semibold text-muted-foreground">Start Date</Label>
                                <Input 
                                    id="start_date"
                                    type="date"
                                    value={formData.start_date}
                                    onChange={e => setFormData({...formData, start_date: e.target.value})}
                                    className="bg-muted/50 border-white/5 h-9 text-xs"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="end_date" className="text-xs font-semibold text-muted-foreground">End Date</Label>
                                <Input 
                                    id="end_date"
                                    type="date"
                                    value={formData.end_date}
                                    onChange={e => setFormData({...formData, end_date: e.target.value})}
                                    className="bg-muted/50 border-white/5 h-9 text-xs"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="starting_balance" className="text-xs font-semibold text-muted-foreground">Capital ($)</Label>
                                <Input 
                                    id="starting_balance"
                                    type="number"
                                    value={formData.starting_balance}
                                    onChange={e => setFormData({...formData, starting_balance: e.target.value})}
                                    className="bg-muted/50 border-white/5 font-mono h-9 text-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground">Mode</Label>
                                <div className="h-9 flex items-center px-3 bg-primary/10 border border-primary/20 rounded-md text-primary text-[10px] font-black gap-2 uppercase tracking-tighter">
                                    <Zap className="w-3 h-3" />
                                    TV SYNC
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="tv_email" className="text-xs font-semibold text-muted-foreground">TradingView Email</Label>
                            <Input 
                                id="tv_email"
                                type="email"
                                placeholder="your-tv-email@example.com"
                                value={(formData as any).tv_email || ""}
                                onChange={e => setFormData({...formData, tv_email: e.target.value, mode: 'tv_sync'} as any)}
                                className="bg-primary/5 border-primary/20 text-foreground h-9 text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/5 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-[10px] text-muted-foreground leading-tight">
                            Isolated session. Performance won't affect your main journal logs.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="bg-muted/20 hover:bg-muted/40 h-9 px-4 text-xs font-bold"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            size="sm"
                            disabled={loading}
                            className="bg-primary hover:bg-primary/90 h-9 px-6 text-xs font-black shadow-lg shadow-primary/20"
                        >
                            {loading && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                            Create Session
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
