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
    const [searchParams] = useSearchParams();
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

    // Refs for PeerJS listeners (to avoid stale closures)
    const videoStreamRef = React.useRef<MediaStream | null>(null);
    const screenStreamRef = React.useRef<MediaStream | null>(null);

    useEffect(() => { videoStreamRef.current = videoStream; }, [videoStream]);
    useEffect(() => { screenStreamRef.current = screenStream; }, [screenStream]);

    // -- 2. Helper Functions --
    const setupDataConnection = (conn: any) => {
        if (!conn) return;

        conn.on('open', () => {
            console.log('Data connection established');
            setDataConn(conn);
        });

        conn.on('data', (data: any) => {
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
            } else if (data.type === 'hand') {
                setRemoteHandRaised(data.raised);
                if (data.raised) {
                    toast.info(`${otherUser?.first_name || 'Friend'} raised their hand ✋`);
                }
            } else if (data.type === 'reaction') {
                // Future: Trigger floating animation
                toast.info(`${otherUser?.first_name || 'Friend'} sent a reaction`);
            }
        });

        conn.on('error', (err: any) => {
            console.error('Data connection error:', err);
            setDataConn(null);
        });

        conn.on('close', () => {
            setDataConn(null);
        });
    };

    const handleToggleHand = () => {
        const newState = !isHandRaised;
        setIsHandRaised(newState);
        if (dataConn && dataConn.open) {
            dataConn.send({ type: 'hand', raised: newState });
        }
    };

    const handleJoin = () => {
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

    // Connect to other user for data when both are ready
    useEffect(() => {
        if (peer && otherUser?.user_id && !dataConn) {
            console.log('Initiating data connection to:', otherUser.user_id);
            const conn = peer.connect(otherUser.user_id);
            setupDataConnection(conn);
        }
    }, [peer, otherUser, dataConn]);

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
                myParticipant,
                {
                    id: otherUser.user_id,
                    name: otherUser.name,
                    avatar: otherUser.first_name?.[0] || "?",
                    isSpeaking: false,
                    color: "bg-blue-500"
                }
            ]);
        } else {
            setParticipants([myParticipant]);
        }
    }, [user, isMuted, otherUser]);

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
        setIsMuted(!isMuted);
        toast.info(isMuted ? "Microphone active" : "Microphone muted");
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
                        />
                    </div>
                )}
            </div>
        </UserLayout>
    );
};

export default TraderRoom;
