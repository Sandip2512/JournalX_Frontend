import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Megaphone, Sparkles, ArrowRight } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
    id: string;
    title: string;
    content: string;
    created_at: string;
    type: "announcement" | "personal" | "room_invite";
    is_read: boolean;
    metadata?: {
        action_url?: string;
        action_label?: string;
        inviter_id?: string;
    };
}

export const NotificationDropdown = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const response = await api.get("/api/notifications");
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: string, type: string) => {
        if (type === 'announcement') return;
        try {
            await api.put(`/api/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const dismissNotification = async (id: string) => {
        try {
            await api.put(`/api/notifications/${id}/dismiss`);
            const target = notifications.find(n => n.id === id);
            if (target) {
                const wasUnread = !target.is_read;
                setNotifications(notifications.filter(n => n.id !== id));
                if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Failed to dismiss notification", error);
        }
    };

    const dismissAll = async () => {
        try {
            await api.put("/api/notifications/dismiss-all");
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to dismiss all notifications", error);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (open) fetchNotifications();
        }}>
            <PopoverTrigger asChild>
                <div className="relative cursor-pointer group">
                    {children}
                    <AnimatePresence>
                        <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: unreadCount > 0 ? [1, 1.05, 1] : 1,
                                opacity: 1,
                                boxShadow: unreadCount > 0 ? [
                                    "0 0 15px rgba(255, 0, 0, 0.7)",
                                    "0 0 30px rgba(255, 0, 0, 0.9)",
                                    "0 0 15px rgba(255, 0, 0, 0.7)"
                                ] : "0 0 10px rgba(255, 0, 0, 0.3)"
                            }}
                            transition={{
                                scale: { repeat: unreadCount > 0 ? Infinity : 0, duration: 2, ease: "easeInOut" },
                                boxShadow: { repeat: unreadCount > 0 ? Infinity : 0, duration: 2, ease: "easeInOut" },
                                default: { duration: 0.3 }
                            }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-[#FF0000] text-[11px] font-black text-white rounded-full flex items-center justify-center border-[3px] border-header z-30 shadow-[0_0_20px_#FF0000]"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    </AnimatePresence>
                </div>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="w-[340px] p-0 bg-transparent border-none shadow-none overflow-visible pointer-events-auto"
                sideOffset={15}
            >
                <div className="flex flex-col gap-2 relative z-50">
                    <AnimatePresence mode="popLayout">
                        {notifications.length > 0 ? (
                            <>
                                {/* Floating Clear All Action */}
                                {unreadCount > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex justify-end pr-2"
                                    >
                                        <button
                                            onClick={dismissAll}
                                            className="px-3 py-1 bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-xl border border-white/5 rounded-full text-[9px] font-black text-white/40 hover:text-primary transition-all uppercase tracking-widest"
                                        >
                                            Dismiss All
                                        </button>
                                    </motion.div>
                                )}

                                <ScrollArea className="max-h-[400px] pr-2">
                                    <div className="space-y-2 pb-2">
                                        {notifications.map((notification, index) => (
                                            <motion.div
                                                key={notification.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 500,
                                                    damping: 30,
                                                    delay: index * 0.03
                                                }}
                                                className={cn(
                                                    "relative overflow-hidden group/bubble",
                                                    "bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-3 rounded-[1.25rem] shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 hover:bg-white/[0.06] hover:border-white/20 hover:scale-[1.02]",
                                                    !notification.is_read && notification.type === 'personal' && "border-primary/20 bg-primary/[0.02]"
                                                )}
                                            >
                                                {/* Left Aurora Accent */}
                                                <div className={cn(
                                                    "absolute left-0 top-0 bottom-0 w-1 opacity-20 group-hover/bubble:opacity-60 transition-opacity",
                                                    notification.type === 'announcement' ? "bg-indigo-500" : "bg-primary"
                                                )} />

                                                <div className="flex gap-3">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover/bubble:scale-110",
                                                        notification.type === 'announcement'
                                                            ? "bg-indigo-500/10 text-indigo-400"
                                                            : "bg-primary/10 text-primary"
                                                    )}>
                                                        {notification.type === 'announcement' ? (
                                                            <Megaphone className="w-3.5 h-3.5" />
                                                        ) : (
                                                            <Sparkles className="w-3.5 h-3.5" />
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-0.5">
                                                            <span className="text-[10px] font-black text-white/80 uppercase tracking-tighter truncate max-w-[150px]">
                                                                {notification.title}
                                                            </span>
                                                            <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest">
                                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-white/40 leading-tight line-clamp-2">
                                                            {notification.content}
                                                        </p>

                                                        {notification.metadata?.action_url && (
                                                            <div className="mt-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigate(notification.metadata!.action_url!);
                                                                        dismissNotification(notification.id);
                                                                    }}
                                                                    className="w-full h-7 text-[10px] font-bold bg-white/5 hover:bg-emerald-500 hover:text-white rounded-lg transition-all flex items-center justify-between px-2"
                                                                >
                                                                    {notification.metadata.action_label || "View"}
                                                                    <ArrowRight className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {/* Actions reveal on hover */}
                                                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/[0.03]">
                                                            <div className="flex gap-2">
                                                                <Badge className={cn(
                                                                    "h-3.5 text-[7px] font-black uppercase tracking-widest border-none px-1.5",
                                                                    notification.type === 'announcement' ? "bg-indigo-500/20 text-indigo-400" : "bg-primary/20 text-primary"
                                                                )}>
                                                                    {notification.type}
                                                                </Badge>

                                                                {!notification.is_read && notification.type === 'personal' && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            markAsRead(notification.id, notification.type);
                                                                        }}
                                                                        className="flex items-center gap-1 text-[8px] text-primary/50 hover:text-primary font-black uppercase tracking-tighter transition-colors"
                                                                    >
                                                                        <Check className="w-2.5 h-2.5" /> Mark read
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    dismissNotification(notification.id);
                                                                }}
                                                                className="text-[8px] text-white/20 hover:text-red-400 font-black uppercase tracking-tighter transition-colors flex items-center gap-0.5"
                                                            >
                                                                Dismiss
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-8 rounded-[2rem] text-center space-y-3"
                            >
                                <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto">
                                    <Bell className="w-5 h-5 text-white/10" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
                                        Void
                                    </h4>
                                    <p className="text-[8px] text-white/10 font-bold uppercase tracking-widest mt-1">
                                        No active signals
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </PopoverContent>
        </Popover>
    );
};
