import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    FileJson,
    FileSpreadsheet,
    FileText,
    Download,
    Info
} from "lucide-react";
import { Trade } from "@/types/trade-types";
import { toast } from "@/hooks/use-toast";

interface ExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: Trade[];
}

export function ExportDialog({ open, onOpenChange, data }: ExportDialogProps) {
    const handleExport = (format: "csv" | "json" | "excel") => {
        if (!data || data.length === 0) {
            toast({
                title: "No data to export",
                description: "There are no trades to export based on your current filters.",
                variant: "destructive",
            });
            return;
        }

        let content = "";
        let fileName = `trades-export-${new Date().toISOString().split('T')[0]}`;
        let mimeType = "";

        try {
            if (format === "json") {
                content = JSON.stringify(data, null, 2);
                fileName += ".json";
                mimeType = "application/json";
            } else {
                // Shared CSV logic for CSV and Excel (Excel can open CSV natively)
                const headers = [
                    "Trade No", "Symbol", "Type", "Volume", "Price Open", "Price Close",
                    "Net Profit", "Reason", "Mistake", "Open Time", "Close Time",
                    "Strategy", "Session", "Emotion", "MAE", "MFE"
                ];

                const rows = data.map(t => [
                    t.trade_no,
                    t.symbol,
                    t.type,
                    t.volume,
                    t.price_open,
                    t.price_close,
                    t.net_profit,
                    `"${(t.reason || "").replace(/"/g, '""')}"`,
                    `"${(t.mistake || "").replace(/"/g, '""')}"`,
                    t.open_time,
                    t.close_time,
                    t.strategy || "",
                    t.session || "",
                    t.emotion || "",
                    t.mae || 0,
                    t.mfe || 0
                ]);

                content = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
                fileName += format === "excel" ? ".csv" : ".csv"; // Using .csv for both as it's reliable
                mimeType = "text/csv";
            }

            // Trigger download
            const blob = new Blob([content], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: "Export Successful",
                description: `Your trades have been exported as ${format.toUpperCase()}.`,
            });

            onOpenChange(false);
        } catch (error) {
            console.error("Export error:", error);
            toast({
                title: "Export Failed",
                description: "An error occurred while generating your export.",
                variant: "destructive",
            });
        }
    };

    const formats = [
        {
            id: "csv",
            name: "CSV Format",
            description: "Standard comma-separated values. Compatible with most data tools.",
            icon: <FileText className="w-6 h-6 text-blue-400" />,
            color: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20",
        },
        {
            id: "excel",
            name: "Excel Compatible",
            description: "Optimized for Microsoft Excel and Google Sheets.",
            icon: <FileSpreadsheet className="w-6 h-6 text-emerald-400" />,
            color: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20",
        },
        {
            id: "json",
            name: "JSON Format",
            description: "Structured data format. Best for developers and data backup.",
            icon: <FileJson className="w-6 h-6 text-amber-400" />,
            color: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20",
        },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] glass-card-premium border-white/10 p-6 overflow-hidden !top-[50%] !-translate-y-[50%] hover:!translate-y-[-50%]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />

                <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Download className="w-6 h-6 text-primary" />
                        Export Trade History
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground pt-1">
                        Choose your preferred format to download {data.length} trade records.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {formats.map((format) => (
                        <button
                            key={format.id}
                            onClick={() => handleExport(format.id as any)}
                            className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 text-left group ${format.color}`}
                        >
                            <div className="p-3 rounded-lg bg-black/20 group-hover:scale-110 transition-transform duration-300">
                                {format.icon}
                            </div>
                            <div className="flex-1 pt-0.5">
                                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                                    {format.name}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                                    {format.description}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 flex gap-3 text-xs text-muted-foreground italic">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>
                        The export will include all trade details including symbols, profit/loss, and custom notes.
                    </p>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
