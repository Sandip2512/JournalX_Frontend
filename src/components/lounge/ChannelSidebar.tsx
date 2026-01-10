import React from "react";
import { Hash, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChannelSidebarProps {
    className?: string;
}

const channels = [
    { name: "general", type: "text", active: true },
    { name: "announcements", type: "text", active: false },
    { name: "wins-and-losses", type: "text", active: false },
    { name: "market-analysis", type: "text", active: false },
    { name: "resources", type: "text", active: false },
    { name: "voice-lounge", type: "voice", active: false },
];

export const ChannelSidebar: React.FC<ChannelSidebarProps> = ({ className }) => {
    return (
        <div className={cn("w-60 bg-muted/30 border-r border-border/40 flex flex-col h-full", className)}>
            <div className="p-4 border-b border-border/40 h-14 flex items-center">
                <h2 className="font-bold text-sm tracking-tight">Traders Lounge</h2>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-6">
                <div>
                    <div className="px-4 text-[10px] uppercase font-bold text-muted-foreground/70 mb-2 tracking-wider">
                        Text Channels
                    </div>
                    <div className="space-y-0.5 px-2">
                        {channels.filter(c => c.type === "text").map((channel) => (
                            <div
                                key={channel.name}
                                className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer transition-colors group",
                                    channel.active
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            >
                                <Hash className="w-4 h-4 opacity-50" />
                                <span>{channel.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="px-4 text-[10px] uppercase font-bold text-muted-foreground/70 mb-2 tracking-wider">
                        Voice Channels
                    </div>
                    <div className="space-y-0.5 px-2">
                        {channels.filter(c => c.type === "voice").map((channel) => (
                            <div
                                key={channel.name}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors group"
                            >
                                <Volume2 className="w-4 h-4 opacity-50" />
                                <span>{channel.name}</span>
                            </div>
                        ))}
                    </div>
                    {/* Beta Badge */}
                    <div className="mt-2 px-4">
                        <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded border border-blue-500/20">
                            Voice Coming Soon
                        </span>
                    </div>
                </div>
            </div>

            {/* User Mini Profile (Optional footer) */}
            {/* <div className="p-3 bg-background/50 border-t border-border/40">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20" />
                    <div className="text-xs font-medium">You</div>
                </div>
            </div> */}
        </div>
    );
};
