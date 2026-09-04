import React from 'react';
import { TradingRules } from '@/services/onboardingService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, ShieldAlert, Target, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface RuleComplianceCardProps {
    rules: TradingRules | null;
    recentTrades: any[];
}

export function RuleComplianceCard({ rules, recentTrades }: RuleComplianceCardProps) {
    if (!rules) return null;

    // Calculate simple compliance stats from recent trades (if flags exist)
    const ruleFollowedCount = recentTrades.filter(t => t.followed_rules === true).length;
    const totalWithFlags = recentTrades.filter(t => t.followed_rules !== undefined).length || 1;
    const complianceRate = Math.round((ruleFollowedCount / totalWithFlags) * 100);

    return (
        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between">
                    Monthly Rules
                    {complianceRate >= 80 ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    ) : (
                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1">
                   <div className="flex justify-between text-xs mb-1">
                       <span className="text-slate-300">Discipline Score</span>
                       <span className={complianceRate >= 80 ? "text-emerald-400" : "text-amber-400"}>{complianceRate}%</span>
                   </div>
                   <Progress value={complianceRate} className="h-1.5" />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-slate-950 p-2 rounded border border-slate-800/50">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Risk/Trade</p>
                        <p className="text-sm font-semibold text-white">{rules.max_risk_per_trade}%</p>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800/50">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Daily Loss</p>
                        <p className="text-sm font-semibold text-white">{rules.max_daily_loss}%</p>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800/50">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Trades/Day</p>
                        <p className="text-sm font-semibold text-white">{rules.max_trades_per_day}</p>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800/50">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Target R:R</p>
                        <p className="text-sm font-semibold text-white">{rules.risk_reward}</p>
                    </div>
                </div>

                <div className="flex items-start gap-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-[11px] text-blue-200/70">
                    <Info className="w-3.5 h-3.5 mt-0.5 text-blue-400" />
                    <p>Compliance is auto-tracked for every journaled trade.</p>
                </div>
            </CardContent>
        </Card>
    );
}
