import React from "react";
import UserLayout from "@/components/layout/UserLayout";
import { Users2, ArrowLeft, Search, Plus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

const Friends = () => {
    const navigate = useNavigate();

    return (
        <UserLayout>
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-12 animate-fade-up">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
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
                            <h1 className="text-4xl font-black text-foreground dark:text-white tracking-tighter flex items-center gap-3">
                                <Users2 className="w-8 h-8 text-purple-500" />
                                Social <span className="text-purple-500 italic">Circle</span>
                            </h1>
                        </div>
                        <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em] ml-14">Your Private Trading Network</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search traders..."
                                className="bg-white/5 border-white/5 pl-10 rounded-xl focus:ring-purple-500"
                            />
                        </div>
                        <Button className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-6 font-black uppercase tracking-widest text-[10px] gap-2">
                            <Plus className="w-4 h-4" />
                            Add Friend
                        </Button>
                    </div>
                </div>

                {/* Focus Area */}
                <div className="glass-card-premium p-16 rounded-[2.5rem] border border-border dark:border-white/5 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />

                    <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center relative">
                        <Users2 className="w-12 h-12 text-purple-500" />
                        <div className="absolute inset-0 bg-purple-500/20 blur-[40px] rounded-full animate-pulse-slow" />
                    </div>

                    <div className="space-y-3 relative z-10">
                        <h2 className="text-3xl font-black text-foreground dark:text-white">Friends System Initializing</h2>
                        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
                            Soon you'll be able to follow other traders, send direct messages,
                            share private journal entries, and build your own trading accountability groups.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-muted dark:bg-white/5 rounded-2xl border border-border dark:border-white/5 max-w-md mx-auto relative z-10">
                        <Mail className="w-5 h-5 text-purple-500" />
                        <p className="text-xs text-muted-foreground font-medium">Get notified when social features launch in v2.0</p>
                        <Button variant="link" className="text-purple-500 font-black text-xs uppercase tracking-widest text-primary hover:text-primary/80">Enable</Button>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
};

export default Friends;
