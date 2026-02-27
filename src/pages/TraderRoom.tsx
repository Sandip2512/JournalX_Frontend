import React, { useState, useEffect } from "react";
import UserLayout from "@/components/layout/UserLayout";
import { ArrowLeft, Monitor, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RoomLobby } from "@/components/trader-room/RoomLobby";
import { ActiveScreenShare } from "@/components/trader-room/ActiveScreenShare";
import { RoomControls } from "@/components/trader-room/RoomControls";
import { ParticipantsStrip } from "@/components/trader-room/ParticipantsStrip";
import { RoomChat, ChatMessage } from "@/components/trader-room/RoomChat";
import { Participant } from "@/components/trader-room/ParticipantsStrip";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import Peer from "peerjs";

const TraderRoom = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const meetingId = searchParams.get("meetingId");

    // -- 1. All State Declarations at the Top --
    const [roomState, setRoomState] = useState<"lobby" | "active">("lobby");
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [isMuted, setIsMuted] = useState(false);

    // Media & Streaming State
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
    const [remoteScreenStream, setRemoteScreenStream] = useState<MediaStream | null>(null);
    const [remoteCameraStream, setRemoteCameraStream] = useState<MediaStream | null>(null);

    const [peer, setPeer] = useState<Peer | null>(null);
    const [outgoingScreenCall, setOutgoingScreenCall] = useState<any>(null);
    const [incomingScreenCall, setIncomingScreenCall] = useState<any>(null);
    const [outgoingCameraCall, setOutgoingCameraCall] = useState<any>(null);
    const [incomingCameraCall, setIncomingCameraCall] = useState<any>(null);
    const [dataConn, setDataConn] = useState<any>(null);

    // Participant & Name State
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [otherUser, setOtherUser] = useState<any>(null);
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [remoteHandRaised, setRemoteHandRaised] = useState(false);

    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: "1", sender: "System", text: "Secure link established. Waiting for participants...", type: "text", timestamp: new Date(), color: "text-emerald-500" },
    ]);

    // Reactions Overlay State
    const [activeReactions, setActiveReactions] = useState<{ id: number, emoji: string }[]>([]);
    const [remoteMuted, setRemoteMuted] = useState(false);

    // Refs for PeerJS listeners (to avoid stale closures)
    const videoStreamRef = React.useRef<MediaStream | null>(null);
    const screenStreamRef = React.useRef<MediaStream | null>(null);

    const [isLocalSpeaking, setIsLocalSpeaking] = useState(false);
    const [isRemoteSpeaking, setIsRemoteSpeaking] = useState(false);

    useEffect(() => { videoStreamRef.current = videoStream; }, [videoStream]);
    useEffect(() => { screenStreamRef.current = screenStream; }, [screenStream]);

    // Refs for synchronization to avoid stale closures in PeerJS event listeners
    const isMutedRef = React.useRef(isMuted);
    const isHandRaisedRef = React.useRef(isHandRaised);
    const participantsRef = React.useRef(participants);

    useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
    useEffect(() => { isHandRaisedRef.current = isHandRaised; }, [isHandRaised]);
    useEffect(() => { participantsRef.current = participants; }, [participants]);

    // -- 2. Helper Functions --
    const setupDataConnection = (conn: any) => {
        if (!conn) return;

        // TIE-BREAKER: If both peers connect at the same time, we keep the one initiated by the peer with the lexicographically smaller ID.
        // This ensures both sides deterministically choose the SAME single connection to keep.
        const myId = user?.user_id || '';
        const otherId = conn.peer;

        if (dataConn?.open) {
            if (myId < otherId) {
                console.log(`[DataConn] I am the primary peer (${myId} < ${otherId}). Keeping my outgoing connection, rejecting incoming from ${otherId}.`);
                conn.close();
                return;
            } else {
                console.log(`[DataConn] Replacing existing connection with new one from ${otherId} (${myId} > ${otherId}).`);
                dataConn.close();
            }
        }

        console.log(`[DataConn] Setting up connection to ${conn.peer}...`);

        conn.on('open', () => {
            console.log(`[DataConn] Connection OPEN with ${conn.peer}`);
            setDataConn(conn);
            // Handshake: Sync current state immediately upon connection using REFS
            conn.send({ type: 'hand-sync', raised: isHandRaisedRef.current });
            conn.send({ type: 'mute-sync', isMuted: isMutedRef.current });
        });

        conn.on('data', (data: any) => {
            console.log(`[DataConn] Received:`, data.type);
            if (data.type === 'chat') {
                const incomingMsg: ChatMessage = {
                    ...data.message,
                    timestamp: new Date(data.message.timestamp)
                };
                setMessages(prev => [...prev, incomingMsg]);
                if (!isChatOpen) {
                    setIsChatOpen(true);
                    toast.info(`New message from ${incomingMsg.sender}`);
                }
            } else if (data.type === 'hand' || data.type === 'hand-sync') {
                setRemoteHandRaised(data.raised);
                if (data.type === 'hand' && data.raised) {
                    toast.info(`${participantsRef.current.find(p => p.id === conn.peer)?.name || 'Friend'} raised their hand ✋`);
                }
            } else if (data.type === 'reaction') {
                const newId = Date.now();
                setActiveReactions(prev => [...prev, { id: newId, emoji: data.emoji }]);
                setTimeout(() => {
                    setActiveReactions(prev => prev.filter(r => r.id !== newId));
                }, 3000);
            } else if (data.type === 'mute' || data.type === 'mute-sync') {
                setRemoteMuted(data.isMuted);
                if (data.type === 'mute' && data.isMuted) {
                    const friendName = participantsRef.current.find(p => p.id === conn.peer)?.name || 'Friend';
                    toast.info(`${friendName} is now muted`);
                }
            } else if (data.type === 'screen-ended') {
                setRemoteScreenStream(null);
                toast.info(`${participantsRef.current.find(p => p.id === conn.peer)?.name || 'Friend'} stopped sharing their screen`);
            }
        });

        conn.on('error', (err: any) => {
            console.error(`[DataConn] Error (${conn.peer}):`, err);
            setDataConn(null);
        });

        conn.on('close', () => {
            console.log(`[DataConn] Closed (${conn.peer})`);
            setDataConn(null);
        });
    };

    const handleToggleHand = () => {
        const newState = !isHandRaised;
        setIsHandRaised(newState);
        if (dataConn && dataConn.open) {
            dataConn.send({ type: 'hand', raised: newState });
        } else {
            console.warn("[DataConn] Cannot send hand raise: connection not open");
        }
    };

    const handleJoin = (mId?: string) => {
        if (mId) {
            setSearchParams({ meetingId: mId });
        }
        setRoomState("active");
        toast.success("Entered Secure Room");
    };

    // -- 3. Effects --

    // Initialize Peer
    useEffect(() => {
        if (!user || roomState !== "active") return;

        const newPeer = new Peer(user.user_id, {
            host: '0.peerjs.com',
            port: 443,
            secure: true
        });

        newPeer.on('open', (id) => {
            console.log('Peer connected with ID:', id);
        });

        newPeer.on('connection', (conn) => {
            console.log('Incoming data connection...');
            setupDataConnection(conn);
        });

        newPeer.on('error', (err) => {
            console.error('Core Peer Error:', err);
            if (err.type === 'peer-unavailable') {
                console.warn('Destination peer not found. Will retry via effect...');
                setOutgoingCameraCall(null);
                setOutgoingScreenCall(null);
            } else if (err.type === 'disconnected') {
                toast.error('Peer connection lost. Reconnecting...');
                newPeer.reconnect();
            } else {
                toast.error(`Meeting connection error: ${err.type}`);
            }
        });

        newPeer.on('call', (call) => {
            const streamType = call.metadata?.type || 'screen';
            const localStream = streamType === 'camera' ? videoStreamRef.current : screenStreamRef.current;
            console.log(`[INCOMING] Answering ${streamType} call (local stream: ${!!localStream})...`);

            call.answer(localStream || undefined);

            let callStream: MediaStream | null = null;

            call.on('stream', (stream) => {
                console.log(`[INCOMING] Received ${streamType} stream.`);
                callStream = stream;
                if (streamType === 'camera') {
                    setRemoteCameraStream(stream);
                } else {
                    setRemoteScreenStream(stream);
                }
            });

            call.on('close', () => {
                console.log(`[INCOMING] ${streamType} call closed.`);
                if (streamType === 'camera') {
                    setRemoteCameraStream(prev => prev === callStream ? null : prev);
                    setIncomingCameraCall(null);
                } else {
                    setRemoteScreenStream(prev => prev === callStream ? null : prev);
                    setIncomingScreenCall(null);
                }
            });

            call.on('error', (err) => {
                console.error(`[INCOMING] ${streamType} call error:`, err);
                if (streamType === 'camera') {
                    setRemoteCameraStream(prev => prev === callStream ? null : prev);
                    setIsRemoteSpeaking(false);
                    setIncomingCameraCall(null);
                }
            });

            if (streamType === 'camera') {
                setIncomingCameraCall(call);
            } else {
                setIncomingScreenCall(call);
            }
        });

        setPeer(newPeer);

        return () => {
            newPeer.destroy();
        };
    }, [user, roomState]);

    // Connect to other user for data when both are ready + AUTO RETRY
    useEffect(() => {
        let retryInterval: any;

        const attemptConnection = () => {
            if (peer && otherUser?.user_id && !dataConn?.open) {
                console.log('[DataConn] Periodically attempting connection to:', otherUser.user_id);
                const conn = peer.connect(otherUser.user_id, {
                    reliable: true
                });
                setupDataConnection(conn);
            }
        };

        // Initial attempt
        attemptConnection();

        // Background retry loop
        retryInterval = setInterval(attemptConnection, 10000); // 10s retry

        return () => {
            if (retryInterval) clearInterval(retryInterval);
        };
    }, [peer, otherUser?.user_id, !!dataConn?.open]);

    // Consolidate Auto-initiate Camera call
    useEffect(() => {
        let retryTimeout: any;

        if (peer && otherUser?.user_id && videoStream && !outgoingCameraCall) {
            console.log('[OUTGOING] Initiating camera call to:', otherUser.user_id);
            try {
                const call = peer.call(otherUser.user_id, videoStream, { metadata: { type: 'camera' } });
                setOutgoingCameraCall(call);

                let callStream: MediaStream | null = null;
                call.on('stream', (stream) => {
                    console.log('[OUTGOING] Received return camera stream');
                    callStream = stream;
                    setRemoteCameraStream(stream);
                });

                call.on('close', () => {
                    console.log('[OUTGOING] Camera call closed');
                    setRemoteCameraStream(prev => prev === callStream ? null : prev);
                    setOutgoingCameraCall(null);
                });

                call.on('error', (err) => {
                    console.error("[OUTGOING] Camera call error:", err);
                    setRemoteCameraStream(prev => prev === callStream ? null : prev);
                    // Add delay before clearing to prevent rapid loops
                    retryTimeout = setTimeout(() => setOutgoingCameraCall(null), 3000);
                });
            } catch (err) {
                console.error("Failed to initiate camera call", err);
                retryTimeout = setTimeout(() => setOutgoingCameraCall(null), 3000);
            }
        }

        return () => clearTimeout(retryTimeout);
    }, [peer, otherUser?.user_id, videoStream, outgoingCameraCall]);

    // Consolidate Auto-initiate Screen call
    useEffect(() => {
        let retryTimeout: any;

        if (peer && otherUser?.user_id && screenStream && !outgoingScreenCall) {
            console.log('[OUTGOING] Initiating screen call to:', otherUser.user_id);
            try {
                const call = peer.call(otherUser.user_id, screenStream, { metadata: { type: 'screen' } });
                setOutgoingScreenCall(call);

                let callStream: MediaStream | null = null;
                call.on('stream', (stream) => {
                    console.log('[OUTGOING] Received return screen stream');
                    callStream = stream;
                    setRemoteScreenStream(stream);
                });

                call.on('close', () => {
                    console.log('[OUTGOING] Screen call closed');
                    setRemoteScreenStream(prev => prev === callStream ? null : prev);
                    setOutgoingScreenCall(null);
                });

                call.on('error', (err) => {
                    console.error("[OUTGOING] Screen call error:", err);
                    setRemoteScreenStream(prev => prev === callStream ? null : prev);
                    retryTimeout = setTimeout(() => setOutgoingScreenCall(null), 3000);
                });
            } catch (err) {
                console.error("Failed to initiate screen call", err);
                retryTimeout = setTimeout(() => setOutgoingScreenCall(null), 3000);
            }
        }

        return () => clearTimeout(retryTimeout);
    }, [peer, otherUser?.user_id, screenStream, outgoingScreenCall]);

    // Audio Analysis Effect for Remote Speaker
    useEffect(() => {
        if (!remoteCameraStream || remoteMuted) {
            setIsRemoteSpeaking(false);
            return;
        }

        let audioContext: AudioContext;
        let analyser: AnalyserNode;
        let source: MediaStreamAudioSourceNode;
        let animationFrame: number;

        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            source = audioContext.createMediaStreamSource(remoteCameraStream);
            source.connect(analyser);

            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const checkVolume = () => {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;
                setIsRemoteSpeaking(average > 30); // Threshold for "speaking"
                animationFrame = requestAnimationFrame(checkVolume);
            };

            checkVolume();
        } catch (e) {
            console.error("Audio analysis failed", e);
        }

        return () => {
            if (animationFrame) cancelAnimationFrame(animationFrame);
            if (audioContext) audioContext.close();
        };
    }, [remoteCameraStream, remoteMuted]);

    useEffect(() => {
        if (!user) return;

        const myParticipant = {
            id: user.user_id,
            name: "You",
            avatar: user.first_name?.[0] || "U",
            isMuted: isMuted,
            color: "bg-primary"
        };

        if (otherUser) {
            setParticipants([
                {
                    ...myParticipant,
                    isMuted: isMuted,
                    isSpeaking: false // Local speaking logic can be added similarly
                },
                {
                    id: otherUser.user_id,
                    name: otherUser.name || `${otherUser.first_name} ${otherUser.last_name}`,
                    avatar: otherUser.first_name?.[0] || "?",
                    isSpeaking: isRemoteSpeaking,
                    isMuted: remoteMuted,
                    color: "bg-blue-500"
                }
            ]);
        } else {
            setParticipants([myParticipant]);
        }
    }, [user, isMuted, otherUser, remoteMuted, isRemoteSpeaking]);

    useEffect(() => {
        if (!meetingId || !user?.user_id) return;

        let isMounted = true;
        const fetchMeeting = async () => {
            try {
                const res = await api.get(`/api/friends/meeting/${meetingId}`);
                if (!isMounted) return;

                const otherId = res.data.host_id === user.user_id ? res.data.invitee_id : res.data.host_id;

                if (otherId) {
                    const userRes = await api.get(`/api/users/${otherId}/info`);
                    if (isMounted) setOtherUser(userRes.data);
                }

                // Auto-accept/join logic for invitee
                if (roomState === "lobby" && res.data.invitee_id === user.user_id && res.data.status === "pending") {
                    try {
                        await api.post(`/api/friends/meeting/${meetingId}/accept`);
                        if (isMounted) handleJoin();
                    } catch (e) { }
                }
            } catch (e) {
                console.error("Meeting info fetch failed", e);
            }
        };

        fetchMeeting();
        return () => { isMounted = false; };
    }, [meetingId, user?.user_id]); // Removed roomState to prevent re-runs on join

    // Cleanup on unmount only
    useEffect(() => {
        return () => {
            if (screenStream) screenStream.getTracks().forEach(t => t.stop());
            if (videoStream) videoStream.getTracks().forEach(t => t.stop());
            if (outgoingScreenCall) outgoingScreenCall.close();
            if (incomingScreenCall) incomingScreenCall.close();
            if (outgoingCameraCall) outgoingCameraCall.close();
            if (incomingCameraCall) incomingCameraCall.close();
            if (peer) peer.destroy();
        };
    }, []); // Only run on unmount

    const handleToggleScreenShare = async () => {
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
            setScreenStream(null);
            outgoingScreenCall?.close();
            setOutgoingScreenCall(null);
            toast.info("Screen sharing stopped");
        } else {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                setScreenStream(stream);

                // No inline call here anymore. The useEffect will pick up the stream change.
                toast.info("Preparing screen share...");

                stream.getVideoTracks()[0].onended = () => {
                    setScreenStream(null);
                    setOutgoingScreenCall(prev => {
                        prev?.close();
                        return null;
                    });
                    // Notify peer that our screen share ended
                    if (dataConn && dataConn.open) {
                        dataConn.send({ type: 'screen-ended' });
                    }
                    toast.info("Screen sharing stopped");
                };
                toast.success("Screen sharing active");
            } catch (err) {
                console.error("Error sharing screen:", err);
                toast.error("Failed to start screen share");
            }
        }
    };

    const handleToggleVideo = async () => {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            setVideoStream(null);
            outgoingCameraCall?.close();
            setOutgoingCameraCall(null);
            toast.info("Camera stopped");
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                setVideoStream(stream);

                // No inline call here. useEffect logic handles this robustly.
                toast.info("Connecting to peer...");

                toast.success("Camera active");
            } catch (err) {
                console.error("Error accessing camera:", err);
                toast.error("Camera access denied");
            }
        }
    };

    const handleToggleMute = () => {
        const nextMute = !isMuted;
        setIsMuted(nextMute);
        if (dataConn && dataConn.open) {
            dataConn.send({ type: 'mute', isMuted: nextMute });
        } else {
            console.warn("[DataConn] Mute sync skipped: connection not open");
            toast.warning("Mute not synced yet - still connecting to friend", { duration: 2000 });
        }
        toast.info(nextMute ? "Microphone muted" : "Microphone active");
    };

    const handleSendReaction = (emoji: string) => {
        const newId = Date.now();
        setActiveReactions(prev => [...prev, { id: newId, emoji }]);

        if (dataConn && dataConn.open) {
            dataConn.send({ type: 'reaction', emoji });
        } else {
            toast.warning("Connection not ready - syncing message to friend failed", { duration: 2000 });
        }

        // Local cleanup
        setTimeout(() => {
            setActiveReactions(prev => prev.filter(r => r.id !== newId));
        }, 3000);
    };


    const handleLeave = () => {
        if (window.confirm("Are you sure you want to leave the room?")) {
            // Stop media components
            screenStream?.getTracks().forEach(t => t.stop());
            videoStream?.getTracks().forEach(t => t.stop());
            setScreenStream(null);
            setVideoStream(null);

            // Close Peer connections/calls
            outgoingScreenCall?.close();
            incomingScreenCall?.close();
            outgoingCameraCall?.close();
            incomingCameraCall?.close();
            setOutgoingScreenCall(null);
            setIncomingScreenCall(null);
            setOutgoingCameraCall(null);
            setIncomingCameraCall(null);

            dataConn?.close();
            setDataConn(null);

            if (peer) {
                peer.destroy();
                setPeer(null);
            }

            setRoomState("lobby");
            toast.info("Session ended");
        }
    };

    const handleSendMessage = (text: string) => {
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: user?.first_name || "You",
            text,
            type: "text",
            timestamp: new Date(),
            color: "text-primary"
        };
        setMessages(prev => [...prev, newMessage]);

        // Sync with peer
        if (dataConn && dataConn.open) {
            dataConn.send({ type: 'chat', message: newMessage });
        } else {
            toast.warning("Chat message not synced - connection still establishing", { duration: 2000 });
        }
    };

    const handleShareStats = async () => {
        try {
            const res = await api.get(`/trades/stats/user/${user.user_id}`);
            const stats = res.data;
            const statsMessage: ChatMessage = {
                id: Date.now().toString(),
                sender: user?.first_name || "You",
                type: "stats",
                timestamp: new Date(),
                color: "text-primary",
                stats: {
                    roi: stats.roi || 0,
                    pnl: stats.net_profit || 0,
                    symbol: "PORTFOLIO",
                    direction: (stats.roi || 0) >= 0 ? "LONG" : "SHORT"
                }
            };
            setMessages(prev => [...prev, statsMessage]);

            // Sync with peer
            if (dataConn && dataConn.open) {
                dataConn.send({ type: 'chat', message: statsMessage });
            } else {
                toast.warning("Stats not synced - connection establishing", { duration: 2000 });
            }

            toast.success("Current Portfolio Stats Shared");
            if (!isChatOpen) setIsChatOpen(true);
        } catch (err) {
            toast.error("Failed to fetch current stats");
        }
    };

    return (
        <UserLayout showHeader={false}>
            {/* Height adjustment to fit within UserLayout's p-8 (2rem) padding without scrolling */}
            <div className="h-[calc(100vh-6rem)] w-full bg-[#0a0a0c] flex flex-col relative overflow-hidden rounded-3xl border border-white/5 shadow-2xl">

                {roomState === "lobby" ? (
                    <>
                        <div className="absolute top-6 left-6 z-10">
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/community")}
                                className="text-muted-foreground hover:text-white"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Exit to Community
                            </Button>
                        </div>
                        <RoomLobby onJoinRoom={handleJoin} />
                    </>
                ) : (
                    /* Active Room Layout */
                    <div className="flex-1 flex overflow-hidden">
                        {/* Main Stage */}
                        <div className="flex-1 relative flex flex-col bg-black/50 transition-all duration-300">
                            {/* Top Bar / Participants Overlay */}
                            <div className="absolute top-4 left-4 z-30">
                                <ParticipantsStrip participants={participants} />
                            </div>

                            {/* Center Content: Screen Share */}
                            <div className="flex-1 p-4 flex items-center justify-center pb-24">
                                <ActiveScreenShare
                                    sharerName={otherUser?.first_name || 'Friend'}
                                    screenStream={screenStream}
                                    remoteScreenStream={remoteScreenStream}
                                    cameraStream={videoStream}
                                    remoteCameraStream={remoteCameraStream}
                                />

                                {/* Raise Hand Indicators */}
                                <div className="absolute top-20 right-8 space-y-2 pointer-events-none">
                                    <AnimatePresence>
                                        {isHandRaised && (
                                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} className="bg-primary text-white p-2 rounded-lg flex items-center gap-2 shadow-lg">
                                                <Hand className="w-4 h-4" /> <span className="text-xs font-bold">You raised hand</span>
                                            </motion.div>
                                        )}
                                        {remoteHandRaised && (
                                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} className="bg-blue-500 text-white p-2 rounded-lg flex items-center gap-2 shadow-lg">
                                                <Hand className="w-4 h-4" /> <span className="text-xs font-bold">{otherUser?.first_name || 'Colleague'} raised hand</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar: Chat (Collapsible) */}
                        <AnimatePresence>
                            {isChatOpen && (
                                <motion.div
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 384, opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                                    className="border-l border-white/5 bg-[#0a0a0c] flex flex-col shadow-2xl z-20 overflow-hidden pb-20"
                                >
                                    <div className="w-96 flex-1 flex flex-col">
                                        <RoomChat
                                            messages={messages}
                                            onSendMessage={handleSendMessage}
                                            onClose={() => setIsChatOpen(false)}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Persistent Google Meet Controls */}
                        <RoomControls
                            onLeave={handleLeave}
                            onShareStats={handleShareStats}
                            isChatOpen={isChatOpen}
                            onToggleChat={() => setIsChatOpen(!isChatOpen)}
                            meetingId={meetingId || "Trade Session Sync"}

                            // Media Props
                            isScreenSharing={!!screenStream}
                            onToggleScreenShare={handleToggleScreenShare}
                            isVideoOn={!!videoStream}
                            onToggleVideo={handleToggleVideo}
                            isMuted={isMuted}
                            onToggleMute={handleToggleMute}

                            // Hand/Reaction Props
                            isHandRaised={isHandRaised}
                            onToggleHand={handleToggleHand}
                            onSendReaction={handleSendReaction}
                            isDataConnected={dataConn?.open}
                        />

                        {/* Floating Reactions Overlay */}
                        <div className="absolute inset-0 pointer-events-none z-50 flex items-end justify-center pb-32">
                            <AnimatePresence>
                                {activeReactions.map((reaction) => (
                                    <motion.div
                                        key={reaction.id}
                                        initial={{ y: 0, opacity: 1, scale: 0.5, x: (Math.random() - 0.5) * 100 }}
                                        animate={{ y: -400, opacity: 0, scale: 2, rotate: (Math.random() - 0.5) * 45 }}
                                        transition={{ duration: 2, ease: "easeOut" }}
                                        className="absolute text-4xl select-none"
                                    >
                                        {reaction.emoji}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </UserLayout>
    );
};

export default TraderRoom;
