import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Minimize2, Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendMessageToAI } from "@/services/api/chat";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Hello! I'm JournalX AI. \n\nI can help you with:\n• Trading Psychology 🧠\n• Platform Features 🚀\n• Subscription Pricing 💎\n\nHow can I assist your trading journey today?",
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            setTimeout(scrollToBottom, 100); // Small delay for animation
        }
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            const aiResponseText = await sendMessageToAI(userMessage.content);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: aiResponseText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Sorry, I encountered an error. Please try again later.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
            {/* Chat Window */}
            <div className={cn(
                "transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) transform origin-bottom-right",
                isOpen
                    ? "scale-100 opacity-100 translate-y-0 mb-4"
                    : "scale-90 opacity-0 translate-y-8 pointer-events-none h-0 mb-0"
            )}>
                <Card className="w-[330px] sm:w-[380px] h-[520px] shadow-2xl border-none flex flex-col overflow-hidden bg-slate-900/90 backdrop-blur-2xl ring-1 ring-white/10 dark:ring-white/5 rounded-3xl">

                    {/* Premium Header - More Compact */}
                    <div className="relative p-3 border-b border-white/5 bg-gradient-to-r from-slate-900 via-blue-900/20 to-slate-900 text-white">
                        <div className="relative flex flex-row items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-600/20 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.3)] ring-1 ring-blue-500/30">
                                    <Bot className="h-4 w-4 text-blue-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-slate-100">
                                        JournalX AI <Sparkles className="w-2.5 h-2.5 text-yellow-300 animate-pulse" />
                                    </CardTitle>
                                    <p className="text-[10px] text-slate-400 font-medium tracking-wide">ONLINE</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <Minimize2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <CardContent className="flex-1 p-0 overflow-hidden relative bg-gradient-to-b from-slate-900 to-slate-950">
                        {/* Subtle Grid Background */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                        <ScrollArea className="h-full px-3 py-4">
                            <div className="flex flex-col gap-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex w-full",
                                            msg.role === "user" ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        <div className={cn(
                                            "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300",
                                            msg.role === "user"
                                                ? "bg-blue-600 text-white rounded-br-sm shadow-[0_4px_12px_rgba(37,99,235,0.2)]"
                                                : "bg-slate-800/80 text-slate-200 border border-white/5 rounded-bl-sm backdrop-blur-sm"
                                        )}>
                                            <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                                            <span className={cn(
                                                "text-[9px] mt-1.5 block w-full text-right font-medium opacity-60",
                                                msg.role === "user" ? "text-blue-100" : "text-slate-400"
                                            )}>
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start w-full animate-in fade-in duration-300">
                                        <div className="bg-slate-800/80 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-[bounce_1.4s_infinite_-0.3s]"></span>
                                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-[bounce_1.4s_infinite_-0.15s]"></span>
                                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-[bounce_1.4s_infinite]"></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>
                    </CardContent>

                    {/* Input Area */}
                    <CardFooter className="p-3 bg-slate-950 border-t border-white/5">
                        <div className="flex w-full items-center gap-2 bg-slate-900/50 p-1 rounded-full border border-white/10 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                            <Input
                                placeholder="Message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0 px-3 h-9 text-[13px] text-slate-200 placeholder:text-slate-500"
                                disabled={isLoading}
                                autoComplete="off"
                            />
                            <Button
                                size="icon"
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                className={cn(
                                    "h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-all duration-300",
                                    (!inputValue.trim() || isLoading) && "opacity-50 scale-90"
                                )}
                            >
                                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 ml-0.5" />}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Floating Launcher Button */}
            <div className="relative group">
                {/* Pulse Glow Effect */}
                {!isOpen && (
                    <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-ping duration-1000 group-hover:duration-700 pointer-events-none" />
                )}
                <Button
                    size="lg"
                    className={cn(
                        "h-16 w-16 rounded-full shadow-[0_8px_30px_rgb(59,130,246,0.3)] transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)",
                        isOpen
                            ? "rotate-180 bg-slate-800 hover:bg-slate-900"
                            : "bg-gradient-to-br from-blue-600 to-indigo-600 hover:scale-110 hover:-translate-y-1"
                    )}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? (
                        <X className="h-7 w-7 text-white" />
                    ) : (
                        <MessageCircle className="h-8 w-8 text-white" />
                    )}
                </Button>

                {/* Tooltip hint when closed */}
                {!isOpen && (
                    <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg pointer-events-none">
                        Chat with JournalX AI
                        <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                    </div>
                )}
            </div>
        </div>
    );
}
