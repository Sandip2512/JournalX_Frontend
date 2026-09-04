import React, { useState, useEffect } from "react";
import UserLayout from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/button";
import { Plus, FlaskConical, Play, History, BarChart2, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { SessionList } from "@/components/backtesting/SessionList";
import { CreateSessionModal } from "@/components/backtesting/CreateSessionModal";
import { SessionDetail } from "@/components/backtesting/SessionDetail";
import { FeatureGate } from "@/components/auth/FeatureGate";

const Backtesting = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchSessions = async () => {
        if (!user?.user_id) return;
        try {
            setLoading(true);
            const response = await api.get(`/api/backtest/sessions?user_id=${user.user_id}`);
            setSessions(response.data);
        } catch (error) {
            console.error("Error fetching sessions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, [user?.user_id]);

    const handleSessionCreated = (newSession: any) => {
        setSessions([newSession, ...sessions]);
        setSelectedSessionId(newSession._id);
    };

    const handleDeleteSession = async (sessionId: string) => {
        if (!confirm("Are you sure you want to delete this session and all its trades?")) return;
        
        try {
            await api.delete(`/api/backtest/sessions/${sessionId}`);
            setSessions(prev => prev.filter((s: any) => s._id !== sessionId));
        } catch (error) {
            console.error("Error deleting session:", error);
        }
    };

    if (selectedSessionId) {
        return (
            <UserLayout>
                <div className="container mx-auto px-4 lg:px-6 py-6 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                    <FeatureGate tier="elite" showLock={true}>
                        <Button 
                            variant="ghost" 
                            onClick={() => setSelectedSessionId(null)}
                            className="mb-4 text-muted-foreground hover:text-foreground"
                        >
                            ← Back to Sessions
                        </Button>
                        <SessionDetail sessionId={selectedSessionId} />
                    </FeatureGate>
                </div>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-1000 p-4">
                <FeatureGate tier="elite" showLock={true}>
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row items-end justify-between gap-4 pb-4 border-b border-white/5">
                        <div>
                            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-bold tracking-widest uppercase mb-2">
                                <FlaskConical className="w-3 h-3" />
                                Simulation Environment
                            </div>
                            <h1 className="text-3xl font-black text-foreground tracking-tighter leading-none">Practice <span className="text-primary italic">Arena</span></h1>
                            <p className="text-muted-foreground mt-2 text-sm font-medium max-w-xl">Master your strategy in a risk-free, isolated environment.</p>
                        </div>
                        <Button 
                            onClick={() => setShowCreateModal(true)}
                            className="group relative overflow-hidden gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-5 rounded-xl font-bold shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <Plus className="w-4 h-4" />
                            New Session
                        </Button>
                    </div>

                    {/* Featured Hero Card */}
                    <div className="relative group">
                        <div className="relative glass-card-premium p-6 rounded-[1.5rem] border border-white/10 bg-black/40 backdrop-blur-2xl overflow-hidden">
                            {/* Decorative Background Icon */}
                            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700">
                                <Zap className="w-48 h-48 text-primary animate-pulse" />
                            </div>
                            
                            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
                                <div className="flex-1 space-y-3">
                                    <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-bold tracking-widest uppercase mb-0.5">
                                        <div className="w-1 h-1 rounded-full bg-blue-400 animate-ping" />
                                        Live Bridge Active
                                    </div>
                                    <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Bridge Your <span className="bg-gradient-to-r from-blue-400 to-primary bg-clip-text text-transparent">TradingView</span></h2>
                                    <p className="text-muted-foreground/80 leading-relaxed text-sm max-w-xl">
                                        Sync your TradingView paper trading account directly to JournalX via high-speed webhooks. 
                                        Get professional analytics and equity curves automatically.
                                    </p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                        <div className="flex flex-col gap-1 p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                            </div>
                                            <span className="text-[11px] font-bold text-foreground/90 leading-none">Zero Latency</span>
                                            <span className="text-[10px] text-muted-foreground leading-none">Instant logging.</span>
                                        </div>
                                        <div className="flex flex-col gap-1 p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="w-5 h-5 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                <div className="w-1 h-1 rounded-full bg-blue-500" />
                                            </div>
                                            <span className="text-[11px] font-bold text-foreground/90 leading-none">No Broker</span>
                                            <span className="text-[10px] text-muted-foreground leading-none">Direct auth.</span>
                                        </div>
                                        <div className="flex flex-col gap-1 p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="w-5 h-5 rounded-md bg-purple-500/10 flex items-center justify-center text-purple-500">
                                                <div className="w-1 h-1 rounded-full bg-purple-500" />
                                            </div>
                                            <span className="text-[11px] font-bold text-foreground/90 leading-none">Isolated Stats</span>
                                            <span className="text-[10px] text-muted-foreground leading-none">Clean data.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sessions Table Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-foreground/90 px-1 flex items-center gap-2">
                                <History className="w-4 h-4 text-muted-foreground" />
                                Recent Sessions
                            </h3>
                        </div>
                        
                        <div className="glass-card-premium rounded-2xl overflow-hidden shadow-xl border border-white/5 bg-black/20 p-1">
                            <SessionList 
                                sessions={sessions} 
                                loading={loading} 
                                onSelectSession={setSelectedSessionId} 
                                onDeleteSession={handleDeleteSession}
                            />
                        </div>
                    </div>

                    <CreateSessionModal 
                        open={showCreateModal} 
                        onOpenChange={setShowCreateModal}
                        onSuccess={handleSessionCreated}
                    />
                </FeatureGate>
            </div>
        </UserLayout>
    );
};

export default Backtesting;
