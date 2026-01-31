import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Sparkles, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface SetGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export function SetGoalModal({ isOpen, onClose, onSuccess, initialData }: SetGoalModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [goalType, setGoalType] = useState<string>("monthly");
    const [targetAmount, setTargetAmount] = useState<string>("");

    useEffect(() => {
        if (initialData) {
            setGoalType(initialData.goal_type || "monthly");
            setTargetAmount(initialData.target_amount?.toString() || "");
        } else {
            setGoalType("monthly");
            setTargetAmount("");
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.user_id) return;
        if (!targetAmount || isNaN(parseFloat(targetAmount))) {
            toast.error("Please enter a valid target amount");
            return;
        }

        setLoading(true);
        try {
            await api.post(`/api/goals/?user_id=${user.user_id}`, {
                goal_type: goalType,
                target_amount: parseFloat(targetAmount),
                is_active: true
            });
            toast.success("Goal updated successfully!");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error setting goal:", error);
            toast.error("Failed to update goal");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-[#08080f] border-white/5 text-white rounded-3xl p-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

                <form onSubmit={handleSubmit} className="relative z-10 p-8 space-y-6">
                    <DialogHeader>
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                            <Target className="w-6 h-6 text-primary" />
                        </div>
                        <DialogTitle className="text-2xl font-black">Set Growth Target</DialogTitle>
                        <DialogDescription className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">
                            Define your profit goal to track progress
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Goal Period</Label>
                            <Select value={goalType} onValueChange={setGoalType}>
                                <SelectTrigger className="bg-white/5 border-white/5 h-12 rounded-xl focus:ring-primary font-bold">
                                    <SelectValue placeholder="Select period" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#08080f] border-white/5 text-white rounded-xl">
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Profit Target ($)</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    placeholder="e.g. 5000"
                                    value={targetAmount}
                                    onChange={(e) => setTargetAmount(e.target.value)}
                                    className="bg-white/5 border-white/5 h-12 rounded-xl focus:ring-primary pl-10 font-black text-lg"
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="rounded-xl font-bold uppercase tracking-widest text-[10px]"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 font-black uppercase tracking-widest text-[10px] gap-2 shadow-[0_0_20px_rgba(11,102,228,0.3)]"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {initialData ? "Update Goal" : "Save Goal"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
