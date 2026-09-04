import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingSetupData, onboardingService } from '@/services/onboardingService';
import { useToast } from '@/components/ui/use-toast';
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  User, 
  Shield, 
  Settings, 
  Sparkles, 
  Globe, 
  Zap, 
  Clock, 
  Target, 
  DollarSign, 
  Briefcase,
  Activity,
  Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const SESSIONS = [
  { id: 'London', label: 'London', time: '08:00 - 16:00 GMT', icon: Briefcase },
  { id: 'New York', label: 'New York', time: '13:00 - 21:00 GMT', icon: Globe },
  { id: 'Asian', label: 'Asian', time: '00:00 - 08:00 GMT', icon: Clock },
];

const POPULAR_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD',
  'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'XAU/USD', 'BTC/USD', 'ETH/USD'
];

export default function OnboardingWizard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Detect returning users via URL param (?mode=monthly) — avoids auth context timing issues
  const isReturningUser = new URLSearchParams(location.search).get('mode') === 'monthly';
  const [step, setStep] = useState(isReturningUser ? 3 : 1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<OnboardingSetupData>({
    rules: {
      max_risk_per_trade: 2,
      max_daily_loss: 5,
      max_trades_per_day: 3,
      max_losing_trades: 2,
      risk_reward: "1:2",
      sessions: [],
      pairs: []
    },
    preferences: {
      currency: "USD",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  });

  const handleNext = () => {
    // Returning users jump from step 3 directly to step 5 (summary), skipping preferences
    if (isReturningUser && step === 3) {
      handleSubmit(); // auto-submit then show summary
      return;
    }
    setStep(s => Math.min(s + 1, 5));
  };
  // Returning users can't navigate back past step 3
  const handlePrev = () => setStep(s => Math.max(s - 1, isReturningUser ? 3 : 1));
  
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await onboardingService.submitSetup(formData);
      
      if (user) {
        updateUser({ ...user, is_onboarding_completed: true });
      }

      // If returning user updating monthly rules, mark popup as dismissed for this month
      if (isReturningUser) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        localStorage.setItem('rules_dismissed_month', currentMonth);
      }
      
      toast({
        title: "Configuration Saved",
        description: "Your trading rules have been set!",
      });
      setStep(5); // Move to summary screen instead of redirecting
      
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      toast({
        title: "Setup Failed",
        description: typeof detail === 'string' ? detail : "Failed to complete setup. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateRule = (field: keyof typeof formData.rules, value: any) => {
    setFormData(prev => ({
      ...prev,
      rules: { ...prev.rules, [field]: value }
    }));
  };

  const updatePref = (field: keyof typeof formData.preferences, value: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [field]: value }
    }));
  };

  const toggleSession = (sessionId: string) => {
    const current = formData.rules.sessions;
    const next = current.includes(sessionId) 
      ? current.filter(id => id !== sessionId)
      : [...current, sessionId];
    updateRule('sessions', next);
  };

  const togglePair = (pair: string) => {
    const current = formData.rules.pairs;
    const next = current.includes(pair)
      ? current.filter(p => p !== pair)
      : [...current, pair];
    updateRule('pairs', next);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col items-center justify-center p-4 overflow-x-hidden font-sans relative">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150" />
      </div>

      <div className="w-full max-w-[480px] z-10">
        
        {/* Step Indicator — only show relevant steps */}
        <div className="mb-4 flex justify-center items-center gap-2">
            {(isReturningUser ? [3, 5] : [1, 2, 3, 4, 5]).map((i, idx) => (
                <div key={i} className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
                    step === i 
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                    : step > i 
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'bg-zinc-900 border border-white/5 text-zinc-600'
                )}>
                    {isReturningUser ? idx + 1 : i}
                </div>
            ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <Card className="border-white/5 bg-zinc-900/40 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.5)] overflow-hidden rounded-[32px] flex flex-col min-h-[520px] max-h-[90vh]">
              
              <div className="p-6 md:p-8 flex-1 overflow-hidden flex flex-col">
                {/* STEP 1: WELCOME */}
                {step === 1 && (
                  <div className="space-y-6 py-2">
                    <div className="text-center">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(37,99,235,0.1)]">
                           <Sparkles className="w-7 h-7 text-blue-500" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
                           Welcome to <span className="text-blue-500">JournalX</span>
                        </h1>
                        <p className="text-zinc-400 text-sm max-w-[280px] mx-auto leading-relaxed">
                           Let's set up your trading profile in just a few steps.
                        </p>
                    </div>

                    <div className="grid gap-3">
                        {[
                            { icon: User, title: 'Create Your Profile', sub: 'Set up your trader identity' },
                            { icon: Shield, title: 'Define Trading Rules', sub: 'Set your risk parameters' },
                            { icon: Settings, title: 'Configure Settings', sub: 'Set your currency and timezone' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/5 text-blue-400 flex items-center justify-center">
                                    <item.icon className="w-4 h-4" />
                                </div>
                                <div className="space-y-0">
                                    <h3 className="font-bold text-sm text-white/90">{item.title}</h3>
                                    <p className="text-[10px] text-zinc-500">{item.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button onClick={handleNext} className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-[0_8px_30px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-1">
                        Get Started <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                )}

                {/* STEP 2: PROFILE */}
                {step === 2 && (
                  <div className="space-y-8 py-2 max-w-sm mx-auto">
                    <div className="space-y-4 text-center">
                        <h2 className="text-3xl font-bold text-white">Create Your Profile</h2>
                        <p className="text-zinc-500">Tell us a bit about yourself</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <Avatar className="w-24 h-24 border-4 border-zinc-800 shadow-2xl mb-4">
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-3xl font-bold">
                                {user?.first_name?.[0]}{user?.last_name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-transparent p-0 h-auto font-medium">Change Photo</Button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Display Name *</Label>
                            <Input 
                                className="h-12 rounded-xl bg-zinc-950/50 border-white/5 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all text-base px-5"
                                value={user ? `${user.first_name} ${user.last_name}` : ''}
                                readOnly
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Bio (optional)</Label>
                            <textarea 
                                className="w-full min-h-[80px] rounded-xl bg-zinc-950/50 border-white/5 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all text-base px-5 py-3 resize-none outline-none"
                                placeholder="Tell us about your trading journey..."
                            />
                        </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: RULES (ADVANCED) */}
                {step === 3 && (
                  <div className="space-y-6 py-2 flex-1 overflow-hidden flex flex-col">
                    <div className="space-y-2 text-center flex-shrink-0">
                        <h2 className="text-2xl font-bold text-white">Your Trading Rules</h2>
                        <p className="text-zinc-500 text-sm">Set your risk management parameters</p>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-blue-400">
                                <Zap className="w-3.5 h-3.5 fill-blue-400/20" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Risk Parameters</span>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {/* Max Risk Per Trade */}
                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                                                <Target className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-xs text-zinc-200">Max Risk% / Trade</span>
                                        </div>
                                        <span className="text-lg font-black text-white">{formData.rules.max_risk_per_trade}%</span>
                                    </div>
                                    <Slider 
                                        value={[formData.rules.max_risk_per_trade]} 
                                        onValueChange={([v]) => updateRule('max_risk_per_trade', v)}
                                        max={10} step={0.25} min={0.25}
                                        className="py-4"
                                    />
                                    <div className="grid grid-cols-5 gap-1.5">
                                        {[0.5, 1, 2, 3, 5].map(v => (
                                            <Button 
                                                key={v} variant="outline" size="sm"
                                                onClick={() => updateRule('max_risk_per_trade', v)}
                                                className={cn("rounded-xl border-white/5 bg-zinc-950 text-xs px-4", formData.rules.max_risk_per_trade === v && "bg-blue-600 border-blue-500 text-white")}
                                            >
                                                {v}%
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Max Daily Loss */}
                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
                                                <Shield className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-xs text-zinc-200">Max Daily Loss%</span>
                                        </div>
                                        <span className="text-lg font-black text-white">{formData.rules.max_daily_loss}%</span>
                                    </div>
                                    <Slider 
                                        value={[formData.rules.max_daily_loss]} 
                                        onValueChange={([v]) => updateRule('max_daily_loss', v)}
                                        max={20} step={1} min={1}
                                        className="py-4"
                                    />
                                    <div className="grid grid-cols-4 gap-2">
                                        {[3, 5, 10, 15].map(v => (
                                            <Button 
                                                key={v} variant="outline" size="sm"
                                                onClick={() => updateRule('max_daily_loss', v)}
                                                className={cn("rounded-xl border-white/5 bg-zinc-950 text-xs flex-1", formData.rules.max_daily_loss === v && "bg-blue-600 border-blue-500 text-white")}
                                            >
                                                {v}%
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-blue-400">
                                <Target className="w-3.5 h-3.5 fill-blue-400/20" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Target Risk:Reward</span>
                            </div>
                            <ToggleGroup type="single" value={formData.rules.risk_reward} onValueChange={(v) => v && updateRule('risk_reward', v)} className="flex flex-wrap gap-4 justify-start">
                                {['1:1', '1:1.5', '1:2', '1:3', '1:4+'].map(rr => (
                                    <ToggleGroupItem 
                                        key={rr} value={rr}
                                        className="h-16 flex-1 min-w-[70px] bg-zinc-950 border border-white/5 rounded-2xl flex flex-col gap-1 items-center justify-center transition-all data-[state=on]:bg-blue-600 data-[state=on]:border-blue-400 hover:bg-white/[0.04]"
                                    >
                                        <span className="text-base font-black">{rr}</span>
                                        <span className="text-[10px] uppercase font-bold text-zinc-500 data-[state=on]:text-white/80">
                                            {rr === '1:1' ? 'Equal Edge' : rr === '1:2' ? 'Double Risk' : 'High Reward'}
                                        </span>
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-blue-400">
                                <Clock className="w-3.5 h-3.5 fill-blue-400/20" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Preferred Sessions</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {SESSIONS.map(session => (
                                    <div 
                                        key={session.id}
                                        onClick={() => toggleSession(session.id)}
                                        className={cn(
                                            "p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 group",
                                            formData.rules.sessions.includes(session.id)
                                            ? "bg-blue-600 border-blue-400 shadow-[0_10px_30px_rgba(37,99,235,0.25)]"
                                            : "bg-zinc-950 border-white/5 hover:border-white/20"
                                        )}
                                    >
                                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center transition-colors", formData.rules.sessions.includes(session.id) ? "bg-white/20" : "bg-blue-500/10 text-blue-400")}>
                                            <session.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">{session.label}</h4>
                                            <p className={cn("text-[9px]", formData.rules.sessions.includes(session.id) ? "text-white/70" : "text-zinc-500")}>{session.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                           <div className="flex items-center gap-2 text-blue-400">
                                <Activity className="w-4 h-4 fill-blue-400/20" />
                                <span className="text-xs font-black uppercase tracking-widest">Favorite Pairs / Assets</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {POPULAR_PAIRS.map(pair => (
                                    <Badge 
                                        key={pair}
                                        onClick={() => togglePair(pair)}
                                        className={cn(
                                            "cursor-pointer px-4 py-2 rounded-xl border-white/5 text-[10px] transition-all h-auto",
                                            formData.rules.pairs.includes(pair)
                                            ? "bg-blue-600 hover:bg-blue-500 text-white border-blue-400"
                                            : "bg-zinc-950 hover:bg-white/[0.04] text-zinc-400"
                                        )}
                                        variant="outline"
                                    >
                                        {pair}
                                        {formData.rules.pairs.includes(pair) && <CheckCircle2 className="w-3.5 h-3.5 ml-2" />}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: PREFERENCES */}
                {step === 4 && (
                  <div className="space-y-6 py-2">
                    <div className="space-y-2 text-center">
                        <h2 className="text-2xl font-bold text-white">Trading Preferences</h2>
                        <p className="text-zinc-500 text-sm">Customize your trading experience</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
                        <div className="space-y-4">
                            <div className="p-6 rounded-[24px] bg-zinc-950 border border-white/5 flex flex-col items-center gap-4 group hover:border-blue-500/50 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <div className="text-center space-y-1">
                                    <h4 className="font-bold text-lg">Currency</h4>
                                    <p className="text-[10px] text-zinc-500 leading-relaxed px-4">Your preferred display currency</p>
                                </div>
                                <Select onValueChange={(val) => updatePref('currency', val)} defaultValue={formData.preferences.currency}>
                                    <SelectTrigger className="h-12 rounded-xl bg-black border-white/10 text-base font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="INR">INR (₹)</SelectItem>
                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                        <SelectItem value="GBP">GBP (£)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-6 rounded-[24px] bg-zinc-950 border border-white/5 flex flex-col items-center gap-4 group hover:border-purple-500/50 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div className="text-center space-y-1">
                                    <h4 className="font-bold text-lg">Timezone</h4>
                                    <p className="text-[10px] text-zinc-500 leading-relaxed px-4">For accurate trade timestamps</p>
                                </div>
                                <Select onValueChange={(val) => updatePref('timezone', val)} defaultValue={formData.preferences.timezone}>
                                    <SelectTrigger className="h-12 rounded-xl bg-black border-white/10 text-base font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                        <SelectItem value="UTC">UTC (GMT)</SelectItem>
                                        <SelectItem value="America/New_York">New York</SelectItem>
                                        <SelectItem value="Europe/London">London</SelectItem>
                                        <SelectItem value="Asia/Kolkata">Mumbai</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: FINAL SUMMARY */}
                {step === 5 && (
                  isReturningUser ? (
                    /* ── RETURNING USER: Monthly Rules Confirmation ── */
                    <div className="space-y-6 py-2 flex flex-col items-center">
                      <div className="relative mb-2">
                          <motion.div 
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                              className="w-20 h-20 rounded-[28px] bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.15)]"
                          >
                              <CheckCircle2 className="w-10 h-10 text-green-500" />
                          </motion.div>
                          <motion.div
                              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.3, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-14 h-5 bg-green-500/20 blur-xl rounded-full"
                          />
                      </div>

                      <div className="text-center space-y-2">
                          <h2 className="text-2xl font-black text-white tracking-tight">Monthly Rules Set! 🎯</h2>
                          <p className="text-zinc-400 text-sm max-w-[300px] mx-auto leading-relaxed">
                              Your trading rules for this month have been saved. Stay disciplined!
                          </p>
                      </div>

                      {/* Rules Summary */}
                      <div className="w-full bg-white/[0.02] border border-white/5 rounded-[24px] overflow-hidden">
                          <div className="px-4 py-3 bg-white/[0.02] flex items-center gap-2 border-b border-white/5">
                              <Zap className="w-3.5 h-3.5 text-blue-400" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">This Month's Rules</span>
                          </div>

                          <div className="p-4 grid grid-cols-2 gap-3">
                              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                      <Target className="w-3 h-3 text-red-400" />
                                      <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Risk / Trade</span>
                                  </div>
                                  <p className="text-xl font-black text-white">{formData.rules.max_risk_per_trade}%</p>
                              </div>
                              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                      <Shield className="w-3 h-3 text-orange-400" />
                                      <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Daily Loss</span>
                                  </div>
                                  <p className="text-xl font-black text-white">{formData.rules.max_daily_loss}%</p>
                              </div>
                              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                      <Activity className="w-3 h-3 text-blue-400" />
                                      <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Risk:Reward</span>
                                  </div>
                                  <p className="text-xl font-black text-white">{formData.rules.risk_reward}</p>
                              </div>
                              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                      <Clock className="w-3 h-3 text-purple-400" />
                                      <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Sessions</span>
                                  </div>
                                  <p className="text-xs font-black text-white">
                                      {formData.rules.sessions.length > 0 ? formData.rules.sessions.join(', ') : 'All Sessions'}
                                  </p>
                              </div>
                          </div>

                          {formData.rules.pairs.length > 0 && (
                              <div className="px-4 py-3 border-t border-white/5 flex items-center gap-2 flex-wrap">
                                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mr-1">Pairs:</span>
                                  {formData.rules.pairs.slice(0, 4).map(p => (
                                      <Badge key={p} className="bg-blue-600/10 text-blue-400 border-blue-500/20 text-[8px] h-5 px-2">{p}</Badge>
                                  ))}
                                  {formData.rules.pairs.length > 4 && (
                                      <span className="text-[9px] text-zinc-500">+{formData.rules.pairs.length - 4} more</span>
                                  )}
                              </div>
                          )}
                      </div>

                      <Button 
                          onClick={() => navigate('/dashboard')} 
                          className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-[0_8px_30px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.02] active:scale-95 mt-2"
                      >
                          Continue to Dashboard <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  ) : (
                    /* ── NEW USER: Full "You're All Set!" Rocket Screen ── */
                    <div className="space-y-6 py-2 flex flex-col items-center">
                      <div className="relative mb-4">
                          <motion.div 
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: [0, -10, 0], opacity: 1 }}
                              transition={{ 
                                  y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                                  opacity: { duration: 0.5 }
                              }}
                              className="w-20 h-20 rounded-[28px] bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.15)]"
                          >
                              <Rocket className="w-10 h-10 text-green-500 fill-green-500/10" />
                          </motion.div>
                          <motion.div 
                              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-green-500/20 blur-xl rounded-full"
                          />
                      </div>

                      <div className="text-center space-y-2 mb-2">
                          <h2 className="text-3xl font-black text-white tracking-tight">You're All Set!</h2>
                          <p className="text-zinc-400 text-sm max-w-[300px] mx-auto leading-relaxed">
                              Your trading profile is ready. Start tracking your trades and become a disciplined trader!
                          </p>
                      </div>

                      <div className="w-full bg-white/[0.02] border border-white/5 rounded-[24px] overflow-hidden">
                          <div className="p-4 flex items-center gap-4 bg-white/[0.02]">
                              <Avatar className="w-12 h-12 border-2 border-zinc-800">
                                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-sm font-bold">
                                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                                  </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                  <h4 className="font-bold text-sm text-white">{user?.first_name} {user?.last_name}</h4>
                                  <p className="text-[10px] text-zinc-500 italic">Ready to trade</p>
                              </div>
                              <Badge variant="outline" className="bg-zinc-950/50 border-white/5 text-[9px] h-6">
                                  <Globe className="w-3 h-3 mr-1 text-blue-400" /> Public
                              </Badge>
                          </div>

                          <div className="p-4 grid grid-cols-2 gap-3 border-t border-white/5">
                              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                                  <div className="flex items-center gap-2 text-red-400 mb-1">
                                      <Target className="w-3 h-3" />
                                      <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Risk per Trade</span>
                                  </div>
                                  <p className="text-lg font-black text-white">{formData.rules.max_risk_per_trade}%</p>
                              </div>
                              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                                  <div className="flex items-center gap-2 text-orange-400 mb-1">
                                      <Shield className="w-3 h-3" />
                                      <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Daily Loss Limit</span>
                                  </div>
                                  <p className="text-lg font-black text-white">{formData.rules.max_daily_loss}%</p>
                              </div>
                              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                                  <div className="flex items-center gap-2 text-blue-400 mb-1">
                                      <Zap className="w-3 h-3" />
                                      <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Risk:Reward</span>
                                  </div>
                                  <p className="text-lg font-black text-white">{formData.rules.risk_reward}</p>
                              </div>
                              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                                  <div className="flex items-center gap-2 text-purple-400 mb-1">
                                      <Clock className="w-3 h-3" />
                                      <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Timezone</span>
                                  </div>
                                  <p className="text-xs font-bold text-white truncate">{formData.preferences.timezone.split('/').pop()?.replace('_', ' ')}</p>
                              </div>
                          </div>

                          <div className="px-4 py-3 bg-black/40 border-t border-white/5 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px]">
                                      {formData.preferences.currency}
                                  </Badge>
                                  <span className="text-[10px] text-zinc-500">Default Currency</span>
                              </div>
                              <div className="flex items-center gap-1">
                                  {formData.rules.sessions.slice(0, 2).map(s => (
                                      <Badge key={s} className="bg-zinc-800 text-[8px] h-5 px-2">{s}</Badge>
                                  ))}
                              </div>
                          </div>
                      </div>

                      <Button 
                          onClick={() => navigate('/dashboard')} 
                          className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-[0_8px_30px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.02] active:scale-95 mt-2"
                      >
                          Enter Dashboard <Rocket className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  )
                )}
              </div>

              {/* ACTION BAR */}
              {step < 5 && (
                <div className="p-4 md:p-6 border-t border-white/5 bg-black/20 flex flex-col md:flex-row items-center justify-between gap-4">
                  <Button 
                      variant="outline" 
                      onClick={handlePrev}
                      disabled={step === 1 || isLoading}
                      className="text-zinc-500 hover:text-white border-white/5 hover:bg-white/5 rounded-xl h-11 px-6 font-bold text-sm"
                  >
                      <ChevronLeft className="w-4 h-4 mr-2" /> Back
                  </Button>

                  <div className="flex gap-1 order-first md:order-none">
                      {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={cn("h-1 transition-all duration-500 rounded-full", step >= i ? "bg-blue-600 w-6" : "bg-white/10 w-1.5")} />
                      ))}
                  </div>

                  {/* Determine if "Finish" should appear: step 4 for new users, step 3 for returning users */}
                  {(isReturningUser ? step < 3 : step < 4) ? (
                      <Button onClick={handleNext} disabled={isLoading} className="h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-8 font-bold text-sm shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1">
                          Continue <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                  ) : (
                      <Button 
                          onClick={isReturningUser && step === 3 ? handleNext : handleSubmit}
                          disabled={isLoading}
                          className="h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-8 font-bold text-sm shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1 w-full md:w-auto"
                      >
                          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                          Finish
                      </Button>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
