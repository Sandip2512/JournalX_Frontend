import React, { useRef, useState, useLayoutEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { useAuth } from "@/context/AuthContext";

interface Trade {
    trade_no: number;
    symbol: string;
    type: string;
    volume: number;
    price_open: number;
    price_close: number;
    net_profit: number;
    open_time: string;
    close_time?: string;
}

interface ShareTradeModalProps {
    trade: Trade;
    open: boolean;
    onClose: () => void;
}

type FormatKey = "story" | "post" | "landscape";

// Internal render size — always at this pixel resolution for canvas export
const CARD_BASE = { w: 1080, h: 1080 };

const FORMATS: Record<FormatKey, { label: string; w: number; h: number }> = {
    story: { label: "Story", w: 1080, h: 1920 },
    post: { label: "Post", w: 1080, h: 1080 },
    landscape: { label: "Landscape", w: 1920, h: 1080 },
};

// The actual card template (rendered at fixed px, then scaled for preview)
const CardTemplate: React.FC<{
    trade: Trade;
    username: string;
    format: FormatKey;
    isProfit: boolean;
}> = ({ trade, username, format, isProfit }) => {
    const isBuy = trade.type?.toUpperCase().includes("BUY");
    const pnl = trade.net_profit ?? 0;
    const formattedPnL = `${pnl >= 0 ? "+" : ""}$${Math.abs(pnl).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const tradeDate = trade.open_time
        ? new Date(trade.open_time).toLocaleDateString("en-GB") + " " +
        new Date(trade.open_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        : "";

    const { w, h } = FORMATS[format];
    const accent = isProfit ? "#22c55e" : "#ef4444";
    const accentDim = isProfit ? "rgba(34,197,94,0.13)" : "rgba(239,68,68,0.13)";

    // Padding percentage based on aspect
    const padPct = format === "landscape" ? "5%" : "9%";

    return (
        <div style={{
            width: w,
            height: h,
            background: "linear-gradient(135deg, #07070f 0%, #0d1117 50%, #0f1520 100%)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            padding: padPct,
            fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
            boxSizing: "border-box",
        }}>
            {/* Glow blobs */}
            <div style={{ position: "absolute", top: "-15%", right: "-10%", width: "55%", paddingBottom: "55%", borderRadius: "50%", background: accentDim, filter: "blur(80px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-15%", left: "-5%", width: "45%", paddingBottom: "45%", borderRadius: "50%", background: `rgba(99,102,241,0.08)`, filter: "blur(100px)", pointerEvents: "none" }} />

            {/* Triangle accent */}
            <div style={{ position: "absolute", top: 0, right: 0, width: "38%", height: "42%", overflow: "hidden" }}>
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
                    <polygon points="80,200 200,0 200,200" fill={accentDim.replace("0.13", "0.35")} />
                    <polygon points="120,200 200,30 200,200" fill={accentDim.replace("0.13", "0.18")} />
                </svg>
            </div>

            {/* Brand header */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: format === "story" ? "auto" : "7%" }}>
                <div style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", borderRadius: "14px", padding: "10px 16px", fontWeight: 900, fontSize: "20px", color: "white", fontFamily: "monospace", letterSpacing: "2px" }}>JX</div>
                <div>
                    <div style={{ color: "white", fontWeight: 800, fontSize: "22px", lineHeight: 1.1 }}>JournalX</div>
                    <div style={{ color: "rgba(255,255,255,0.38)", fontSize: "13px", letterSpacing: "2.5px", textTransform: "uppercase" }}>Track · Analyze · Master</div>
                </div>
            </div>

            {/* Main content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "16px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "14px" }}>Trade P&L</div>

                {/* Direction tags */}
                <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
                    <span style={{ background: isBuy ? "rgba(59,130,246,0.15)" : "rgba(251,146,60,0.15)", color: isBuy ? "#60a5fa" : "#fb923c", border: `1px solid ${isBuy ? "rgba(59,130,246,0.35)" : "rgba(251,146,60,0.35)"}`, borderRadius: "8px", padding: "5px 18px", fontSize: "17px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px" }}>
                        {trade.type}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "17px", fontWeight: 600 }}>{trade.volume} Lots</span>
                    <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "18px", fontWeight: 800, letterSpacing: "1px" }}>{trade.symbol}</span>
                </div>

                {/* Big P&L */}
                <div style={{ color: accent, fontWeight: 900, letterSpacing: "-2px", lineHeight: 1, marginBottom: "6px", display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: format === "landscape" ? "90px" : "80px" }}>{formattedPnL}</span>
                    <span style={{ fontSize: "32px", fontWeight: 500, opacity: 0.6, letterSpacing: "0px" }}>USD</span>
                </div>

                {/* Prices */}
                <div style={{ display: "flex", gap: "40px", marginTop: "30px" }}>
                    <div>
                        <div style={{ color: "rgba(255,255,255,0.38)", fontSize: "14px", textTransform: "uppercase", letterSpacing: "2px" }}>Entry Price</div>
                        <div style={{ color: "white", fontWeight: 800, fontSize: "24px", fontVariantNumeric: "tabular-nums" }}>{trade.price_open}</div>
                    </div>
                    <div>
                        <div style={{ color: "rgba(255,255,255,0.38)", fontSize: "14px", textTransform: "uppercase", letterSpacing: "2px" }}>Exit Price</div>
                        <div style={{ color: "white", fontWeight: 800, fontSize: "24px", fontVariantNumeric: "tabular-nums" }}>{trade.price_close}</div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: format === "story" ? "5%" : "4%", borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: format === "story" ? "auto" : undefined }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "18px", fontWeight: 900, flexShrink: 0 }}>
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "16px", fontWeight: 700 }}>{username}</div>
                        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px" }}>{tradeDate}</div>
                    </div>
                </div>
                <div style={{ color: "rgba(255,255,255,0.18)", fontSize: "14px", letterSpacing: "2px", textTransform: "uppercase" }}>JournalX</div>
            </div>
        </div>
    );
};

export const ShareTradeModal: React.FC<ShareTradeModalProps> = ({ trade, open, onClose }) => {
    const { user } = useAuth();
    const [format, setFormat] = useState<FormatKey>("post");
    const [isExporting, setIsExporting] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    const isProfit = (trade.net_profit ?? 0) >= 0;
    const username = `${user?.first_name || ""}${user?.last_name || ""}`.trim() || user?.email?.split("@")[0] || "Trader";
    const { w, h } = FORMATS[format];

    // Recalculate scale whenever format or container size changes
    useLayoutEffect(() => {
        if (!containerRef.current) return;
        const obs = new ResizeObserver(() => {
            if (containerRef.current) {
                const cw = containerRef.current.clientWidth;
                const ch = containerRef.current.clientHeight;
                const sx = cw / w;
                const sy = ch / h;
                setScale(Math.min(sx, sy, 1));
            }
        });
        obs.observe(containerRef.current);
        return () => obs.disconnect();
    }, [format, w, h]);

    const exportImage = async (action: "download" | "share") => {
        if (!cardRef.current) return;
        setIsExporting(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: null,
                width: w,
                height: h,
                windowWidth: w,
                windowHeight: h,
            });

            const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
            if (!blob) return;
            const file = new File([blob], `JournalX_${trade.symbol}_${trade.trade_no}.png`, { type: "image/png" });

            if (action === "share" && navigator.share && navigator.canShare?.({ files: [file] })) {
                await navigator.share({ files: [file], title: `${trade.symbol} Trade`, text: `My ${trade.symbol} trade: ${trade.net_profit >= 0 ? "+" : ""}$${Math.abs(trade.net_profit).toFixed(2)} on JournalX!` });
            } else {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = file.name;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error("Export failed:", err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg border-white/10 bg-[#090912] max-h-screen overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white">
                        <Share2 className="w-4 h-4 text-blue-400" />
                        Share Trade
                    </DialogTitle>
                </DialogHeader>

                {/* Scaled preview container */}
                <div ref={containerRef} className="w-full flex items-center justify-center overflow-hidden" style={{ height: "280px", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
                    <div style={{ transform: `scale(${scale})`, transformOrigin: "center center", width: w, height: h, flexShrink: 0 }} ref={cardRef}>
                        <CardTemplate trade={trade} username={username} format={format} isProfit={isProfit} />
                    </div>
                </div>

                {/* Format selector */}
                <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(FORMATS) as FormatKey[]).map((key) => (
                        <button
                            key={key}
                            onClick={() => setFormat(key)}
                            className={`py-2 px-1 rounded-xl border text-center transition-all ${format === key ? "border-blue-500 bg-blue-500/10 text-blue-400 font-bold" : "border-white/10 bg-white/5 text-white/50 hover:text-white hover:border-white/20"}`}
                        >
                            <div className="text-sm font-semibold capitalize">{FORMATS[key].label}</div>
                            <div className="text-[10px] opacity-60">{FORMATS[key].w}×{FORMATS[key].h}</div>
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white" onClick={() => exportImage("download")} disabled={isExporting}>
                        <Download className="w-4 h-4" />
                        {isExporting ? "Exporting..." : "Download"}
                    </Button>
                    <Button className="flex-1 gap-2 bg-blue-600 hover:bg-blue-500 text-white" onClick={() => exportImage("share")} disabled={isExporting}>
                        <Share2 className="w-4 h-4" />
                        Share
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
