import React from "react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Participant {
    id: string;
    name: string;
    avatar: string;
    isSpeaking?: boolean;
    isMuted?: boolean;
    color: string;
}

interface ParticipantsStripProps {
    participants: Participant[];
}

export const ParticipantsStrip = React.memo(({ participants }: ParticipantsStripProps) => {
    return (
        <div className="flex flex-col gap-4 p-4">
            {participants.map((p) => (
                <div key={p.id} className="relative group">
                    {/* Avatar Container */}
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg transition-all duration-300",
                        p.color,
                        p.isSpeaking ? "ring-2 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-110" : "opacity-80 group-hover:opacity-100"
                    )}>
                        {p.avatar}

                        {/* Speaking Indicator */}
                        {p.isSpeaking && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                        )}

                        {/* Mute Indicator */}
                        {p.isMuted && (
                            <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-0.5 border-2 border-[#0a0a0c]">
                                <MicOff className="w-2.5 h-2.5 text-white" />
                            </div>
                        )}

                        {/* Hover Name Tag */}
                        <div className="absolute left-full ml-4 bg-black/80 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            {p.name}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
});
