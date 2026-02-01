import React, { useState, useEffect, useMemo } from "react";
import UserLayout from "@/components/layout/UserLayout";
import {
    User, Save, CreditCard, Download, History, Sparkles, FileText,
    Loader2, RotateCw, Trash2, ShieldCheck, Activity, Target,
    Settings, Lock, Wallet, Edit3, Globe, DollarSign, Clock,
    Zap, AlertTriangle, Scale, Repeat
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import ReportGenerationModal from "@/components/profile/ReportGenerationModal";
import { Badge } from "@/components/ui/badge";
import { FeatureGate } from "@/components/auth/FeatureGate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const Profile = () => {
    const { user, login, token } = useAuth();

    // Standard profile fields
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [username, setUsername] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Trading Rules & Preferences fields
    const [maxRisk, setMaxRisk] = useState(2.0);
    const [maxTrades, setMaxTrades] = useState(5);
    const [maxDailyLoss, setMaxDailyLoss] = useState(4.5);
    const [maxLosingStreak, setMaxLosingStreak] = useState(3);
    const [rrRatio, setRrRatio] = useState("1:2");
    const [sessions, setSessions] = useState<string[]>([]);
    const [pairs, setPairs] = useState<string[]>([]);
    const [currency, setCurrency] = useState("USD");
    const [timezone, setTimezone] = useState("UTC");

    // Existing feature states
    const [subscription, setSubscription] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isBillingLoading, setIsBillingLoading] = useState(true);
    const [reports, setReports] = useState<any[]>([]);
    const [isReportsLoading, setIsReportsLoading] = useState(true);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [isStatsLoading, setIsStatsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setFirstName(user.first_name || "");
            setLastName(user.last_name || "");
            // @ts-ignore
            setMobileNumber(user.mobile_number || "");
            setUsername(user.username || user.email?.split('@')[0] || "");

            // Initialize new fields
            setMaxRisk(user.max_risk_per_trade ?? 2.0);
            setMaxTrades(user.max_daily_trades ?? 5);
            setMaxDailyLoss(user.daily_loss_limit ?? 4.5);
            setMaxLosingStreak(user.max_losing_streak ?? 3);
            setRrRatio(user.risk_reward_ratio || "1:2");
            setSessions(user.preferred_sessions || []);
            setPairs(user.favorite_pairs || []);
            setCurrency(user.currency || "USD");
            setTimezone(user.timezone || "UTC");

            fetchBillingData();
            fetchReports();
            fetchUserStats();
        }
    }, [user]);

    const fetchUserStats = async () => {
        try {
            const res = await api.get(`/trades/stats/user/${user.user_id}`);
            setStats(res.data);
        } catch (e) {
            console.error("Error fetching stats:", e);
        } finally {
            setIsStatsLoading(false);
        }
    };

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

    const handleSave = async (silent = false) => {
        if (!user) return;

        if (!silent) setIsSaving(true);
        try {
            const updateData = {
                first_name: firstName,
                last_name: lastName,
                mobile_number: mobileNumber,
                username: username,
                max_risk_per_trade: maxRisk,
                max_daily_trades: maxTrades,
                daily_loss_limit: maxDailyLoss,
                max_losing_streak: maxLosingStreak,
                risk_reward_ratio: rrRatio,
                preferred_sessions: sessions,
                favorite_pairs: pairs,
                currency: currency,
                timezone: timezone
            };

            const response = await api.put(`/api/users/profile/${user.user_id}`, updateData);

            if (token && response.data) {
                const updatedUser = { ...user, ...response.data };
                login(token, updatedUser);
            }

            if (!silent) {
                toast({
                    title: "Profile Updated",
                    description: "Your session settings have been saved successfully.",
                });
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            if (!silent) {
                toast({
                    title: "Update Failed",
                    description: "Could not update profile. Please try again.",
                    variant: "destructive"
                });
            }
        } finally {
            if (!silent) setIsSaving(false);
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
            const response = await api.get(`/api/subscriptions/transactions/${transactionId}/invoice`, {
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

    const handleDeleteReport = async (reportId: string) => {
        if (!window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) return;

        try {
            await api.delete(`/api/reports/${reportId}`);
            setReports(prev => prev.filter(r => r.id !== reportId));
            toast({
                title: "Report Deleted",
                description: "The performance report has been removed."
            });
        } catch (error: any) {
            console.error("Error deleting report:", error);
            const detail = error.response?.data?.detail || "Could not delete the report. Please try again.";
            toast({
                title: "Delete Failed",
                description: detail,
                variant: "destructive"
            });
        }
    };

    const [activeTab, setActiveTab] = useState("profile");

    return (
        <UserLayout>
            <main className="container mx-auto px-4 lg:px-6 py-12 max-w-6xl space-y-8 animate-fade-up">
                {/* Premium Header */}
                <div className="glass-card-premium p-8 rounded-[40px] relative overflow-hidden group bg-card dark:bg-[#0c0c0e]">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000" />

                    <div className="flex flex-col md:flex-row items-center justify-between relative z-10 gap-8">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-primary/20 to-primary/5 p-1">
                                    <div className="w-full h-full rounded-[28px] bg-muted dark:bg-[#0c0c0e] flex items-center justify-center border border-border dark:border-white/5 overflow-hidden text-foreground dark:text-primary/40">
                                        <User className="w-10 h-10" />
                                    </div>
                                </div>
                                <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-2xl bg-primary text-white flex items-center justify-center border-4 border-background dark:border-[#0c0c0e] hover:scale-110 transition-transform shadow-lg">
                                    <Edit3 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="space-y-4 text-center md:text-left">
                                <div className="space-y-1">
                                    <h1 className="text-3xl font-black text-foreground dark:text-white tracking-tight">{firstName} {lastName}</h1>
                                    <div className="flex items-center gap-2 text-muted-foreground/60">
                                        <p className="text-xs font-bold tracking-wider">@{username}</p>
                                        <span className="text-[10px] opacity-30">•</span>
                                        <p className="text-[10px] font-black uppercase tracking-widest">Joined {user?.created_at ? new Date(user.created_at).getFullYear() : "2026"}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="default" className="bg-primary/20 text-primary border-primary/20 rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                        {subscription?.plan_name || user?.subscription_tier?.toUpperCase() || 'FREE'}
                                    </Badge>
                                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest gap-1.5">
                                        <ShieldCheck className="w-3 h-3" /> Verified
                                    </Badge>
                                    <Badge variant="outline" className="text-foreground/60 dark:text-white/60 border-border dark:border-white/10 rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                        {stats?.is_free_tier ? "30rd-Day " : ""}{stats?.total_trades || 0} Trades
                                    </Badge>
                                    <Badge variant="outline" className="text-foreground/60 dark:text-white/60 border-border dark:border-white/10 rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                        {stats?.is_free_tier ? "30rd-Day " : ""}{stats?.win_rate?.toFixed(0) || 0}% Win Rate
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="hero"
                            className="rounded-[20px] px-8 h-12 gap-2 text-[11px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(11,102,228,0.3)]"
                            onClick={() => setActiveTab("settings")}
                        >
                            <Edit3 className="w-4 h-4" /> Edit Profile
                        </Button>
                    </div>
                </div>

                {/* Sub Navigation Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full text-foreground">
                    <TabsList className="bg-muted/50 dark:bg-white/[0.02] p-1.5 rounded-[22px] border border-border dark:border-white/5 h-auto mb-8 flex-wrap justify-start">
                        <TabsTrigger value="profile" className="rounded-[18px] px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-white gap-2 transition-all duration-300 text-muted-foreground hover:text-foreground dark:hover:text-white">
                            <User className="w-4 h-4" /> <span className="text-[11px] font-black uppercase tracking-widest">Profile</span>
                        </TabsTrigger>
                        <FeatureGate tier="pro" showLock={false}>
                            <TabsTrigger value="reports" className="rounded-[18px] px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-white gap-2 transition-all duration-300 text-muted-foreground hover:text-foreground dark:hover:text-white" disabled={subscription?.plan_name?.toLowerCase() === 'free' || user?.subscription_tier?.toLowerCase() === 'free'}>
                                <FileText className="w-4 h-4" /> <span className="text-[11px] font-black uppercase tracking-widest">Reports</span>
                            </TabsTrigger>
                        </FeatureGate>
                        <TabsTrigger value="mt5" className="rounded-[18px] px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-white gap-2 transition-all duration-300 text-muted-foreground hover:text-foreground dark:hover:text-white">
                            <Zap className="w-4 h-4" /> <span className="text-[11px] font-black uppercase tracking-widest">MT5/MT4</span>
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="rounded-[18px] px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-white gap-2 transition-all duration-300 text-muted-foreground hover:text-foreground dark:hover:text-white">
                            <Settings className="w-4 h-4" /> <span className="text-[11px] font-black uppercase tracking-widest">Settings</span>
                        </TabsTrigger>
                        <TabsTrigger value="billing" className="rounded-[18px] px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-white gap-2 transition-all duration-300 text-muted-foreground hover:text-foreground dark:hover:text-white">
                            <Wallet className="w-4 h-4" /> <span className="text-[11px] font-black uppercase tracking-widest">Billing</span>
                        </TabsTrigger>
                        <TabsTrigger value="security" className="rounded-[18px] px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-white gap-2 transition-all duration-300 text-muted-foreground hover:text-foreground dark:hover:text-white">
                            <Lock className="w-4 h-4" /> <span className="text-[11px] font-black uppercase tracking-widest">Security</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-10">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* AI Report Banner (Pro-Level) */}
                            <FeatureGate tier="pro">
                                <div className="lg:col-span-12 glass-card-premium p-10 rounded-[40px] border-primary/10 bg-gradient-to-br from-primary/5 via-[#0c0c0e] to-transparent relative overflow-hidden group min-h-[200px] flex items-center">
                                    <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-700" />

                                    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 px-4">
                                        <div className="flex items-center gap-8">
                                            <div className="w-20 h-20 rounded-[28px] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_40px_rgba(11,102,228,0.15)] group-hover:scale-105 transition-transform duration-500">
                                                <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-3xl font-black text-foreground dark:text-white tracking-tighter">AI Analysis Engine</h3>
                                                <p className="text-xs text-muted-foreground/50 font-bold uppercase tracking-[0.2em]">Personalized behavioral insights and edge discovery</p>
                                            </div>
                                        </div>
                                        <Button
                                            className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-12 h-14 text-[11px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(11,102,228,0.3)] transition-all hover:scale-105 active:scale-95 shrink-0"
                                            onClick={() => setIsReportModalOpen(true)}
                                        >
                                            Generate Intelligence Report
                                        </Button>
                                    </div>
                                </div>
                            </FeatureGate>

                            {/* Main Performance Bento */}
                            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Trading Identity Card */}
                                <div className="glass-card-premium p-10 rounded-[40px] border border-border dark:border-white/5 flex flex-col justify-between min-h-[280px] bg-card/10 dark:bg-white/[0.01]">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1.5">
                                            <h4 className="text-sm font-black text-foreground/40 dark:text-white/40 uppercase tracking-[0.2em]">Efficiency Rating</h4>
                                            <p className="text-5xl font-black text-foreground dark:text-white tracking-tighter">{stats?.win_rate?.toFixed(0) || 0}%</p>
                                        </div>
                                        <div className="w-16 h-16 rounded-[22px] bg-primary/10 flex items-center justify-center border border-primary/20">
                                            <Activity className="w-8 h-8 text-primary" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary shadow-[0_0_15px_rgba(11,102,228,0.6)] transition-all duration-1000"
                                                style={{ width: `${stats?.win_rate || 0}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            <span>Combat Experience</span>
                                            <span className="text-foreground/60 dark:text-white/60">
                                                {stats?.is_free_tier ? "Last 30 Days: " : ""}{stats?.total_trades || 0} Professional Trades
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Operational Parameters Card */}
                                <div className="glass-card-premium p-10 rounded-[40px] border border-border dark:border-white/5 flex flex-col justify-between min-h-[280px] bg-card/10 dark:bg-white/[0.01]">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1.5">
                                            <h4 className="text-sm font-black text-foreground/40 dark:text-white/40 uppercase tracking-[0.2em]">Market Window</h4>
                                            <p className="text-2xl font-black text-foreground dark:text-white tracking-tight">{timezone}</p>
                                        </div>
                                        <div className="w-16 h-16 rounded-[22px] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                            <Globe className="w-8 h-8 text-emerald-500" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            {sessions.length > 0 ? sessions.map(s => (
                                                <Badge key={s} className="bg-emerald-500/10 text-emerald-500 border-none rounded-lg px-4 py-2 text-[9px] font-black uppercase tracking-widest">{s}</Badge>
                                            )) : <span className="text-[10px] text-muted-foreground/20 font-bold uppercase tracking-widest">Global Market Access</span>}
                                        </div>
                                        <p className="text-[9px] text-muted-foreground/30 font-bold uppercase tracking-[0.2em] pt-2">Active Operational Sessions</p>
                                    </div>
                                </div>

                                {/* Universe of Assets */}
                                <div className="md:col-span-2 glass-card-premium p-10 rounded-[40px] border border-border dark:border-white/5 bg-card/10 dark:bg-white/[0.01]">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                            <Target className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <h3 className="text-base font-black text-foreground dark:text-white uppercase tracking-widest">Target Asset Universe</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {pairs.length > 0 ? pairs.map(p => (
                                            <div key={p} className="px-6 py-3 bg-muted dark:bg-white/[0.03] border border-border dark:border-white/5 rounded-2xl text-[11px] font-black text-foreground/80 dark:text-white/80 uppercase tracking-widest hover:bg-primary/10 hover:border-primary/30 transition-all cursor-default group/asset">
                                                {p}
                                                <span className="ml-2 opacity-0 group-hover/asset:opacity-100 transition-opacity text-primary">•</span>
                                            </div>
                                        )) : <p className="text-xs text-muted-foreground/20 font-bold uppercase py-4">Scanning for opportunities...</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar: Guardrails & Environment */}
                            <div className="lg:col-span-4 space-y-8">
                                {/* Guardrails / Rules Card */}
                                <div className="glass-card-premium p-10 rounded-[40px] border border-border dark:border-white/5 bg-card/10 dark:bg-white/[0.01] h-full space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                            <ShieldCheck className="w-6 h-6 text-amber-500" />
                                        </div>
                                        <h3 className="text-base font-black text-foreground dark:text-white uppercase tracking-widest">Operational Guardrails</h3>
                                    </div>

                                    <div className="space-y-8">
                                        {[
                                            { label: "Equity Risk", value: `${maxRisk}%`, color: "text-red-500" },
                                            { label: "Daily Ceiling", value: maxTrades, color: "text-blue-500" },
                                            { label: "Loss Limit", value: `${maxDailyLoss}%`, color: "text-amber-500" },
                                            { label: "Sequence Limit", value: maxLosingStreak, color: "text-purple-500" },
                                        ].map((rule, idx) => (
                                            <div key={idx} className="flex justify-between items-end border-b border-border dark:border-white/5 pb-4 last:border-0 last:pb-0">
                                                <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">{rule.label}</span>
                                                <span className={cn("text-xl font-black tracking-tight", rule.color)}>{rule.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-6">
                                        <div className="p-4 rounded-2xl bg-muted dark:bg-white/[0.02] border border-border dark:border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                                <span className="text-[10px] font-black text-foreground/40 dark:text-white/40 uppercase tracking-widest">Environment</span>
                                            </div>
                                            <span className="text-sm font-black text-foreground dark:text-white">{currency}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="reports" className="space-y-6">
                        <div className="glass-card-premium p-8 rounded-[32px] border border-border dark:border-white/5 space-y-6 bg-card/50 dark:bg-card">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <FileText className="w-5 h-5 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-black text-foreground dark:text-white uppercase tracking-wider">Historical Reports</h3>
                                </div>
                                <Button
                                    className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 h-10 text-[10px] font-black uppercase tracking-widest"
                                    onClick={() => setIsReportModalOpen(true)}
                                >
                                    Generate New
                                </Button>
                            </div>

                            <div className="w-full rounded-2xl border border-border dark:border-white/5 overflow-hidden">
                                <table className="w-full text-sm table-auto border-separate border-spacing-0">
                                    <thead>
                                        <tr className="bg-muted/50 dark:bg-white/[0.02]">
                                            <th className="text-left p-4 font-black uppercase tracking-widest text-[10px] text-muted-foreground/60">Type</th>
                                            <th className="text-left p-4 font-black uppercase tracking-widest text-[10px] text-muted-foreground/60">Range</th>
                                            <th className="text-left p-4 font-black uppercase tracking-widest text-[10px] text-muted-foreground/60">Status</th>
                                            <th className="text-right p-4 font-black uppercase tracking-widest text-[10px] text-muted-foreground/60">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isReportsLoading ? (
                                            <tr>
                                                <td colSpan={4} className="p-12 text-center text-muted-foreground font-bold text-[11px] uppercase tracking-widest opacity-50">
                                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                                                    Loading reports...
                                                </td>
                                            </tr>
                                        ) : reports.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="p-12 text-center text-muted-foreground font-bold text-[11px] uppercase tracking-widest opacity-50">No reports generated yet</td>
                                            </tr>
                                        ) : (
                                            reports.map((report) => (
                                                <tr key={report.id} className="hover:bg-muted/50 dark:hover:bg-white/[0.02] transition-colors group">
                                                    <td className="p-4 border-t border-border dark:border-white/5">
                                                        <span className="capitalize font-black text-foreground dark:text-white tracking-tight">{report.report_type}</span>
                                                    </td>
                                                    <td className="p-4 text-muted-foreground font-bold text-[11px] border-t border-border dark:border-white/5">
                                                        {new Date(report.start_date).toLocaleDateString()} - {new Date(report.end_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4 border-t border-border dark:border-white/5">
                                                        <span className={cn(
                                                            "px-3 py-1 rounded-[8px] text-[9px] uppercase font-black tracking-widest",
                                                            report.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                                                                report.status === 'failed' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-500'
                                                        )}>
                                                            {report.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right border-t border-border dark:border-white/5">
                                                        <div className="flex justify-end gap-2">
                                                            {report.status === 'completed' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-9 w-9 p-0 rounded-xl hover:bg-primary/20 hover:text-primary"
                                                                    onClick={() => handleDownloadReport(report.id, report.filename)}
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-9 w-9 p-0 rounded-xl hover:bg-destructive/20 hover:text-destructive"
                                                                onClick={() => handleDeleteReport(report.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="mt5" className="max-w-xl mx-auto py-12 text-center space-y-6 opacity-30">
                        <Zap className="w-16 h-16 text-primary/40 mx-auto" />
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-foreground dark:text-white tracking-tight uppercase">MT5/MT4 Integration</h3>
                            <p className="text-xs text-muted-foreground font-bold tracking-widest">Connect your trading accounts for automated journaling (Coming Soon)</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="settings">
                        <div className="glass-card-premium p-8 rounded-[32px] border border-border dark:border-white/5 space-y-8 max-w-2xl mx-auto bg-card/50 dark:bg-card">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-black text-foreground dark:text-white uppercase tracking-tight">Personal Details</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1" htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="bg-muted dark:bg-white/[0.03] border-border dark:border-white/5 h-12 rounded-xl focus:ring-primary/20 focus:border-primary/50 text-foreground dark:text-white font-bold"
                                        placeholder="Enter your first name"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1" htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="bg-muted dark:bg-white/[0.03] border-border dark:border-white/5 h-12 rounded-xl focus:ring-primary/20 focus:border-primary/50 text-foreground dark:text-white font-bold"
                                        placeholder="Enter your last name"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1" htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={user?.email || ""}
                                        disabled
                                        className="bg-muted/50 dark:bg-white/[0.01] border-border dark:border-white/5 h-12 rounded-xl opacity-50 cursor-not-allowed text-foreground/50 dark:text-white/50"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1" htmlFor="phone">Mobile Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                        placeholder="+1 (555) 000-0000"
                                        className="bg-muted dark:bg-white/[0.03] border-border dark:border-white/5 h-12 rounded-xl focus:ring-primary/20 focus:border-primary/50 text-foreground dark:text-white font-bold"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button
                                    variant="hero"
                                    className="rounded-[18px] px-10 h-12 gap-2 text-[11px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(11,102,228,0.3)] w-full sm:w-auto"
                                    onClick={() => handleSave()}
                                    disabled={isSaving}
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="billing">
                        <div className="space-y-8 max-w-4xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="glass-card-premium p-6 rounded-[24px] bg-primary/10 border border-primary/20">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Current Plan</p>
                                    <p className="text-3xl font-black capitalize text-foreground dark:text-white tracking-tight">{subscription?.plan_name || user?.subscription_tier || 'Free'}</p>
                                </div>
                                <div className="glass-card-premium p-6 rounded-[24px] bg-emerald-500/10 border border-emerald-500/20">
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">Status</p>
                                    <p className="text-3xl font-black capitalize text-foreground dark:text-white tracking-tight">{subscription?.status || 'Active'}</p>
                                </div>
                                <div className="glass-card-premium p-6 rounded-[24px] bg-blue-500/10 border border-blue-500/20">
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">Renewal Date</p>
                                    <p className="text-3xl font-black text-foreground dark:text-white tracking-tight">
                                        {subscription?.renewal_date ? new Date(subscription.renewal_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : (user as any)?.subscription_expiry ? new Date((user as any).subscription_expiry).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Lifetime'}
                                    </p>
                                </div>
                            </div>

                            <div className="glass-card-premium p-8 rounded-[32px] border border-white/5 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <History className="w-5 h-5 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-black text-foreground dark:text-white uppercase tracking-wider">Transaction History</h3>
                                </div>

                                <div className="w-full rounded-2xl border border-border dark:border-white/5 overflow-hidden">
                                    <table className="w-full text-sm table-auto border-separate border-spacing-0">
                                        <thead>
                                            <tr className="bg-muted/50 dark:bg-white/[0.02]">
                                                <th className="text-left p-4 font-black uppercase tracking-widest text-[10px] text-muted-foreground/60">Invoice #</th>
                                                <th className="text-left p-4 font-black uppercase tracking-widest text-[10px] text-muted-foreground/60">Date</th>
                                                <th className="text-left p-4 font-black uppercase tracking-widest text-[10px] text-muted-foreground/60">Amount</th>
                                                <th className="text-left p-4 font-black uppercase tracking-widest text-[10px] text-muted-foreground/60">Status</th>
                                                <th className="text-right p-4 font-black uppercase tracking-widest text-[10px] text-muted-foreground/60">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isBillingLoading ? (
                                                <tr>
                                                    <td colSpan={5} className="p-12 text-center text-muted-foreground font-bold text-[11px] uppercase tracking-widest opacity-50">
                                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                                                        Loading history...
                                                    </td>
                                                </tr>
                                            ) : transactions.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="p-12 text-center text-muted-foreground font-bold text-[11px] uppercase tracking-widest opacity-50">No transactions recorded</td>
                                                </tr>
                                            ) : (
                                                transactions.map((tx) => (
                                                    <tr key={tx.id} className="hover:bg-muted/50 dark:hover:bg-white/[0.02] transition-colors group">
                                                        <td className="p-4 font-black text-foreground dark:text-white tracking-tight border-t border-border dark:border-white/5">{tx.invoice_number}</td>
                                                        <td className="p-4 text-muted-foreground font-bold text-[11px] border-t border-border dark:border-white/5">{new Date(tx.payment_date).toLocaleDateString()}</td>
                                                        <td className="p-4 font-black text-foreground dark:text-white tracking-tight border-t border-border dark:border-white/5">${tx.total_amount?.toFixed(2)}</td>
                                                        <td className="p-4 border-t border-border dark:border-white/5">
                                                            <span className={cn(
                                                                "px-3 py-1 bg-muted rounded-[8px] text-[9px] uppercase font-black tracking-widest",
                                                                tx.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
                                                            )}>
                                                                {tx.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right border-t border-border dark:border-white/5">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-9 w-9 p-0 rounded-xl hover:bg-primary/20 hover:text-primary"
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
                    </TabsContent>

                    <TabsContent value="security" className="max-w-xl mx-auto py-12 text-center space-y-6 opacity-30">
                        <Lock className="w-16 h-16 text-primary/40 mx-auto" />
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-foreground dark:text-white uppercase tracking-tight">Security Center</h3>
                            <p className="text-xs text-muted-foreground font-bold tracking-widest">Enhanced security configurations coming soon</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            <ReportGenerationModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onSuccess={fetchReports}
            />
        </UserLayout>
    );
};

export default Profile;
