import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ReactionPickerProps {
    onSelect: (emoji: string) => void;
    currentReaction?: string | null;
    isVisible: boolean;
    className?: string;
}

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export function ReactionPicker({ onSelect, currentReaction, isVisible, className }: ReactionPickerProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={cn(
                        "absolute -top-12 left-0 z-50 flex items-center gap-1 p-1 bg-background/95 backdrop-blur-md border border-border/50 rounded-full shadow-xl",
                        className
                    )}
                >
                    {REACTION_EMOJIS.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(emoji);
                            }}
                            className={cn(
                                "w-8 h-8 flex items-center justify-center text-xl hover:scale-125 transition-transform active:scale-95 rounded-full select-none",
                                currentReaction === emoji ? "bg-primary/20" : "hover:bg-muted"
                            )}
                        >
                            {emoji}
                        </button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
