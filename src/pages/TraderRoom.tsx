import React, { useState, useEffect, useCallback, useMemo } from "react";
import UserLayout from "@/components/layout/UserLayout";
import { ArrowLeft, Monitor, Hand, Shield, Users } from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { UserPlus, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const TraderRoom = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const meetingId = searchParams.get("meetingId");

    // -- 1. All State Declarations at the Top --
    const [roomState, setRoomState] = useState<"lobby" | "active">("lobby");
    const [isMuted, setIsMuted] = useState(false);

    // Media & Streaming State
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

    // Remote states mapped by userId
    const [remoteScreenStreams, setRemoteScreenStreams] = useState<Record<string, MediaStream | null>>({});
    const [remoteCameraStreams, setRemoteCameraStreams] = useState<Record<string, MediaStream | null>>({});
    const [dataConns, setDataConns] = useState<Record<string, any>>({});
    const [remoteHandsRaised, setRemoteHandsRaised] = useState<Record<string, boolean>>({});
    const [remoteMutedStatus, setRemoteMutedStatus] = useState<Record<string, boolean>>({});
    const [remoteSpeakingStatus, setRemoteSpeakingStatus] = useState<Record<string, boolean>>({});

    const [peer, setPeer] = useState<Peer | null>(null);
    const [outgoingCalls, setOutgoingCalls] = useState<Record<string, any>>({}); // userId-type -> call
    const [incomingCalls, setIncomingCalls] = useState<Record<string, any>>({}); // userId-type -> call

    // Participant Info (API-polling derived)
    const [apiParticipants, setApiParticipants] = useState<any[]>([]);
    const [remoteUsersInfo, setRemoteUsersInfo] = useState<Record<string, any>>({});
    const [isHandRaised, setIsHandRaised] = useState(false);

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: "1", sender: "System", text: "Secure link established. Waiting for participants...", type: "text", timestamp: new Date(), color: "text-emerald-500" },
    ]);

    // Reactions Overlay State
    const [activeReactions, setActiveReactions] = useState<{ id: number, emoji: string }[]>([]);
    const [isLocalSpeaking, setIsLocalSpeaking] = useState(false);

    // Invite Modal State
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [friends, setFriends] = useState<any[]>([]);
    const [inviteSearchTerm, setInviteSearchTerm] = useState("");

    // Admission Flow State
    const [knockingUsers, setKnockingUsers] = useState<any[]>([]);
    const [admissionStatus, setAdmissionStatus] = useState<"none" | "knocking" | "accepted" | "denied">("none");
    const [meetingLinkVisible, setMeetingLinkVisible] = useState(false);

    // Refs for PeerJS listeners (to avoid stale closures)
    const videoStreamRef = React.useRef<MediaStream | null>(null);
    const screenStreamRef = React.useRef<MediaStream | null>(null);

    useEffect(() => { videoStreamRef.current = videoStream; }, [videoStream]);
    useEffect(() => { screenStreamRef.current = screenStream; }, [screenStream]);

    // Refs for synchronization to avoid stale closures in PeerJS event listeners
    const isMutedRef = React.useRef(isMuted);
    const isHandRaisedRef = React.useRef(isHandRaised);
    const remoteUsersInfoRef = React.useRef(remoteUsersInfo);
    const dataConnsRef = React.useRef<Record<string, any>>(dataConns);

    useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
    useEffect(() => { isHandRaisedRef.current = isHandRaised; }, [isHandRaised]);
    useEffect(() => { remoteUsersInfoRef.current = remoteUsersInfo; }, [remoteUsersInfo]);
    useEffect(() => { dataConnsRef.current = dataConns; }, [dataConns]);

    // -- 2. Helper Functions --
    const setupDataConnection = (conn: any) => {
        if (!conn) return;

        const peerId = conn.peer;
        console.log(`[DataConn] Setting up connection to ${peerId}...`);

        conn.on('open', async () => {
            console.log(`[DataConn] Connection OPEN with ${peerId}`);
            setDataConns(prev => ({ ...prev, [peerId]: conn }));

            // Lazy Discovery: If we don't have their info yet, fetch it immediately
            if (!remoteUsersInfoRef.current[peerId]) {
                try {
                    const res = await api.get(`/api/users/${peerId}/info`);
                    setRemoteUsersInfo(prev => ({ ...prev, [peerId]: res.data }));
                } catch (e) {
                    console.error(`[Mesh] Lazy discovery failed for ${peerId}`, e);
                }
            }

            // Sync current state immediately
            conn.send({ type: 'hand-sync', raised: isHandRaisedRef.current });
            conn.send({ type: 'mute-sync', isMuted: isMutedRef.current });

            // Gossip: Share your known participant list with the new peer
            // This ensures B and C find each other through Host A
            const selfInfo = {
                user_id: user?.user_id,
                name: `${user?.first_name || 'Trader'} ${user?.last_name || ''}`.trim(),
                first_name: user?.first_name || 'Trader',
                last_name: user?.last_name || '',
                avatar_url: user?.avatar_url || ''
            };

            conn.send({
                type: 'gossip',
                peers: remoteUsersInfoRef.current,
                self: selfInfo
            });

            // Gossip Broadcast: Inform ALL OTHER existing peers about this new joiner immediately
            // This achieves real-time 3-way discovery
            Object.values(dataConnsRef.current).forEach(existingConn => {
                if (existingConn.open && existingConn.peer !== peerId) {
                    existingConn.send({
                        type: 'gossip',
                        peers: { [peerId]: {} }, // Minimal placeholder to trigger lazy info fetch
                        // Re-send our own info to ensure consistency
                        self: selfInfo
                    });
                }
            });
        });

        conn.on('data', (data: any) => {
            console.log(`[DataConn] Received from ${peerId}:`, data.type);
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
                setRemoteHandsRaised(prev => ({ ...prev, [peerId]: data.raised }));
                if (data.type === 'hand' && data.raised) {
                    const name = remoteUsersInfoRef.current[peerId]?.first_name || 'Friend';
                    toast.info(`${name} raised their hand ✋`);
                }
            } else if (data.type === 'reaction') {
                const newId = Date.now();
                setActiveReactions(prev => [...prev, { id: newId, emoji: data.emoji }]);
                setTimeout(() => {
                    setActiveReactions(prev => prev.filter(r => r.id !== newId));
                }, 3000);
            } else if (data.type === 'mute' || data.type === 'mute-sync') {
                setRemoteMutedStatus(prev => ({ ...prev, [peerId]: data.isMuted }));
                if (data.type === 'mute' && data.isMuted) {
                    const name = remoteUsersInfoRef.current[peerId]?.first_name || 'Friend';
                    toast.info(`${name} is now muted`);
                }
            } else if (data.type === 'gossip') {
                console.log(`[Mesh] Received gossip from ${peerId}. Discovering ${Object.keys(data.peers || {}).length} peers...`);
                // Add the sender to our info map if missing
                if (data.self) {
                    setRemoteUsersInfo(prev => ({ ...prev, [peerId]: data.self }));
                }
                // Add all the peers they know
                if (data.peers) {
                    setRemoteUsersInfo(prev => ({ ...prev, ...data.peers }));
                }
            } else if (data.type === 'screen-ended') {
                setRemoteScreenStreams(prev => ({ ...prev, [peerId]: null }));
                const name = remoteUsersInfoRef.current[peerId]?.first_name || 'Friend';
                toast.info(`${name} stopped sharing their screen`);
            }
        });

        conn.on('error', (err: any) => {
            console.error(`[DataConn] Error (${peerId}):`, err);
            setDataConns(prev => {
                const updated = { ...prev };
                delete updated[peerId];
                return updated;
            });
        });

        conn.on('close', () => {
            console.log(`[DataConn] Closed (${peerId})`);
            setDataConns(prev => {
                const updated = { ...prev };
                delete updated[peerId];
                return updated;
            });
        });
    };

    const handleToggleHand = () => {
        const newState = !isHandRaised;
        setIsHandRaised(newState);

        // Broadcast to all peers
        Object.values(dataConns).forEach(conn => {
            if (conn.open) conn.send({ type: 'hand', raised: newState });
        });
    };

    const handleJoin = useCallback(async (mId?: string) => {
        let activeId = mId || meetingId;
        if (!activeId) {
            // Generate a valid ObjectId-like string for backend compatibility
            activeId = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
            console.log(`[Mesh] Generated new meeting ID: ${activeId}`);
        }

        try {
            console.log(`[Mesh] Attempting to join session: ${activeId}`);

            // 1. Check current status/permission
            let statusRes;
            try {
                statusRes = await api.get(`/api/friends/meeting/${activeId}`);
            } catch (e: any) {
                // If 404, meeting doesn't exist in DB yet (race) or is invalid
                // Still try to knock - the knock endpoint will return 404 which we handle
                console.log("[Mesh] Meeting status check failed, attempting to knock anyway...");
                statusRes = { data: { status: "not_found", host_id: null } };
            }

            const hostId = statusRes.data.host_id;
            const status = statusRes.data.status;

            // 2. Admission Logic
            if (status === "denied") {
                setAdmissionStatus("denied");
                toast.error("Entry denied by host");
                return;
            }

            // If we are the host (or already accepted), go directly in
            if (hostId === user?.user_id || status === "accepted") {
                setAdmissionStatus("accepted");
                if (activeId !== meetingId) {
                    setSearchParams({ meetingId: activeId });
                }
                setRoomState("active");
                toast.success("Entered Secure Room");
                return;
            }

            // If still pending, just show the waiting screen
            if (status === "pending_admission") {
                setAdmissionStatus("knocking");
                return;
            }

            // 3. Otherwise (not_found = guest with no record), knock for admission
            console.log("[Mesh] No invitation found. Knocking for entry...");
            setAdmissionStatus("knocking");
            try {
                await api.post(`/api/friends/meeting/${activeId}/knock`);
            } catch (knockErr: any) {
                // Even if knock fails (e.g., backend 500), keep the user in the waiting screen
                // They will be polled and admitted normally
                console.warn("[Mesh] Knock request failed, staying in waiting state", knockErr);
            }
        } catch (err) {
            console.error("Join failed", err);
            toast.error("Failed to join room");
        }
    }, [meetingId, setSearchParams, user]);

    // Show meeting link popup when host enters room
    useEffect(() => {
        if (roomState === "active" && admissionStatus === "accepted") {
            setMeetingLinkVisible(true);
            const t = setTimeout(() => setMeetingLinkVisible(false), 15000);
            return () => clearTimeout(t);
        }
    }, [roomState, admissionStatus]);

    const handleSendMessage = useCallback((text: string) => {
        if (!text.trim() || !user) return;

        const newMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: user.first_name || "You",
            text: text,
            type: "text",
            timestamp: new Date(),
            color: "text-primary"
        };
        setMessages(prev => [...prev, newMsg]);
        Object.values(dataConns).forEach(conn => {
            if (conn.open) conn.send({ type: 'chat', message: newMsg });
        });
    }, [user, dataConns]);

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
            console.log(`Incoming connection from ${conn.peer}...`);
            setupDataConnection(conn);
        });

        newPeer.on('error', (err) => {
            console.error('Core Peer Error:', err);
            if (err.type === 'peer-unavailable') {
                // peer-unavailable is common in mesh when a peer leaves.
                // Handled individually by closing/clearing specific peer states.
            } else if (err.type === 'disconnected') {
                toast.error('Peer connection lost. Reconnecting...');
                newPeer.reconnect();
            } else {
                toast.error(`Meeting connection error: ${err.type}`);
            }
        });

        newPeer.on('call', (call) => {
            const peerId = call.peer;
            const streamType = call.metadata?.type || 'screen';
            const localStream = streamType === 'camera' ? videoStreamRef.current : screenStreamRef.current;
            console.log(`[INCOMING] Answering ${streamType} call from ${peerId} (local stream: ${!!localStream})...`);

            call.answer(localStream || undefined);

            call.on('stream', (stream) => {
                console.log(`[INCOMING] Received ${streamType} stream from ${peerId}.`);
                if (streamType === 'camera') {
                    setRemoteCameraStreams(prev => ({ ...prev, [peerId]: stream }));
                } else {
                    setRemoteScreenStreams(prev => ({ ...prev, [peerId]: stream }));
                }
            });

            call.on('close', () => {
                console.log(`[INCOMING] ${streamType} call closed from ${peerId}.`);
                if (streamType === 'camera') {
                    setRemoteCameraStreams(prev => ({ ...prev, [peerId]: null }));
                    setIncomingCalls(prev => { const n = { ...prev }; delete n[`${peerId}-camera`]; return n; });
                } else {
                    setRemoteScreenStreams(prev => ({ ...prev, [peerId]: null }));
                    setIncomingCalls(prev => { const n = { ...prev }; delete n[`${peerId}-screen`]; return n; });
                }
            });

            setIncomingCalls(prev => ({ ...prev, [`${peerId}-${streamType}`]: call }));
        });

        setPeer(newPeer);

        return () => {
            newPeer.destroy();
        };
    }, [user, roomState]);

    // Mesh: Connect to all dataConns periodically
    useEffect(() => {
        if (!peer || roomState !== "active") return;

        const connectToPeers = async () => {
            // In a mesh, we need to know who ELSE is in the room. 
            // Currently our info comes from the notifications/meetings table.
            // We can poll the meeting status to get all accepted participants.
            if (meetingId) {
                try {
                    const res = await api.get(`/api/friends/meeting/${meetingId}`);
                    // If the meeting status is accepted, we should have a list of remote IDs.
                    // For now, it's host + invitee. If we want 3+, we'd need a multi-invite logic.
                    // But we can already handle multiple pairs if they connect to the same meetingId.
                } catch (e) { }
            }
        };

        // This is primarily driven by incoming connections in PeerJS unless we are the "initiator".
    }, [peer, meetingId]);

    // Connect to other users when they are discovered (mesh auto-connect)
    useEffect(() => {
        if (!peer || !user || roomState !== "active") return;

        const attemptConnections = () => {
            Object.keys(remoteUsersInfo).forEach(peerId => {
                const existingConn = dataConns[peerId];
                // Aggressive Mesh: Initiate connection if none exists or it's closed.
                // We removed the lexicographical tie-breaker to ensure full connectivity even if discovery is staggered.
                if (peerId !== user.user_id && (!existingConn || !existingConn.open)) {
                    console.log(`[Mesh] Attempting connection to ${peerId} (Active: ${!!existingConn})...`);
                    const conn = peer.connect(peerId, { reliable: true });
                    setupDataConnection(conn);
                }
            });
        };

        // Run immediately when remoteUsersInfo changes, and also on interval
        attemptConnections();
        const interval = setInterval(attemptConnections, 5000);
        return () => clearInterval(interval);
    }, [peer, user?.user_id, remoteUsersInfo, dataConns, roomState]);

    // Consolidate Auto-initiate Camera call to all peers (Symmetric Push)
    useEffect(() => {
        if (!peer || !videoStream) return;

        Object.keys(dataConns).forEach(peerId => {
            const callKey = `${peerId}-camera`;
            // Symmetric Push: Initiation is allowed by ANYONE who has a stream and no active outgoing call.
            // PeerJS handles the bi-directional stream resolution.
            if (dataConns[peerId].open && !outgoingCalls[callKey]) {
                console.log(`[OUTGOING] Initiating camera call to: ${peerId}`);
                try {
                    const call = peer.call(peerId, videoStream, { metadata: { type: 'camera' } });
                    setOutgoingCalls(prev => ({ ...prev, [callKey]: call }));

                    call.on('stream', (stream) => {
                        console.log(`[OUTGOING] Received return camera stream from ${peerId}`);
                        setRemoteCameraStreams(prev => ({ ...prev, [peerId]: stream }));
                    });

                    call.on('close', () => {
                        console.log(`[OUTGOING] Camera call closed to ${peerId}`);
                        setRemoteCameraStreams(prev => ({ ...prev, [peerId]: null }));
                        setOutgoingCalls(prev => { const n = { ...prev }; delete n[callKey]; return n; });
                    });

                    call.on('error', (err) => {
                        console.error(`[OUTGOING] Camera call error to ${peerId}:`, err);
                        setOutgoingCalls(prev => { const n = { ...prev }; delete n[callKey]; return n; });
                    });
                } catch (err) {
                    console.error(`Failed to call ${peerId}`, err);
                }
            }
        });
    }, [peer, videoStream, dataConns, outgoingCalls]);

    // Consolidate Auto-initiate Screen call to all peers (Symmetric Push)
    useEffect(() => {
        if (!peer || !screenStream) return;

        Object.keys(dataConns).forEach(peerId => {
            const callKey = `${peerId}-screen`;
            if (dataConns[peerId].open && !outgoingCalls[callKey]) {
                console.log(`[OUTGOING] Initiating screen call to: ${peerId}`);
                try {
                    const call = peer.call(peerId, screenStream, { metadata: { type: 'screen' } });
                    setOutgoingCalls(prev => ({ ...prev, [callKey]: call }));

                    call.on('stream', (stream) => {
                        setRemoteScreenStreams(prev => ({ ...prev, [peerId]: stream }));
                    });

                    call.on('close', () => {
                        setRemoteScreenStreams(prev => ({ ...prev, [peerId]: null }));
                        setOutgoingCalls(prev => { const n = { ...prev }; delete n[callKey]; return n; });
                    });
                } catch (err) {
                    console.error(`Failed to call screen ${peerId}`, err);
                }
            }
        });
    }, [peer, screenStream, dataConns, outgoingCalls]);

    // Audio Analysis Effect for All Remote Speakers
    useEffect(() => {
        const audioContexts: Record<string, AudioContext> = {};
        const animationFrames: Record<string, number> = {};

        Object.entries(remoteCameraStreams).forEach(([peerId, stream]) => {
            if (!stream || remoteMutedStatus[peerId]) {
                setRemoteSpeakingStatus(prev => ({ ...prev, [peerId]: false }));
                return;
            }

            try {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                audioContexts[peerId] = audioContext;
                const analyser = audioContext.createAnalyser();
                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);

                analyser.fftSize = 256;
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                const checkVolume = () => {
                    analyser.getByteFrequencyData(dataArray);
                    let sum = 0;
                    for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
                    const average = sum / bufferLength;
                    setRemoteSpeakingStatus(prev => ({ ...prev, [peerId]: average > 30 }));
                    animationFrames[peerId] = requestAnimationFrame(checkVolume);
                };

                checkVolume();
            } catch (e) {
                console.error(`Audio analysis failed for ${peerId}`, e);
            }
        });

        return () => {
            Object.values(animationFrames).forEach(cancelAnimationFrame);
            Object.values(audioContexts).forEach(ctx => ctx.close());
        };
    }, [remoteCameraStreams, remoteMutedStatus]);

    // Consolidate Participants list (API + Mesh)
    const traders = useMemo(() => {
        if (!user) return [];

        // Create the final consolidated list of traders (API + Mesh Discovery)
        const traders: Participant[] = [];

        // 1. Always add ourselves first
        traders.push({
            id: user.user_id,
            name: "You",
            avatar: user.first_name?.[0] || "U",
            isMuted: isMuted,
            color: "bg-primary"
        });

        // 2. Add API participants
        apiParticipants.forEach(p => {
            if (p.user_id === user.user_id) return;
            const info = remoteUsersInfo[p.user_id] || p;
            traders.push({
                id: p.user_id,
                name: info?.name || `${info?.first_name} ${info?.last_name}` || "Trader",
                avatar: info?.first_name?.[0] || "?",
                isSpeaking: !!remoteSpeakingStatus[p.user_id],
                isMuted: !!remoteMutedStatus[p.user_id],
                color: "bg-blue-500"
            });
        });

        // 3. Add Mesh-discovered peers who aren't in the API list yet
        Object.keys(remoteUsersInfo).forEach(peerId => {
            if (peerId === user.user_id || traders.some(t => t.id === peerId)) return;
            const info = remoteUsersInfo[peerId];
            traders.push({
                id: peerId,
                name: info?.name || `${info?.first_name} ${info?.last_name}` || "Trader",
                avatar: info?.first_name?.[0] || "?",
                isSpeaking: !!remoteSpeakingStatus[peerId],
                isMuted: !!remoteMutedStatus[peerId],
                color: "bg-blue-500"
            });
        });

        return traders;
    }, [user, isMuted, apiParticipants, remoteUsersInfo, remoteMutedStatus, remoteSpeakingStatus]);

    // Consolidate allParticipants for rendering
    const allParticipants = traders;

    // Phase 1: Full Participant Discovery Polling
    useEffect(() => {
        if (!meetingId || !user?.user_id) return;

        let isMounted = true;
        const fetchParticipants = async () => {
            try {
                // 1. Fetch Room Status & Unified ID
                const statusRes = await api.get(`/api/friends/meeting/${meetingId}`);
                if (!isMounted) return;

                const unifiedId = statusRes.data.meeting_id || statusRes.data.id;
                const status = statusRes.data.status;
                const incomingKnocks = statusRes.data.knocking_users || [];

                // Update knocking list for host
                if (statusRes.data.host_id === user?.user_id && incomingKnocks.length > 0) {
                    setKnockingUsers(incomingKnocks);
                } else {
                    setKnockingUsers([]);
                }

                // Auto-join logic for guest (if admitted)
                if (admissionStatus === "knocking" && status === "accepted") {
                    console.log("[Mesh] Admission granted! Joining...");
                    handleJoin(unifiedId);
                }

                // Auto-accept/join logic for invitee
                if (roomState === "lobby" && statusRes.data.invitee_id === user.user_id && (status === "pending" || status === "accepted") && admissionStatus === "none") {
                    if (status === "pending") {
                        await api.post(`/api/friends/meeting/${unifiedId}/accept`);
                    }
                    console.log("[Mesh] Auto-joining room...");
                    if (isMounted) handleJoin(unifiedId);
                }

                // 2. Fetch All Participants in this Room
                const res = await api.get(`/api/friends/meeting/${unifiedId}/participants`);
                if (!isMounted) return;

                const participantsList = res.data.participants || [];
                if (Array.isArray(participantsList)) {
                    if (isMounted) setApiParticipants(participantsList);

                    setRemoteUsersInfo(prev => {
                        const infoMap: Record<string, any> = {};
                        participantsList.forEach((p: any) => {
                            if (p.user_id !== user.user_id) {
                                infoMap[p.user_id] = p;
                            }
                        });

                        const newInfo = { ...prev, ...infoMap };
                        return newInfo;
                    });
                }
            } catch (e) {
                console.error("Discovery poll failed", e);
            }
        };

        fetchParticipants();
        const interval = setInterval(fetchParticipants, 3000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [meetingId, user?.user_id, roomState, handleJoin, setSearchParams, admissionStatus]);

    // Fetch friends for invitations
    useEffect(() => {
        if (!user || !isInviteModalOpen) return;

        const fetchFriends = async () => {
            try {
                const res = await api.get('/api/friends');
                setFriends(res.data);
            } catch (err) {
                console.error("Failed to fetch friends", err);
            }
        };

        fetchFriends();
    }, [user, isInviteModalOpen]);

    // Cleanup on unmount only
    useEffect(() => {
        return () => {
            // Stop all local tracks
            videoStream?.getTracks().forEach(t => t.stop());
            screenStream?.getTracks().forEach(t => t.stop());

            // Close all calls and connections
            Object.values(outgoingCalls).forEach(call => call.close());
            Object.values(incomingCalls).forEach(call => call.close());
            Object.values(dataConns).forEach(conn => conn.close());

            if (peer) {
                peer.destroy();
            }
        };
    }, []); // Only run on unmount

    const handleStartScreenShare = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            setScreenStream(stream);

            // No inline call here anymore. The useEffect will pick up the stream change.
            toast.info("Preparing screen share...");

            stream.getVideoTracks()[0].onended = () => {
                handleStopScreenShare();
            };
            toast.success("Screen sharing active");
        } catch (err) {
            console.error("Error sharing screen:", err);
            toast.error("Failed to start screen share");
        }
    };

    const handleStopScreenShare = () => {
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
            setScreenStream(null);

            // Broadcast screen ended
            Object.values(dataConns).forEach(conn => {
                if (conn.open) conn.send({ type: 'screen-ended' });
            });

            // Close all outgoing screen calls
            Object.entries(outgoingCalls).forEach(([key, call]) => {
                if (key.endsWith('-screen')) {
                    call.close();
                    setOutgoingCalls(prev => { const n = { ...prev }; delete n[key]; return n; });
                }
            });
            toast.info("Screen sharing stopped");
        }
    };

    const handleStartVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setVideoStream(stream);
            setIsMuted(false); // Ensure mic is not muted when starting video
            toast.success("Camera active");
        } catch (err) {
            console.error("Error accessing camera:", err);
            toast.error("Camera access denied");
        }
    };

    const handleStopVideo = () => {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            setVideoStream(null);
            setIsMuted(true); // Mute mic when stopping video
            // Close all outgoing camera calls
            Object.entries(outgoingCalls).forEach(([key, call]) => {
                if (key.endsWith('-camera')) {
                    call.close();
                    setOutgoingCalls(prev => { const n = { ...prev }; delete n[key]; return n; });
                }
            });
            toast.info("Camera stopped");
        }
    };

    // Reset media calls when local streams change (fixes asymmetric streams)
    useEffect(() => {
        if (videoStream) {
            console.log("[Mesh] Local camera stream acquired, resetting outgoing camera calls...");
            Object.entries(outgoingCalls).forEach(([key, call]) => {
                if (key.endsWith('-camera')) {
                    call.close();
                    setOutgoingCalls(prev => { const n = { ...prev }; delete n[key]; return n; });
                }
            });
        }
    }, [!!videoStream]);

    useEffect(() => {
        if (screenStream) {
            console.log("[Mesh] Local screen stream acquired, resetting outgoing screen calls...");
            Object.entries(outgoingCalls).forEach(([key, call]) => {
                if (key.endsWith('-screen')) {
                    call.close();
                    setOutgoingCalls(prev => { const n = { ...prev }; delete n[key]; return n; });
                }
            });
        }
    }, [!!screenStream]);



    const handleRespondToAdmission = async (targetUserId: string, action: "admit" | "deny") => {
        if (!meetingId) return;
        try {
            await api.post(`/api/friends/meeting/${meetingId}/respond`, {
                user_id: targetUserId,
                action: action
            });
            setKnockingUsers(prev => prev.filter(u => u.user_id !== targetUserId));
            toast.success(action === "admit" ? "User admitted" : "User denied");
        } catch (err) {
            toast.error("Failed to respond to request");
        }
    };

    const handleToggleMute = () => {
        if (!videoStream) {
            toast.error("Please enable your camera/mic first");
            return;
        }
        const newState = !isMuted;
        setIsMuted(newState);
        videoStream.getAudioTracks().forEach(track => {
            track.enabled = !newState;
        });

        // Broadcast to all peers
        Object.values(dataConns).forEach(conn => {
            if (conn.open) conn.send({ type: 'mute', isMuted: newState });
        });
        toast.info(newState ? "Microphone muted" : "Microphone active");
    };

    const handleReaction = (emoji: string) => {
        const newId = Date.now();
        setActiveReactions(prev => [...prev, { id: newId, emoji }]);
        setTimeout(() => {
            setActiveReactions(prev => prev.filter(r => r.id !== newId));
        }, 3000);

        // Broadcast to all peers
        Object.values(dataConns).forEach(conn => {
            if (conn.open) conn.send({ type: 'reaction', emoji });
        });
    };

    const handleLeave = () => {
        // Stop all local tracks
        videoStream?.getTracks().forEach(t => t.stop());
        screenStream?.getTracks().forEach(t => t.stop());

        // Close all calls and connections
        Object.values(outgoingCalls).forEach(call => call.close());
        Object.values(incomingCalls).forEach(call => call.close());
        Object.values(dataConns).forEach(conn => conn.close());

        if (peer) {
            peer.destroy();
        }

        // Reset state
        setRoomState("lobby");
        setPeer(null);
        setVideoStream(null);
        setScreenStream(null);
        setRemoteScreenStreams({});
        setRemoteCameraStreams({});
        setDataConns({});
        setOutgoingCalls({});
        setIncomingCalls({});
        setRemoteUsersInfo({});
        setApiParticipants([]);
        setIsMuted(false);
        setIsHandRaised(false);
        setMessages([]);

        // Clean up URL
        setSearchParams({});
        toast.info("Session ended");
    };

    const handleInviteMore = async (targetUserId: string) => {
        if (!meetingId) return;
        try {
            await api.post('/api/friends/invite-room', {
                recipient_id: targetUserId,
                meeting_id: meetingId
            });
            toast.success("Invitation sent!");
        } catch (err) {
            toast.error("Failed to send invitation");
        }
    };

    const handleShareStats = async () => {
        try {
            const res = await api.get(`/trades/stats/user/${user?.user_id}`);
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
            Object.values(dataConns).forEach(conn => {
                if (conn.open) conn.send({ type: 'chat', message: statsMessage });
            });

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
                        <RoomLobby
                            onJoinRoom={handleJoin}
                            meetingId={meetingId || undefined}
                            onUpdateMeetingId={(id) => setSearchParams({ meetingId: id })}
                        />
                    </>
                ) : (
                    /* Active Room Layout */
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Top Bar / Participants Overlay */}
                        <div className="absolute top-4 left-4 z-30">
                            <ParticipantsStrip participants={allParticipants} />
                        </div>

                        {/* Center Content: Main Grid/Stage */}
                        <div className="flex-1 min-w-0 h-full p-4 overflow-hidden relative">
                            {/* Admission Requests for Host */}
                            <AnimatePresence>
                                {knockingUsers.length > 0 && (
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] space-y-2 max-w-sm w-full">
                                        {knockingUsers.map(knocker => (
                                            <motion.div
                                                key={knocker.user_id}
                                                initial={{ y: -20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -20, opacity: 0 }}
                                                className="bg-[#0f0f13] border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-10 h-10 border border-white/10">
                                                        <AvatarFallback className="bg-emerald-500/20 text-emerald-500 font-bold">
                                                            {knocker.name?.[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{knocker.name}</p>
                                                        <p className="text-[10px] text-muted-foreground">Wants to join this call</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleRespondToAdmission(knocker.user_id, "deny")}
                                                        className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                                    >
                                                        Deny
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleRespondToAdmission(knocker.user_id, "admit")}
                                                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500"
                                                    >
                                                        Admit
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </AnimatePresence>

                            {/* Google Meet-style "Your meeting's ready" Link Popup */}
                            <AnimatePresence>
                                {meetingLinkVisible && meetingId && (
                                    <motion.div
                                        initial={{ x: -60, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -60, opacity: 0 }}
                                        className="absolute bottom-28 left-4 z-[60] bg-[#0f0f13] border border-white/10 rounded-2xl shadow-2xl p-5 w-80"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-white font-bold text-sm">Your meeting's ready</p>
                                            <button onClick={() => setMeetingLinkVisible(false)} className="text-muted-foreground hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </button>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-3">Or share this meeting link with others you want in the meeting</p>
                                        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                                            <span className="text-xs text-emerald-400 flex-1 truncate">{window.location.href}</span>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(window.location.href);
                                                    toast.success("Link copied!");
                                                }}
                                                className="text-muted-foreground hover:text-white shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1">
                                            <Shield className="w-3 h-3 text-emerald-500" />
                                            People who use this meeting link must get your permission before they can join.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Waiting Room Overlay for Guests */}
                            {admissionStatus === "knocking" && (
                                <div className="absolute inset-0 z-[70] bg-[#0a0a0c]/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center space-y-6">
                                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center relative">
                                        <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-full animate-ping" />
                                        <Users className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black text-white">Asking to be admitted...</h2>
                                        <p className="text-muted-foreground max-w-xs mx-auto">
                                            The host will let you in shortly. Hang tight!
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setAdmissionStatus("none");
                                            setRoomState("lobby");
                                        }}
                                        className="border-white/10 text-white hover:bg-white/5"
                                    >
                                        Cancel Request
                                    </Button>
                                </div>
                            )}

                            {admissionStatus === "denied" && (
                                <div className="absolute inset-0 z-[70] bg-[#0a0a0c]/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center space-y-6">
                                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                                        <Shield className="w-8 h-8 text-red-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black text-white">Entry Denied</h2>
                                        <p className="text-muted-foreground">
                                            The host has declined your request to join this session.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setAdmissionStatus("none");
                                            setRoomState("lobby");
                                        }}
                                        className="bg-red-600 hover:bg-red-500"
                                    >
                                        Back to Lobby
                                    </Button>
                                </div>
                            )}

                            {/* We use the first available remote screen stream or the local one for the Stage */}
                            <ActiveScreenShare
                                sharerName={allParticipants.find(p => remoteScreenStreams[p.id])?.name || "Trader"}
                                screenStream={screenStream}
                                cameraStream={videoStream}
                                remoteScreenStream={Object.values(remoteScreenStreams).find(s => !!s)}
                                remoteCameraStreams={remoteCameraStreams}
                                remoteUsersInfo={remoteUsersInfo}
                            />
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
                            isMuted={isMuted}
                            onToggleMute={handleToggleMute}
                            isVideoOn={!!videoStream}
                            onToggleVideo={videoStream ? handleStopVideo : handleStartVideo}
                            isScreenSharing={!!screenStream}
                            onToggleScreenShare={screenStream ? handleStopScreenShare : handleStartScreenShare}
                            isHandRaised={isHandRaised}
                            onToggleHand={handleToggleHand}
                            onReaction={handleReaction}
                            onLeave={handleLeave}
                            onToggleChat={() => setIsChatOpen(!isChatOpen)}
                            onShareStats={handleShareStats}
                            onInvite={() => {
                                console.log("[TraderRoom] Opening invite modal");
                                toast.info("Opening Invite List...");
                                setIsInviteModalOpen(true);
                            }}
                            onShowInfo={() => toast.info("Room ID: " + (meetingId || "Unknown"))}
                        />

                        {/* Invitation Dialog */}
                        <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                            <DialogContent className="max-w-md bg-[#0f0f13] border-white/10 text-white">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <UserPlus className="w-5 h-5 text-primary" />
                                        Invite to Trade Room
                                    </DialogTitle>
                                    <DialogDescription className="text-white/50">
                                        Invite your friends to collaborate in this live session.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                                        <Input
                                            placeholder="Search friends..."
                                            value={inviteSearchTerm}
                                            onChange={(e) => setInviteSearchTerm(e.target.value)}
                                            className="pl-9 bg-white/5 border-white/10 focus:border-primary/50"
                                        />
                                    </div>

                                    <ScrollArea className="h-[300px] pr-4">
                                        <div className="space-y-2">
                                            {friends
                                                .filter(f =>
                                                    f.first_name?.toLowerCase().includes(inviteSearchTerm.toLowerCase()) ||
                                                    f.last_name?.toLowerCase().includes(inviteSearchTerm.toLowerCase())
                                                )
                                                .map((friend) => (
                                                    <div
                                                        key={friend.user_id}
                                                        className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="w-10 h-10 border border-white/10">
                                                                <AvatarImage src={friend.avatar_url} />
                                                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                                    {friend.first_name?.[0]}{friend.last_name?.[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="text-sm font-bold">{friend.first_name} {friend.last_name}</div>
                                                                <div className="text-[10px] text-emerald-500 font-medium">Online</div>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            className="h-8 bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all rounded-lg"
                                                            onClick={() => handleInviteMore(friend.user_id)}
                                                        >
                                                            Invite
                                                        </Button>
                                                    </div>
                                                ))}

                                            {friends.length === 0 && (
                                                <div className="text-center py-10 text-white/30 text-sm">
                                                    No online friends found.
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </DialogContent>
                        </Dialog>

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
