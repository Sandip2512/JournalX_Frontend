import React from "react";
import UserLayout from "@/components/layout/UserLayout";
import { ClipboardList, CheckCircle2, AlertCircle, BookOpen } from "lucide-react";

const DisciplineDiary = () => {
    return (
        <UserLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <ClipboardList className="w-8 h-8" />
                            </div>
                            <h1 className="text-3xl font-extrabold text-white">Discipline Diary</h1>
                        </div>
                        <p className="text-muted-foreground">Track your psychological state and rule adherence for every session.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="glass-card-premium p-8 rounded-3xl border border-border dark:border-white/5 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground dark:text-white">Rule Checklist</h3>
                                    <p className="text-sm text-muted-foreground">Did you follow your plan today?</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[
                                    "Wait for setup to complete",
                                    "Risk no more than 1% per trade",
                                    "No revenge trading",
                                    "Stick to session hours"
                                ].map((rule, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted dark:bg-white/5 border border-border dark:border-white/5">
                                        <div className="w-5 h-5 rounded border border-border dark:border-white/20" />
                                        <span className="text-sm text-foreground/80 dark:text-white/80">{rule}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card-premium p-8 rounded-3xl border border-white/5 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground dark:text-white">Psychology Log</h3>
                                    <p className="text-sm text-muted-foreground">Record your emotions and mindset.</p>
                                </div>
                            </div>

                            <div className="h-40 w-full rounded-2xl bg-muted dark:bg-white/5 border border-border dark:border-white/5 p-4 italic text-muted-foreground text-sm">
                                "Coming soon: A dedicated space to journal your mental state before, during, and after trades..."
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
};

export default DisciplineDiary;
