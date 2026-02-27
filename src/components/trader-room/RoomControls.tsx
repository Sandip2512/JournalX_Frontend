import React from "react";
import {
    Mic, MicOff, Video, VideoOff, ScreenShare, Share2,
    PhoneOff, UserPlus, BarChart2, MessageSquare,
    Hand, Smile, Info, Users, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface RoomControlsProps {
    onLeave: () => void;
    onShareStats: () => void;
    onToggleChat: () => void;
    isChatOpen: boolean;
    isScreenSharing: boolean;
    onToggleScreenShare: () => void;
    isVideoOn: boolean;
    onToggleVideo: () => void;
    isMuted: boolean;
    onToggleMute: () => void;
    // New Google Meet Style Props
    isHandRaised?: boolean;
    onToggleHand?: () => void;
    onSendReaction?: (emoji: string) => void;
    onShowInfo?: () => void;
    onShowParticipants?: () => void;
    meetingId?: string;
}

export const RoomControls = React.memo(({
    onLeave,
    onShareStats,
    onToggleChat,
    isChatOpen,
    isScreenSharing,
    onToggleScreenShare,
    isVideoOn,
    onToggleVideo,
    isMuted,
    onToggleMute,
    isHandRaised = false,
    onToggleHand,
    onSendReaction,
    onShowInfo,
    onShowParticipants,
    meetingId = "trade-room-sync"
}: RoomControlsProps) => {

    return (
        <div className="h-20 w-full bg-[#0a0a0c] border-t border-white/5 flex items-center justify-between px-8 z-40 absolute bottom-0 left-0 right-0 rounded-b-3xl">
            {/* Left section: Time and Meeting Info */}
            <div className="flex items-center gap-4 min-w-[200px]">
                <div className="text-white font-medium text-sm hidden md:block">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="w-px h-4 bg-white/20 hidden md:block" />
                <div className="text-white/70 text-sm font-medium tracking-tight truncate max-w-[120px]">
                    {meetingId}
                </div>
            </div>

            {/* Center section: Main Media Controls (Circular) */}
            <div className="flex items-center gap-3">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                variant={isMuted ? "destructive" : "secondary"}
                                onClick={onToggleMute}
                                className={cn(
                                    "rounded-full w-10 h-10 transition-all",
                                    isMuted ? "bg-red-500 hover:bg-red-600" : "bg-[#3c4043] hover:bg-[#434649] text-white border-none"
                                )}
                            >
                                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Mute (Ctrl+D)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                variant={!isVideoOn ? "destructive" : "secondary"}
                                onClick={onToggleVideo}
                                className={cn(
                                    "rounded-full w-10 h-10 transition-all",
                                    !isVideoOn ? "bg-red-500 hover:bg-red-600" : "bg-[#3c4043] hover:bg-[#434649] text-white border-none"
                                )}
                            >
                                {!isVideoOn ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Camera (Ctrl+E)</TooltipContent>
                    </Tooltip>

                    {/* Raise Hand */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                onClick={onToggleHand}
                                className={cn(
                                    "rounded-full w-10 h-10 transition-all border-none",
                                    isHandRaised ? "bg-primary text-white" : "bg-[#3c4043] hover:bg-[#434649] text-white"
                                )}
                            >
                                <Hand className={cn("w-5 h-5", isHandRaised && "animate-bounce")} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Raise Hand</TooltipContent>
                    </Tooltip>

                    {/* Reactions */}
                    <Tooltip>
                        <Popover>
                            <TooltipTrigger asChild>
                                <PopoverTrigger asChild>
                                    <Button
                                        size="icon"
                                        className="rounded-full w-10 h-10 bg-[#3c4043] hover:bg-[#434649] text-white border-none transition-all"
                                    >
                                        <Smile className="w-5 h-5" />
                                    </Button>
                                </PopoverTrigger>
                            </TooltipTrigger>
                            <PopoverContent
                                side="top"
                                align="center"
                                className="w-fit p-2 bg-[#1e1e24] border-white/10 rounded-full flex gap-1 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-200"
                            >
                                {["💖", "👍", "😂", "😮", "😢", "🔥", "🚀", "👏"].map((emoji) => (
                                    <button
                                        key={emoji}
                                        onClick={() => onSendReaction?.(emoji)}
                                        className="hover:scale-125 transition-transform p-1.5 focus:outline-none text-xl"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </PopoverContent>
                        </Popover>
                        <TooltipContent>Send Reaction</TooltipContent>
                    </Tooltip>

                    {/* Present Now (Screen Share) */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                onClick={onToggleScreenShare}
                                className={cn(
                                    "rounded-full w-10 h-10 transition-all border-none",
                                    isScreenSharing ? "bg-emerald-500 text-white" : "bg-[#3c4043] hover:bg-[#434649] text-white"
                                )}
                            >
                                <ScreenShare className="w-5 h-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Present now</TooltipContent>
                    </Tooltip>

                    {/* Share Stats */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                onClick={onShareStats}
                                className="rounded-full w-10 h-10 bg-[#3c4043] hover:bg-[#434649] text-white border-none transition-all"
                            >
                                <BarChart2 className="w-5 h-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Share P&L</TooltipContent>
                    </Tooltip>

                    {/* Leave Call */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="destructive"
                                onClick={onLeave}
                                className="rounded-full w-14 h-10 bg-red-500 hover:bg-red-600 transition-all ml-4"
                            >
                                <PhoneOff className="w-5 h-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Leave call</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Right section: Info, People, Chat */}
            <div className="flex items-center gap-2 min-w-[200px] justify-end">
                <Button variant="ghost" size="icon" onClick={onShowInfo} className="text-white/70 hover:text-white rounded-full">
                    <Info className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onShowParticipants} className="text-white/70 hover:text-white rounded-full">
                    <Users className="w-5 h-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleChat}
                    className={cn(
                        "rounded-full relative",
                        isChatOpen ? "text-primary bg-primary/10" : "text-white/70 hover:text-white"
                    )}
                >
                    <MessageSquare className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-[#0a0a0c]" />
                </Button>
            </div>
        </div>
    );
});
