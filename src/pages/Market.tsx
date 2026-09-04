import React, { useState } from "react";
import UserLayout from "@/components/layout/UserLayout";
import EconomicCalendar from "./EconomicCalendar";
import MarketSessions from "./MarketSessions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Globe, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Market = () => {
    const [activeTab, setActiveTab] = useState("calendar");

    return (
        <UserLayout>
            <div className="space-y-6">
                {/* Market Tab Menu */}
                <div className="flex items-center justify-between">
                    <Tabs
                        defaultValue="calendar"
                        className="w-full"
                        onValueChange={setActiveTab}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <TabsList className="bg-muted/50 dark:bg-[#111114]/80 border border-border dark:border-white/5 p-1 h-12 rounded-xl">
                                <TabsTrigger
                                    value="calendar"
                                    className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_15px_rgba(11,102,228,0.4)] transition-all duration-300 gap-2"
                                >
                                    <Calendar className="w-4 h-4" />
                                    <span>Economic Calendar</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="sessions"
                                    className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_15px_rgba(11,102,228,0.4)] transition-all duration-300 gap-2"
                                >
                                    <Clock className="w-4 h-4" />
                                    <span>Market Sessions</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="news"
                                    disabled
                                    className="rounded-lg px-6 data-[state=active]:bg-primary transition-all duration-300 gap-2 opacity-50"
                                >
                                    <Zap className="w-4 h-4" />
                                    <span>Live News</span>
                                    <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded ml-1 font-bold">SOON</span>
                                </TabsTrigger>
                            </TabsList>

                            <div className="hidden md:flex items-center gap-4 text-xs font-medium text-muted-foreground mr-2">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    Live Market Data
                                </div>
                                <div className="h-4 w-[1px] bg-border" />
                                <div className="flex items-center gap-1.5">
                                    <Globe className="w-3.5 h-3.5" />
                                    Global Coverage
                                </div>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <TabsContent value="calendar" className="mt-0 border-none p-0 focus-visible:ring-0">
                                    <EconomicCalendar isNested={true} />
                                </TabsContent>

                                <TabsContent value="sessions" className="mt-0 border-none p-0 focus-visible:ring-0">
                                    <MarketSessions />
                                </TabsContent>
                            </motion.div>
                        </AnimatePresence>
                    </Tabs>
                </div>
            </div>
        </UserLayout>
    );
};

export default Market;
