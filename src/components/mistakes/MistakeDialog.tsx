import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Mistake, MistakeCreate } from "@/types/mistake-types";
import { Loader2 } from "lucide-react";

interface MistakeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (mistake: MistakeCreate) => Promise<void>;
    editMistake?: Mistake | null;
    userId: string;
}

export function MistakeDialog({ open, onOpenChange, onSubmit, editMistake, userId }: MistakeDialogProps) {
    const [formData, setFormData] = useState<MistakeCreate>({
        name: "",
        category: "Behavioral",
        severity: "Medium",
        impact: "Moderate",
        description: "",
        user_id: userId,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editMistake) {
            setFormData({
                name: editMistake.name,
                category: editMistake.category,
                severity: editMistake.severity,
                impact: editMistake.impact,
                description: editMistake.description || "",
                user_id: userId,
            });
        } else {
            setFormData({
                name: "",
                category: "Behavioral",
                severity: "Medium",
                impact: "Moderate",
                description: "",
                user_id: userId,
            });
        }
    }, [editMistake, userId, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            onOpenChange(false);
        } catch (error) {
            console.error("Error submitting mistake:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto bg-white dark:bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl p-0 gap-0">
                <div className="p-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            {editMistake ? "Edit Mistake" : "Add Custom Mistake"}
                        </DialogTitle>
                        <DialogDescription>
                            Define a custom mistake type to track in your trading journal.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Mistake Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Overtrading, Revenge Trading"
                                required
                                className="bg-background/50"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                                >
                                    <SelectTrigger className="bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Behavioral">Behavioral</SelectItem>
                                        <SelectItem value="Psychological">Psychological</SelectItem>
                                        <SelectItem value="Cognitive">Cognitive</SelectItem>
                                        <SelectItem value="Technical">Technical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="severity">Severity *</Label>
                                <Select
                                    value={formData.severity}
                                    onValueChange={(value: any) => setFormData({ ...formData, severity: value })}
                                >
                                    <SelectTrigger className="bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="impact">Impact *</Label>
                            <Select
                                value={formData.impact}
                                onValueChange={(value: any) => setFormData({ ...formData, impact: value })}
                            >
                                <SelectTrigger className="bg-background/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Critical">Critical</SelectItem>
                                    <SelectItem value="Moderate">Moderate</SelectItem>
                                    <SelectItem value="Minor">Minor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe this mistake type and how to avoid it..."
                                rows={3}
                                className="bg-background/50 resize-none"
                            />
                        </div>

                        <div className="flex gap-3 justify-end pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>{editMistake ? "Update" : "Create"} Mistake</>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
