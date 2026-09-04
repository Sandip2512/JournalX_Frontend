import React, { useEffect, useRef } from "react";
import { Send, TrendingUp, TrendingDown, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface ChatMessage {
    id: string;
    sender: string;
    text?: string;
    type: "text" | "stats";
    timestamp: Date;
    color: string;
    stats?: {
        roi: number;
        pnl: number;
        symbol: string;
        direction: "LONG" | "SHORT";
    };
}

interface RoomChatProps {
    messages: ChatMessage[];
    onSendMessage: (text: string) => void;
    onClose: () => void;
}

export const RoomChat = React.memo(({ messages, onSendMessage, onClose }: RoomChatProps) => {
    const [inputValue, setInputValue] = React.useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        onSendMessage(inputValue);
        setInputValue("");
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0c]/50 border-l border-white/5">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white uppercase tracking-wider">Room Chat</h3>
                    <span className="flex items-center gap-1.5 text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        LIVE
                    </span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-white" onClick={onClose}>
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1 p-4 h-0"> {/* h-0 forces flex calculation */}
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className="space-y-1 animate-fade-in-up">
                            {/* Message Header */}
                            <div className="flex items-baseline gap-2">
                                <span className={cn("text-xs font-bold", msg.color)}>{msg.sender}</span>
                                <span className="text-[9px] text-muted-foreground">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            {/* Message Content */}
                            {msg.type === "text" ? (
                                <p className="text-sm text-gray-300 break-words leading-relaxed">{msg.text}</p>
                            ) : (
                                /* Stats Card Embed - Optimized Compact Layout */
                                <div className="mt-1 bg-white/5 border border-white/10 rounded-lg p-2.5 space-y-1.5 hover:bg-white/10 transition-colors cursor-pointer group w-full max-w-[280px]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-[9px] font-black px-1.5 py-0.5 rounded",
                                                msg.stats?.direction === "LONG" ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"
                                            )}>
                                                {msg.stats?.direction}
                                            </span>
                                            <span className="font-bold text-xs text-white">{msg.stats?.symbol}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-1.5">
                                        <div>
                                            <div className="text-[8px] text-muted-foreground uppercase tracking-wider">ROI</div>
                                            <div className={cn("text-xs font-black", msg.stats!.roi >= 0 ? "text-emerald-500" : "text-red-500")}>
                                                {msg.stats!.roi > 0 ? "+" : ""}{msg.stats!.roi}%
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[8px] text-muted-foreground uppercase tracking-wider">P&L</div>
                                            <div className={cn("text-xs font-black", msg.stats!.pnl >= 0 ? "text-emerald-500" : "text-red-500")}>
                                                ${msg.stats!.pnl}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-white/5 bg-[#0a0a0c]">
                <div className="relative">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Message #room..."
                        className="bg-white/5 border-white/10 focus:border-emerald-500/50 pr-10 text-sm h-9"
                    />
                    <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-1 top-0.5 h-8 w-8 hover:bg-emerald-500/10 hover:text-emerald-500"
                        onClick={handleSend}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
});
