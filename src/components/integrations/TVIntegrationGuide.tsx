import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, ExternalLink, ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const TVIntegrationGuide: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [copiedPayload, setCopiedPayload] = useState(false);

    const webhookUrl = `${window.location.protocol}//${window.location.host}/api/integrations/tradingview/webhook`;
    const token = user?.tv_webhook_token || "LOADING_TOKEN...";

    const alertPayloadTemplate = {
        ticker: "{{ticker}}",
        action: "buy", // or sell, close
        price: "{{close}}",
        volume: 0.1,
        token: token,
        comment: "TV Alert"
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
        <div className="space-y-6">
            <Card className="bg-[#1e222d] border-white/10 text-white shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Zap className="w-24 h-24" />
                </div>
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Zap className="w-5 h-5 text-blue-500" />
                        </div>
                        <CardTitle className="text-xl font-bold">TradingView Auto-Sync</CardTitle>
                    </div>
                    <CardDescription className="text-white/60">
                        Automatically log your TradingView trades directly into JournalX.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Step 1: Webhook URL */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-[10px]">1</span>
                            Your Unique Webhook URL
                        </label>
                        <div className="flex gap-2">
                            <Input 
                                readOnly 
                                value={webhookUrl} 
                                className="bg-black/20 border-white/10 text-white/70 font-mono text-xs"
                            />
                            <Button 
                                variant="secondary" 
                                size="icon"
                                onClick={() => copyToClipboard(webhookUrl, setCopiedUrl)}
                                className="bg-white/10 hover:bg-white/20 shrink-0"
                            >
                                {copiedUrl ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Step 2: Payload Template */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-[10px]">2</span>
                            Alert Message Content (JSON)
                        </label>
                        <div className="relative group">
                            <pre className="p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-xs text-blue-400 overflow-x-auto">
                                {JSON.stringify(alertPayloadTemplate, null, 2)}
                            </pre>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => copyToClipboard(JSON.stringify(alertPayloadTemplate, null, 2), setCopiedPayload)}
                                className="absolute top-2 right-2 bg-white/5 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                {copiedPayload ? <Check className="w-3 h-3 mr-2 text-green-500" /> : <Copy className="w-3 h-3 mr-2" />}
                                Copy JSON
                            </Button>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            How to set up on TradingView
                        </h4>
                        <ol className="text-sm text-white/70 space-y-2 list-decimal list-inside">
                            <li>Open your chart on TradingView and click <span className="text-white font-bold text-xs bg-white/10 px-1 rounded">Alert</span>.</li>
                            <li>Set your condition (e.g., Price Crossing or Strategy Signal).</li>
                            <li>Go to the <span className="text-white font-bold">Notifications</span> tab and check <span className="text-blue-500">Webhook URL</span>.</li>
                            <li>Paste the URL from Step 1 above.</li>
                            <li>In the <span className="text-white font-bold">Settings</span> tab, paste the JSON payload into the <span className="text-white">Message</span> box.</li>
                        </ol>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button variant="link" className="text-blue-500 text-xs gap-1 h-auto p-0 hover:text-blue-400" asChild>
                            <a href="https://www.tradingview.com/support/solutions/43000529348-about-webhooks/" target="_blank" rel="noreferrer">
                                View official TradingView docs <ExternalLink className="w-3 h-3" />
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TVIntegrationGuide;
