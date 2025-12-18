import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { User, Save, CreditCard, Download, History, Sparkles, FileText, Loader2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import ReportGenerationModal from "@/components/profile/ReportGenerationModal";

const Profile = () => {
    const { user, login, token } = useAuth();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [subscription, setSubscription] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isBillingLoading, setIsBillingLoading] = useState(true);
    const [reports, setReports] = useState<any[]>([]);
    const [isReportsLoading, setIsReportsLoading] = useState(true);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setFirstName(user.first_name || "");
            setLastName(user.last_name || "");
            // @ts-ignore
            setMobileNumber(user.mobile_number || "");
            fetchBillingData();
            fetchReports();
        }
    }, [user]);

    // Polling for pending reports
    useEffect(() => {
        const hasPending = reports.some(r => r.status === 'pending');
        let interval: NodeJS.Timeout;

        if (hasPending) {
            interval = setInterval(() => {
                fetchReports();
            }, 3000); // Poll every 3 seconds
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [reports]);

    const fetchReports = async (showInitialLoading = false) => {
        if (showInitialLoading) setIsReportsLoading(true);
        try {
            const res = await api.get("/api/reports/my-reports");
            setReports(res.data);
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setIsReportsLoading(false);
        }
    };

    const fetchBillingData = async () => {
        setIsBillingLoading(true);
        try {
            const [subRes, txRes] = await Promise.all([
                api.get("/api/subscriptions/my-subscription"),
                api.get("/api/subscriptions/my-transactions")
            ]);
            setSubscription(subRes.data);
            setTransactions(txRes.data);
        } catch (error) {
            console.error("Error fetching billing data:", error);
        } finally {
            setIsBillingLoading(false);
        }
    };

    const handleDownloadReport = async (reportId: string, filename: string) => {
        try {
            const response = await api.get(`/api/reports/${reportId}/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error downloading report:", error);
            toast({
                title: "Download Failed",
                description: "Could not download report.",
                variant: "destructive"
            });
        }
    };

    const handleDownloadInvoice = async (transactionId: string, invoiceNumber: string) => {
        try {
            const response = await api.get(`/api/subscriptions/invoice/${transactionId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error downloading invoice:", error);
            toast({
                title: "Download Failed",
                description: "Could not download invoice.",
                variant: "destructive"
            });
        }
    };

    const handleSave = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const response = await api.put(`/api/users/profile/${user.user_id}`, {
                first_name: firstName,
                last_name: lastName,
                mobile_number: mobileNumber
            });

            if (token && response.data) {
                const updatedUser = { ...user, ...response.data };
                login(token, updatedUser);
            }

            toast({
                title: "Profile Updated",
                description: "Your personal information has been saved.",
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                title: "Update Failed",
                description: "Could not update profile. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setFirstName(user.first_name || "");
            setLastName(user.last_name || "");
            // @ts-ignore
            setMobileNumber(user.mobile_number || "");
            toast({
                title: "Changes Reset",
                description: "Form reset to current profile data."
            });
        }
    };

    return (
        <div className="min-h-screen">
            <Header />
            <main className="container mx-auto px-4 lg:px-6 py-8 max-w-4xl">
                <div className="space-y-2 mb-8 opacity-0 animate-fade-up">
                    <div className="flex items-center gap-3">
                        <User className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Profile</h1>
                    </div>
                    <p className="text-muted-foreground">Manage your personal information</p>
                </div>

                <div className="space-y-8">
                    <div className="glass-card p-6 overflow-hidden opacity-0 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                            <User className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-semibold">Personal Details</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="bg-muted/50"
                                    placeholder="Enter your first name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="bg-muted/50"
                                    placeholder="Enter your last name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={user?.email || ""}
                                    disabled
                                    className="bg-muted/50 opacity-70 cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Mobile Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className="bg-muted/50"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <Button variant="outline" type="button" onClick={handleCancel}>Cancel</Button>
                            <Button variant="hero" className="gap-2" onClick={handleSave} disabled={isLoading}>
                                <Save className="w-4 h-4" />
                                {isLoading ? "Saving..." : "Save Profile"}
                            </Button>
                        </div>
                    </div>

                    <div className="glass-card p-6 overflow-hidden opacity-0 animate-fade-up" style={{ animationDelay: "0.3s" }}>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                            <CreditCard className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-semibold">Billing & Subscription</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                                <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
                                <p className="text-xl font-bold capitalize text-primary">{subscription?.plan_name || 'Free'}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                <p className="text-sm text-muted-foreground mb-1">Status</p>
                                <p className="text-xl font-bold capitalize text-emerald-500">{subscription?.status || 'Active'}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                <p className="text-sm text-muted-foreground mb-1">Renewal Date</p>
                                <p className="text-xl font-bold">
                                    {subscription?.renewal_date ? new Date(subscription.renewal_date).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <History className="w-4 h-4 text-primary" />
                                <h3 className="font-medium">Transaction History</h3>
                            </div>
                            <div className="w-full rounded-md border overflow-x-auto">
                                <table className="w-full text-sm min-w-[600px] table-auto">
                                    <thead className="bg-muted/50 border-b">
                                        <tr>
                                            <th className="text-left p-3 font-medium">Invoice #</th>
                                            <th className="text-left p-3 font-medium">Date</th>
                                            <th className="text-left p-3 font-medium">Amount</th>
                                            <th className="text-left p-3 font-medium">Status</th>
                                            <th className="text-right p-3 font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isBillingLoading ? (
                                            <tr>
                                                <td colSpan={5} className="p-4 text-center text-muted-foreground">Loading history...</td>
                                            </tr>
                                        ) : transactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-4 text-center text-muted-foreground">No transactions found.</td>
                                            </tr>
                                        ) : (
                                            transactions.map((tx) => (
                                                <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                    <td className="p-3 font-medium">{tx.invoice_number}</td>
                                                    <td className="p-3">{new Date(tx.payment_date).toLocaleDateString()}</td>
                                                    <td className="p-3 font-semibold">${tx.total_amount?.toFixed(2)}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${tx.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' :
                                                            tx.status === 'failed' ? 'bg-destructive/10 text-destructive' :
                                                                'bg-muted text-muted-foreground'
                                                            }`}>
                                                            {tx.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => handleDownloadInvoice(tx.id, tx.invoice_number)}
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Performance Reports Section */}
                    <div className="glass-card p-6 overflow-hidden opacity-0 animate-fade-up" style={{ animationDelay: "0.4s" }}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-semibold">Performance Reports</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => fetchReports(true)}
                                    disabled={isReportsLoading}
                                >
                                    <RotateCw className={`w-4 h-4 ${isReportsLoading ? 'animate-spin' : ''}`} />
                                </Button>
                                <Button
                                    onClick={() => setIsReportModalOpen(true)}
                                    className="gap-2"
                                    size="sm"
                                >
                                    <FileText className="w-4 h-4" />
                                    Generate New Report
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="w-full rounded-md border overflow-x-auto">
                                <table className="w-full text-sm min-w-[600px] table-auto">
                                    <thead className="bg-muted/50 border-b">
                                        <tr>
                                            <th className="text-left p-3 font-medium">Report Type</th>
                                            <th className="text-left p-3 font-medium">Date Range</th>
                                            <th className="text-left p-3 font-medium">Created At</th>
                                            <th className="text-right p-3 font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isReportsLoading ? (
                                            <tr>
                                                <td colSpan={4} className="p-4 text-center text-muted-foreground">Loading reports...</td>
                                            </tr>
                                        ) : reports.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="p-4 text-center text-muted-foreground">No reports generated yet.</td>
                                            </tr>
                                        ) : (
                                            reports.map((report) => (
                                                <tr key={report.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                    <td className="p-3">
                                                        <div className="flex flex-col">
                                                            <span className="capitalize font-medium text-primary">
                                                                {report.report_type} Report
                                                            </span>
                                                            <div className="flex items-center gap-1.5 mt-1">
                                                                <span className={`w-2 h-2 rounded-full ${report.status === 'completed' ? 'bg-emerald-500' :
                                                                    report.status === 'failed' ? 'bg-destructive' :
                                                                        'bg-amber-500 animate-pulse'
                                                                    }`} />
                                                                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                                                                    {report.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-muted-foreground whitespace-nowrap">
                                                        {new Date(report.start_date).toLocaleDateString()} - {new Date(report.end_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-3 text-muted-foreground whitespace-nowrap text-xs">
                                                        {new Date(report.created_at).toLocaleString()}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        {report.status === 'completed' ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={() => handleDownloadReport(report.id, report.filename)}
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </Button>
                                                        ) : report.status === 'pending' ? (
                                                            <div className="flex justify-end p-2">
                                                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-destructive">Error</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <ReportGenerationModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onSuccess={fetchReports}
            />
        </div>
    );
};

export default Profile;
