import React from "react";
import UserLayout from "@/components/layout/UserLayout";
import { Monitor, ArrowLeft, Users, MessageSquare, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TraderRoom = () => {
    const navigate = useNavigate();

    return (
        <UserLayout>
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-12 animate-fade-up">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate("/community")}
                                className="rounded-xl hover:bg-white/5"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                                <Monitor className="w-8 h-8 text-emerald-500" />
                                Trader <span className="text-emerald-500 italic">Room</span>
                            </h1>
                        </div>
                        <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em] ml-14">Collaborative Strategy & Execution</p>
                    </div>
                </div>

                {/* Focus Area */}
                <div className="glass-card-premium p-12 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

                    <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center relative group">
                        <Monitor className="w-12 h-12 text-emerald-500 group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-emerald-500/20 blur-[40px] rounded-full animate-pulse-slow font-black" />
                    </div>

                    <div className="space-y-3 relative z-10">
                        <h2 className="text-3xl font-black text-white">Live Rooms Opening Soon</h2>
                        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
                            Join live trading sessions, watch pros execute their plan in real-time,
                            and participate in synchronized multi-trader analysis rooms.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4 relative z-10">
                        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl px-10 py-6 font-black uppercase tracking-widest text-xs gap-3 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                            <Play className="w-4 h-4 fill-current" />
                            Notify Me on Launch
                        </Button>
                        <Button variant="ghost" className="rounded-2xl px-8 py-6 font-black uppercase tracking-widest text-xs border border-white/5">
                            Learn More
                        </Button>
                    </div>

                    {/* Feature Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-12 mt-12 border-t border-white/5">
                        <div className="p-6 space-y-3">
                            <div className="text-emerald-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2 justify-center">
                                <Users className="w-4 h-4" />
                                Multi-Trader Sync
                            </div>
                            <p className="text-[11px] text-muted-foreground">Share your screen and charts with up to 100 traders simultaneously.</p>
                        </div>
                        <div className="p-6 space-y-3 border-x border-white/5">
                            <div className="text-emerald-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2 justify-center">
                                <MessageSquare className="w-4 h-4" />
                                Low-Latency Comms
                            </div>
                            <p className="text-[11px] text-muted-foreground">Voice and text chat optimized for high-speed trading environments.</p>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="text-emerald-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2 justify-center">
                                <Monitor className="w-4 h-4" />
                                Shared Analysis
                            </div>
                            <p className="text-[11px] text-muted-foreground">Interactive whiteboards for collaborative technical analysis sessions.</p>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
};

export default TraderRoom;
