import React, { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar, FileText, Loader2, Sparkles, Download, Eye, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import ReportPreview from "./ReportPreview";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { format, differenceInDays, subDays } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReportGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ReportGenerationModal = ({ isOpen, onClose, onSuccess }: ReportGenerationModalProps) => {
    const { user } = useAuth();
    const [reportType, setReportType] = useState<string>("weekly");
    const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [isFetching, setIsFetching] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [showPreview, setShowPreview] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);

    const validateRange = () => {
        if (reportType !== 'custom') return true;
        const days = differenceInDays(new Date(endDate), new Date(startDate));
        if (days < 7) {
            toast({
                title: "Invalid Range",
                description: "Report must be at least 7 days long.",
                variant: "destructive"
            });
            return false;
        }
        return true;
    };

    const fetchPreviewData = async () => {
        if (!validateRange()) return;

        setIsFetching(true);
        try {
            const params = new URLSearchParams({ report_type: reportType });
            if (reportType === 'custom') {
                params.append('start_date', startDate);
                params.append('end_date', endDate);
            }

            const res = await api.get(`/api/reports/preview-data?${params.toString()}`);
            setReportData(res.data);
            setShowPreview(true);
            toast({
                title: "Data Fetched",
                description: `Analysis for your ${reportType} period is ready.`,
            });
        } catch (error: any) {
            console.error("Error fetching preview data:", error);
            const isNoData = error.response?.status === 404;
            toast({
                title: isNoData ? "No records" : "Fetch Failed",
                description: isNoData
                    ? "No records found for the selected period."
                    : (error.response?.data?.detail || "Could not retrieve trading data."),
                variant: isNoData ? "default" : "destructive",
            });
        } finally {
            setIsFetching(false);
        }
    };

    const handleDownload = async () => {
        if (!previewRef.current || !reportData) return;

        setIsDownloading(true);
        try {
            const canvas = await html2canvas(previewRef.current, {
                scale: 2, // High quality
                useCORS: true,
                backgroundColor: "#0f172a",
                logging: false
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "px",
                format: [canvas.width / 2, canvas.height / 2] // Scale back to normal size
            });

            pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);

            const dateStr = new Date().toISOString().split('T')[0];
            pdf.save(`${reportType}-performance-report-${dateStr}.pdf`);

            // Also trigger backend record creation
            const params = new URLSearchParams({ report_type: reportType });
            if (reportType === 'custom') {
                params.append('start_date', startDate);
                params.append('end_date', endDate);
            }
            api.post(`/api/reports/generate?${params.toString()}`).catch(e => console.error("History sync failed", e));

            toast({
                title: "Report Ready",
                description: "Your PDF has been generated and saved locally.",
            });

            onSuccess();
            onClose();
        } catch (error) {
            console.error("PDF Generation error:", error);
            toast({
                title: "Download Failed",
                description: "Something went wrong during PDF creation.",
                variant: "destructive",
            });
        } finally {
            setIsDownloading(false);
        }
    };

    // Reset state when opening/closing
    useEffect(() => {
        if (!isOpen) {
            setShowPreview(false);
            setReportData(null);
            setReportType("weekly");
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={cn(
                "transition-all duration-300",
                showPreview ? "sm:max-w-[900px] h-[90vh] overflow-y-auto" : "sm:max-w-[425px]"
            )}>
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            {showPreview ? "Report Intelligence Preview" : "Generate Performance Report"}
                        </DialogTitle>
                        {showPreview && (
                            <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)} className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back to period
                            </Button>
                        )}
                    </div>
                    <DialogDescription>
                        {showPreview
                            ? "Review your performance metrics and AI insights before exporting."
                            : "Select a time period or custom range for your performance review."}
                    </DialogDescription>
                </DialogHeader>

                {!showPreview ? (
                    <div className="grid gap-4 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Report Period</Label>
                                <Select value={reportType} onValueChange={setReportType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weekly">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Weekly (Last 7 Days)
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="monthly">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Monthly (Last 30 Days)
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="yearly">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Yearly (Last 365 Days)
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="custom">
                                            <div className="flex items-center gap-2 text-primary">
                                                <Calendar className="w-4 h-4" />
                                                Custom Date Range
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {reportType === "custom" && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase text-muted-foreground">Start Date</Label>
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            max={endDate}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase text-muted-foreground">End Date</Label>
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            min={startDate}
                                            max={format(new Date(), 'yyyy-MM-dd')}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-primary" />
                                Auto-Populated Insights
                            </p>
                            <ul className="text-xs space-y-1 text-muted-foreground">
                                <li>• Fetches from Analytics & Diary</li>
                                <li>• Includes Private Reflections</li>
                                <li>• Neon/Dark Aesthetic Theme</li>
                                <li>• High Fidelity PDF Export</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="py-6 flex justify-center bg-slate-950/20 rounded-xl">
                        <ReportPreview
                            data={reportData}
                            reportType={reportType}
                            userName={`${user?.first_name || 'Trader'} ${user?.last_name || ''}`}
                            previewRef={previewRef}
                        />
                    </div>
                )}

                <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isFetching || isDownloading}>Cancel</Button>
                    {!showPreview ? (
                        <Button onClick={fetchPreviewData} disabled={isFetching} className="gap-2">
                            {isFetching ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Analyzing Data...
                                </>
                            ) : (
                                <>
                                    <Eye className="w-4 h-4" />
                                    Generate Preview
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button onClick={handleDownload} disabled={isDownloading} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                            {isDownloading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating PDF...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Download PDF Report
                                </>
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ReportGenerationModal;
