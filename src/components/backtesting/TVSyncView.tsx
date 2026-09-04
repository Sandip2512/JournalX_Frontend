import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Copy, Check, ExternalLink, ShieldCheck, 
    Zap, Loader2, Link as LinkIcon, AlertTriangle 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface TVSyncViewProps {
    session: any;
}

export const TVSyncView: React.FC<TVSyncViewProps> = ({ session }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [copiedPayload, setCopiedPayload] = useState(false);

    const webhookUrl = `${window.location.protocol}//${window.location.host}/api/integrations/tradingview/webhook`;
    const token = (user as any)?.tv_webhook_token || "LOADING_TOKEN...";

    const alertPayloadTemplate = {
        ticker: "{{ticker}}",
        action: "buy", // or sell, close
        price: "{{close}}",
        volume: 0.1,
        token: token,
        comment: `BT Session: ${session.strategy_name}`
    };

    const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast({
            title: "Copied!",
            description: "Ready to paste into TradingView.",
        });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 p-2">
            {/* Connection Status Card */}
            <div className="flex flex-col xl:flex-row gap-8">
                <div className="flex-1 relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-primary/20 rounded-[1.5rem] blur opacity-50"></div>
                    <div className="relative h-full bg-[#0d0f14] border border-white/5 rounded-[1.5rem] overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700">
                            <Zap className="w-48 h-48 text-blue-500" />
                        </div>
                        
                        <div className="p-8 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                                        <LinkIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-foreground tracking-tight">Bridge Active</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <div className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                            </div>
                                            <span className="text-[10px] font-black text-blue-400/80 uppercase tracking-widest leading-none">Socket Connected</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-blue-500" />
                                        Your Target Webhook
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl font-mono text-xs text-blue-400/90 truncate">
                                            {webhookUrl}
                                        </div>
                                        <Button 
                                            variant="secondary" 
                                            size="icon"
                                            onClick={() => copyToClipboard(webhookUrl, setCopiedUrl)}
                                            className="bg-white/5 hover:bg-white/10 shrink-0 h-10 w-10 border border-white/5 rounded-xl transition-all"
                                        >
                                            {copiedUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-purple-500" />
                                        Alert Message Payload
                                    </label>
                                    <div className="relative group/code">
                                        <pre className="p-6 bg-black/40 rounded-2xl border border-white/5 font-mono text-[11px] text-foreground/70 overflow-x-auto leading-relaxed shadow-inner">
                                            <code className="text-purple-400/90">{JSON.stringify(alertPayloadTemplate, null, 2)}</code>
                                        </pre>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => copyToClipboard(JSON.stringify(alertPayloadTemplate, null, 2), setCopiedPayload)}
                                            className="absolute top-4 right-4 bg-white/5 hover:bg-white/10 opacity-0 group-hover/code:opacity-100 transition-all text-[10px] rounded-lg border border-white/5"
                                        >
                                            {copiedPayload ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />}
                                            Copy JSON
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:w-full xl:w-[320px] space-y-6">
                    <div className="p-8 rounded-[1.5rem] bg-white/[0.02] border border-white/5 space-y-6">
                        <h3 className="text-xs font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            Fast Connect
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-foreground/40 border border-white/5">01</span>
                                <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
                                    Open your <strong className="text-foreground">TradingView</strong> chart and create a new <strong className="text-foreground">Alert</strong>.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-foreground/40 border border-white/5">02</span>
                                <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
                                    In <strong className="text-foreground">Notifications</strong>, paste your Target Webhook URL.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-foreground/40 border border-white/5">03</span>
                                <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
                                    In <strong className="text-foreground">Settings</strong>, paste the Payload into the Message box.
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-3">
                                <AlertTriangle className="w-4 h-4 text-emerald-500 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter mb-1">PRO TIP</p>
                                    <p className="text-[10px] text-emerald-500/60 leading-relaxed font-medium">
                                        Use "Once Per Bar Close" settings to ensure trade alerts are final and accurate.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <a 
                        href="https://www.tradingview.com/support/solutions/43000529348-about-webhooks/" 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-center w-full p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-colors text-[10px] font-black text-muted-foreground uppercase tracking-widest gap-2"
                    >
                        Official Guide <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>

            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative glass-card-premium p-12 rounded-2xl border border-white/5 bg-black/40 flex flex-col items-center justify-center text-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary animate-pulse">
                            <Zap className="w-5 h-5 truncate" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-foreground tracking-tight">Listening for Market Pulsar</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2 leading-relaxed opacity-60">
                            Once you trigger an alert on TradingView, your trade signals will flash here with zero latency.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-75" />
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-150" />
                    </div>
                </div>
            </div>
        </div>
    );
};

