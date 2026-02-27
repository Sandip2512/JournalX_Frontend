import React, { useRef, useEffect } from "react";
import { Maximize2, MoreHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActiveScreenShareProps {
    sharerName: string;
    screenStream?: MediaStream | null;     // Local screen
    cameraStream?: MediaStream | null;     // Local camera
    remoteScreenStream?: MediaStream | null;
    remoteCameraStream?: MediaStream | null;
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

        // Listen for track changes
        const onTrackAdded = () => {
            console.log(`[VideoStream] Track added/changed for ${name}`);
            play();
        };
        stream.addEventListener('addtrack', onTrackAdded);
        stream.addEventListener('removetrack', onTrackAdded);

        return () => {
            el.srcObject = null;
            el.onloadedmetadata = null;
            stream.removeEventListener('addtrack', onTrackAdded);
            stream.removeEventListener('removetrack', onTrackAdded);
        };
    }, [stream, name]);

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
        />
    );
};

export const ActiveScreenShare = React.memo(({
    sharerName,
    screenStream,
    cameraStream,
    remoteScreenStream,
    remoteCameraStream
}: ActiveScreenShareProps) => {
    const [isLocalPiPVisible, setIsLocalPiPVisible] = React.useState(true);
    const [isRemotePiPVisible, setIsRemotePiPVisible] = React.useState(true);

    // Stage stream: strictly for screen sharing (local or remote)
    const activeStream = screenStream || remoteScreenStream;


    // Re-show PiPs if new streams start
    useEffect(() => {
        if (cameraStream) setIsLocalPiPVisible(true);
    }, [cameraStream]);

    useEffect(() => {
        if (remoteCameraStream) setIsRemotePiPVisible(true);
    }, [remoteCameraStream]);

    const isShareActive = !!activeStream;

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
                    <VideoStream
                        stream={activeStream!}
                        name={screenStream ? "Your Screen" : `${sharerName}'s Screen`}
                    />
                ) : (
                    <div className="w-full h-full relative overflow-hidden">
                        <iframe
                            src="https://s.tradingview.com/widgetembed/?symbol=BINANCE%3ABTCUSDT&interval=1&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en"
                            className="absolute inset-0 w-full h-full border-none opacity-80"
                            title="Real-time Trade Chart"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent pointer-events-none" />
                    </div>
                )}

                {/* PiP Container (Floating on bottom right) */}
                <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-40">
                    {/* Remote Camera PiP */}
                    {remoteCameraStream && isRemotePiPVisible && (
                        <div className="w-48 aspect-video rounded-xl overflow-hidden border-2 border-primary shadow-2xl bg-black group/pip relative">
                            <VideoStream stream={remoteCameraStream} name={sharerName} />
                            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-0.5 rounded text-[10px] text-white">
                                {sharerName}
                            </div>
                            <button
                                onClick={() => setIsRemotePiPVisible(false)}
                                className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/80 rounded-full opacity-0 group-hover/pip:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3 text-white" />
                            </button>
                        </div>
                    )}

                    {/* Local Camera PiP */}
                    {cameraStream && isLocalPiPVisible && (
                        <div className="w-48 aspect-video rounded-xl overflow-hidden border-2 border-emerald-500/50 shadow-2xl bg-black group/pip relative">
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
            </div>

            {/* Watermark/Ticker */}
            {!isShareActive && (
                <div className="absolute bottom-4 left-6 pointer-events-none opacity-20 font-black text-2xl text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    BINANCE:BTCUSDT LIVE
                </div>
            )}
        </div>
    );
});
