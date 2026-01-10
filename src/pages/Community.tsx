import React from "react";
import { MessageSquare, Users, Trophy, Radio, ArrowRight, Search, Command } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const Community: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background relative flex flex-col">
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
                <Header />
            </div>

            <main className="container max-w-6xl mx-auto py-8 px-4">
                {/* Search Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Community</h1>
                        <p className="text-muted-foreground mt-1">Thu, Jan 8</p>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search..." className="pl-9 pr-12 bg-muted/50 border-transparent focus:bg-background focus:border-primary/20" />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none text-muted-foreground">
                            <Command className="h-3 w-3" />
                            <span className="text-[10px]">K</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Featured Card - Traders Lounge */}
                    <div className="lg:col-span-2">
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => navigate("/community/lounge")}
                            className="h-full cursor-pointer"
                        >
                            <Card className="h-full p-8 border-border/50 bg-gradient-to-br from-background to-muted/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6">
                                    <div className="flex items-center gap-2 text-xs font-medium text-green-500 bg-green-500/10 px-3 py-1 rounded-full">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span>3 Online now</span>
                                    </div>
                                </div>

                                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-300">
                                    <MessageSquare className="w-8 h-8 text-white" />
                                </div>

                                <h2 className="text-2xl font-bold mb-3">Traders Lounge</h2>
                                <p className="text-muted-foreground leading-relaxed max-w-lg mb-8">
                                    Connect with traders worldwide. Share insights, discuss markets, and learn from the community in real time.
                                </p>

                                <div className="flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                                    <span>Enter the lounge</span>
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Sidebar Cards */}
                    <div className="space-y-4">
                        {/* Friends */}
                        <Card className="p-4 border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Friends</h3>
                                    <p className="text-sm text-muted-foreground">0 connections</p>
                                </div>
                            </div>
                        </Card>

                        {/* Leaderboard */}
                        <Card className="p-4 border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group" onClick={() => navigate("/leaderboard")}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                                    <Trophy className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Leaderboard</h3>
                                    <p className="text-sm text-muted-foreground">View top traders</p>
                                </div>
                            </div>
                        </Card>

                        {/* Trade Rooms */}
                        <Card className="p-4 border-border/50 opacity-60">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                                        <Radio className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Trade Rooms</h3>
                                        <p className="text-sm text-muted-foreground">Private rooms for strategies</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground uppercase">Soon</span>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Community;
