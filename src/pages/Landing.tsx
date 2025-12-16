import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart2, BookOpen, Target, ArrowRight, Shield, Zap } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { AuthDialog } from "@/components/auth/AuthDialog";

const Landing = () => {
    const { isAuthenticated } = useAuth();
    const [showAuth, setShowAuth] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Track scroll for header effect if we wanted to change header style
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Redirect authenticated users to dashboard
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100/50 text-slate-900 overflow-x-hidden">
            <Header />

            {/* Auth Modal */}
            <AuthDialog open={showAuth} onOpenChange={setShowAuth} />

            <main className="flex flex-col relative">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10 h-[800px] mask-gradient-to-b" />

                {/* Hero Section */}
                <section className="container mx-auto px-4 pt-32 pb-20 md:pt-40 md:pb-32 flex flex-col items-center text-center relative z-10">
                    <div className="max-w-4xl space-y-8 animate-fade-in flex flex-col items-center">
                        <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-50/50 px-4 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur-sm transition-transform hover:scale-105 cursor-default">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                            JournalX v1.0 — Now Open for Traders
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 leading-tight">
                            Master your <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-teal-600">mindset.</span><br />
                            <span className="relative">
                                Simplify your edge.
                                {/* Decorative underline */}
                                <svg className="absolute w-full h-3 -bottom-1 left-0 text-emerald-400 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                                </svg>
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
                            The calm, minimal trading journal designed to stop self-sabotage.
                            Focus on execution, psychology, and consistent growth.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 w-full sm:w-auto">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white rounded-full px-10 py-7 text-lg h-auto shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group"
                                onClick={() => setShowAuth(true)}
                            >
                                Start Journaling Free
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full sm:w-auto border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white hover:border-slate-300 rounded-full px-10 py-7 text-lg h-auto transition-all"
                            >
                                Watch Demo
                            </Button>
                        </div>
                    </div>

                    {/* Mockup Preview */}
                    <div className="mt-24 w-full max-w-6xl relative animate-fade-up opacity-0" style={{ animationDelay: '0.3s' }}>
                        {/* Glow effect behind */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-2xl -z-10" />

                        <div className="rounded-2xl bg-slate-900/5 p-2 shadow-2xl ring-1 ring-slate-900/10 backdrop-blur-3xl">
                            <div className="rounded-xl bg-white aspect-[16/10] overflow-hidden border border-slate-200/60 shadow-inner flex flex-col">
                                {/* Mockup Header */}
                                <div className="h-14 border-b border-slate-100 flex items-center px-6 gap-4 bg-slate-50/50">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                        <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                                        <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                                    </div>
                                    <div className="h-6 w-32 bg-slate-200/50 rounded-md" />
                                    <div className="flex-1" />
                                    <div className="h-8 w-8 rounded-full bg-slate-200/50" />
                                </div>
                                {/* Mockup Content */}
                                <div className="flex-1 flex bg-slate-50/30">
                                    {/* Sidebar */}
                                    <div className="w-64 border-r border-slate-100 bg-white hidden md:flex flex-col p-4 gap-3">
                                        <div className="h-8 w-full bg-emerald-500/10 rounded-md" />
                                        <div className="h-8 w-3/4 bg-slate-100 rounded-md" />
                                        <div className="h-8 w-5/6 bg-slate-100 rounded-md" />
                                        <div className="mt-auto h-12 w-full bg-slate-100/50 rounded-md" />
                                    </div>
                                    {/* Main Area */}
                                    <div className="flex-1 p-8 grid grid-cols-3 gap-6">
                                        {/* Chart 1: Premium SVG Area Chart */}
                                        <div className="col-span-3 lg:col-span-2 h-64 bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-center mb-4 z-10">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Equity Curve</span>
                                                    <span className="text-lg font-bold text-slate-900 font-mono">+$24,500.00</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="px-2 py-0.5 rounded-full bg-emerald-100/50 text-emerald-600 text-[10px] font-bold border border-emerald-100">Live</div>
                                                </div>
                                            </div>

                                            {/* Beautiful Area Chart */}
                                            <div className="flex-1 w-full relative">
                                                <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible preserve-3d">
                                                    <defs>
                                                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                                        </linearGradient>
                                                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                                            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#10b981" floodOpacity="0.3" />
                                                        </filter>
                                                    </defs>

                                                    {/* Grid lines */}
                                                    <line x1="0" y1="10" x2="100" y2="10" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2" />
                                                    <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2" />
                                                    <line x1="0" y1="30" x2="100" y2="30" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2" />

                                                    {/* The Chart Path */}
                                                    <path
                                                        d="M0,35 C10,32 20,38 30,25 C40,15 50,28 60,18 C70,10 80,15 90,5 L100,0 L100,40 L0,40 Z"
                                                        fill="url(#chartGradient)"
                                                    />
                                                    <path
                                                        d="M0,35 C10,32 20,38 30,25 C40,15 50,28 60,18 C70,10 80,15 90,5 L100,0"
                                                        fill="none"
                                                        stroke="#10b981"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        filter="url(#shadow)"
                                                        className="drop-shadow-sm"
                                                    />

                                                    {/* Interactive Dots (Mock) */}
                                                    <circle cx="30" cy="25" r="1.5" fill="white" stroke="#10b981" strokeWidth="1.5" />
                                                    <circle cx="60" cy="18" r="1.5" fill="white" stroke="#10b981" strokeWidth="1.5" />
                                                    <circle cx="90" cy="5" r="2.5" fill="#10b981" stroke="white" strokeWidth="1" className="animate-pulse" />
                                                </svg>
                                            </div>

                                            <div className="flex justify-between mt-1 pt-2 border-t border-slate-50 text-[10px] text-slate-400 font-medium">
                                                <span>09:30</span><span>10:30</span><span>11:30</span><span>12:30</span><span>13:30</span><span>14:30</span>
                                            </div>
                                        </div>

                                        {/* Win/Loss Donut Chart */}
                                        <div className="col-span-3 lg:col-span-1 h-64 bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col justify-center items-center relative overflow-hidden hover:shadow-md transition-shadow">
                                            <span className="absolute top-6 left-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Win Ratio</span>
                                            <div className="relative w-32 h-32">
                                                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                                    <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                                                    <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="12" fill="none" strokeDasharray="251.2" strokeDashoffset="80" strokeLinecap="round" className="drop-shadow-sm" />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-2xl font-bold text-slate-900">68%</span>
                                                    <span className="text-[10px] text-emerald-600 font-medium">+2.4%</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 mt-6 text-xs">
                                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-slate-600">Wins</span></div>
                                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-200" /><span className="text-slate-600">Losses</span></div>
                                            </div>
                                        </div>

                                        {/* Row 2: Insights, Performance, P&L */}
                                        {/* AI Insights */}
                                        <div className="col-span-3 lg:col-span-1 h-40 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-sm p-6 flex flex-col justify-between text-white relative overflow-hidden group hover:scale-[1.02] transition-transform">
                                            <div className="absolute top-0 right-0 p-3 opacity-10"><Zap className="w-16 h-16" /></div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                                <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">AI Insight</span>
                                            </div>
                                            <p className="text-sm font-medium leading-relaxed text-slate-200">
                                                "You trade best on <span className="text-white border-b border-indigo-400/50">Tuesdays</span> between 10am-12pm. Avoid trading after a loss &gt; $500."
                                            </p>
                                        </div>

                                        {/* Daily Performance Bars */}
                                        <div className="col-span-3 lg:col-span-1 h-40 bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col justify-end gap-2 group hover:border-slate-200 transition-colors">
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-auto">Daily P&L</span>
                                            <div className="flex items-end justify-between h-20 gap-1.5">
                                                {[60, 40, -20, 80, 30, -10, 90].map((h, i) => (
                                                    <div key={i} className="w-full relative group/bar">
                                                        <div
                                                            className={`w-full rounded-sm transition-all duration-500 ${h >= 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}
                                                            style={{ height: `${Math.abs(h)}%` }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Net P&L Card */}
                                        <div className="col-span-3 lg:col-span-1 h-40 bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col justify-center group hover:border-slate-200 transition-colors">
                                            <div className="text-sm font-medium text-slate-500 mb-2">Net Profit</div>
                                            <div className="text-3xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors font-mono tracking-tight">+$12,450</div>
                                            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                                <TrendingUp className="w-3 h-3" /> <span>+12.5% this month</span>
                                            </div>
                                        </div>

                                        {/* Row 3: Recent Trades */}
                                        <div className="col-span-3 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col p-6 overflow-hidden relative">
                                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex justify-between">
                                                <span>Recent Trades</span>
                                                <span className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">View All</span>
                                            </div>
                                            <div className="space-y-3 relative">
                                                {[
                                                    { s: 'AAPL', p: '+$450.00', t: 'Long', c: 'text-emerald-600' },
                                                    { s: 'TSLA', p: '-$120.00', t: 'Short', c: 'text-rose-500' },
                                                    { s: 'NVDA', p: '+$890.00', t: 'Long', c: 'text-emerald-600' }
                                                ].map((t, i) => (
                                                    <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 px-2 -mx-2 rounded transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${t.c === 'text-emerald-600' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                            <span className="font-bold text-slate-700 font-mono">{t.s}</span>
                                                            <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{t.t}</span>
                                                        </div>
                                                        <span className={`${t.c} font-bold font-mono`}>{t.p}</span>
                                                    </div>
                                                ))}
                                                {/* Fade out bottom */}
                                                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Social Proof / Stats Strip */}
                <section className="bg-slate-900 py-12 text-white border-y border-slate-800">
                    <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-800/50">
                        <div>
                            <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">10k+</div>
                            <div className="text-slate-400 text-sm mt-1 uppercase tracking-wider">Trades Logged</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">Zero</div>
                            <div className="text-slate-400 text-sm mt-1 uppercase tracking-wider">Spreadsheet Hassle</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">100%</div>
                            <div className="text-slate-400 text-sm mt-1 uppercase tracking-wider">Private & Secure</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">24/7</div>
                            <div className="text-slate-400 text-sm mt-1 uppercase tracking-wider">Access Anywhere</div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-white py-32 border-b border-slate-100 relative">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/50 -z-10 skew-x-12 opacity-50" />

                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-6">Clarity over complexity</h2>
                            <p className="text-xl text-slate-500 leading-relaxed">
                                Most journals are glorified spreadsheets. JournalX is an intelligent coach that helps you stop making the same mistakes.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                            {[
                                { icon: BookOpen, title: "Effortless Logging", desc: "Input trades in seconds with a keyboard-first interface designed for speed." },
                                { icon: BarChart2, title: "Clean Analytics", desc: "Visualize your equity curve, win rate, and drawdown without the clutter." },
                                { icon: Target, title: "Goal Tracking", desc: "Set monthly targets and enforce daily loss limits to protect your capital." },
                                { icon: TrendingUp, title: "Psychology First", desc: "Track emotions and mistake patterns, not just entry and exit prices." }
                            ].map((feature, i) => (
                                <div key={i} className="group p-8 rounded-3xl bg-slate-50 hover:bg-white transition-all duration-300 border border-slate-100 hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-900/5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <feature.icon className="w-24 h-24 text-emerald-500 rotate-12 transform translate-x-4 -translate-y-4" />
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-6 text-emerald-600 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 relative z-10">
                                        <feature.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10">{feature.title}</h3>
                                    <p className="text-slate-500 leading-relaxed relative z-10">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it Works (3 Steps) */}
                <section className="py-32 bg-slate-50 relative overflow-hidden">
                    {/* Decorative blobs */}
                    <div className="absolute top-1/4 left-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl -z-10" />
                    <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-10" />

                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-2xl mx-auto mb-20">
                            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-6">How JournalX works</h2>
                            <p className="text-xl text-slate-500">The loop that turns amateurs into professionals.</p>
                        </div>

                        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                            {/* Connector Line (Desktop) */}
                            <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-slate-200 via-emerald-200 to-slate-200 -z-10" />

                            {[
                                { step: "01", icon: Zap, title: "Log Your Day", desc: "Enter your trades and tag your emotions in under 2 minutes." },
                                { step: "02", icon: Shield, title: "Review Weekly", desc: "Use the Review Grid to spot profit leaks and winning streaks." },
                                { step: "03", icon: TrendingUp, title: "Refine Edge", desc: "Adjust your strategy based on data, not guesswork." }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center text-center group">
                                    <div className="w-32 h-32 rounded-full bg-white border-8 border-slate-50 flex items-center justify-center mb-8 shadow-xl shadow-slate-200 group-hover:-translate-y-2 transition-transform duration-500 relative">
                                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">{item.step}</div>
                                        <item.icon className="w-10 h-10 text-slate-700 group-hover:text-emerald-500 transition-colors duration-300" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
                                    <p className="text-slate-500 leading-relaxed max-w-xs">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-24 bg-white relative">
                    <div className="container mx-auto px-4">
                        <div className="bg-slate-900 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
                            {/* CTA Background Effects */}
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/40 via-slate-900 to-slate-900" />
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl opacity-50" />

                            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
                                    Ready to find your edge?
                                </h2>
                                <p className="text-xl text-slate-300 mb-8 max-w-lg mx-auto">
                                    Join JournalX today. Stop gambling, start trading.
                                </p>
                                <Button
                                    size="lg"
                                    className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-full px-12 py-8 text-xl h-auto shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
                                    onClick={() => setShowAuth(true)}
                                >
                                    Get Started Now
                                </Button>
                                <p className="text-slate-500 text-sm mt-8">No credit card required • Free plan available</p>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="bg-white py-12 border-t border-slate-100">
                    <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
                        <div className="flex justify-center gap-8 mb-8">
                            <span className="cursor-pointer hover:text-slate-600">Privacy</span>
                            <span className="cursor-pointer hover:text-slate-600">Terms</span>
                            <span className="cursor-pointer hover:text-slate-600">Contact</span>
                        </div>
                        <p>© 2025 JournalX. All rights reserved.</p>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default Landing;
