import React, { useRef, useEffect } from "react";
import { Maximize2, MoreHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActiveScreenShareProps {
    sharerName: string;
    screenStream?: MediaStream | null;     // Local screen
    cameraStream?: MediaStream | null;     // Local camera
    remoteScreenStream?: MediaStream | null;
    remoteCameraStreams?: Record<string, MediaStream | null>;
    remoteUsersInfo?: Record<string, any>;
}

const VideoStream = ({ stream, name, isLocal = false }: { stream: MediaStream, name: string, isLocal?: boolean }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
        const el = videoRef.current;
        if (!el || !stream) return;

        console.log(`[VideoStream] Setting stream for ${name}. Tracks:`, stream.getTracks().map(t => `${t.kind}:${t.readyState}`).join(', '));
        el.srcObject = stream;

        const play = () => {
            el.play().catch(err => {
                if (err.name !== 'AbortError') console.error(`[VideoStream] Error playing ${name}:`, err);
            });
        };

        el.onloadedmetadata = play;
        play();

        return () => {
            el.srcObject = null;
            el.onloadedmetadata = null;
        };
    }, [stream, name]);

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
        />
    );
};

export const ActiveScreenShare = React.memo(({
    sharerName,
    screenStream,
    cameraStream,
    remoteScreenStream,
    remoteCameraStreams = {},
    remoteUsersInfo = {}
}: ActiveScreenShareProps) => {
    const [isLocalPiPVisible, setIsLocalPiPVisible] = React.useState(true);
    const [hiddenRemotePiPs, setHiddenRemotePiPs] = React.useState<Record<string, boolean>>({});

    // Stage stream: strictly for screen sharing (local or remote)
    const activeStream = screenStream || remoteScreenStream;
    const isShareActive = !!activeStream;

    // Grid members: all remote participants + local
    const remotePeers = Object.keys(remoteUsersInfo);

    return (
        <div className="w-full h-full bg-[#0a0a0c] rounded-2xl border border-white/5 relative overflow-hidden flex flex-col group will-change-transform">
            {/* Header Overlay */}
            {isShareActive && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {screenStream ? "Your" : sharerName} Screen Share
                    </span>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 p-0 flex items-center justify-center relative overflow-hidden bg-black/90">
                {isShareActive ? (
                    // SCREEN SHARING MODE
                    <>
                        <VideoStream
                            stream={activeStream!}
                            name={screenStream ? "Your Screen" : `${sharerName}'s Screen`}
                        />

                        {/* PiP Container (Floating on bottom right) */}
                        <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-40 max-h-[80%] overflow-y-auto no-scrollbar">
                            {remotePeers.map(peerId => {
                                const stream = remoteCameraStreams[peerId];
                                if (!stream || hiddenRemotePiPs[peerId]) return null;
                                const name = remoteUsersInfo[peerId]?.first_name || "Trader";
                                return (
                                    <div key={peerId} className="w-48 aspect-video rounded-xl overflow-hidden border-2 border-primary shadow-2xl bg-black group/pip relative shrink-0">
                                        <VideoStream stream={stream} name={name} />
                                        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-0.5 rounded text-[10px] text-white">
                                            {name}
                                        </div>
                                        <button
                                            onClick={() => setHiddenRemotePiPs(prev => ({ ...prev, [peerId]: true }))}
                                            className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/80 rounded-full opacity-0 group-hover/pip:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3 text-white" />
                                        </button>
                                    </div>
                                );
                            })}

                            {cameraStream && isLocalPiPVisible && (
                                <div className="w-48 aspect-video rounded-xl overflow-hidden border-2 border-emerald-500/50 shadow-2xl bg-black group/pip relative shrink-0">
                                    <VideoStream stream={cameraStream} name="You" isLocal={true} />
                                    <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-0.5 rounded text-[10px] text-white">
                                        You (Preview)
                                    </div>
                                    <button
                                        onClick={() => setIsLocalPiPVisible(false)}
                                        className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/80 rounded-full opacity-0 group-hover/pip:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3 text-white" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    // GRID MODE (Google Meet style)
                    <div className={cn(
                        "w-full h-full p-6 grid gap-4",
                        remotePeers.length === 0 ? "grid-cols-1" :
                            remotePeers.length === 1 ? "grid-cols-1 md:grid-cols-2" :
                                "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    )}>
                        {/* Local Camera */}
                        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-xl group/card">
                            {cameraStream ? (
                                <VideoStream stream={cameraStream} name="You" isLocal={true} />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-500/10 to-transparent">
                                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-3xl font-black">
                                        YOU
                                    </div>
                                </div>
                            )}
                            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white border border-white/5">
                                You (Me)
                            </div>
                        </div>

                        {/* Remote Cameras */}
                        {remotePeers.map(peerId => {
                            const stream = remoteCameraStreams[peerId];
                            const info = remoteUsersInfo[peerId];
                            return (
                                <div key={peerId} className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-xl group/card">
                                    {stream ? (
                                        <VideoStream stream={stream} name={info?.first_name || "Trader"} />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-transparent">
                                            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-black italic">
                                                {info?.first_name?.[0].toUpperCase() || "T"}
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white border border-white/5">
                                        {info?.first_name} {info?.last_name}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* TradingView Mini Watermark */}
            {!isShareActive && (
                <div className="absolute top-4 right-4 z-20">
                    <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/5 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Market Live</span>
                    </div>
                </div>
            )}
        </div>
    );
});
