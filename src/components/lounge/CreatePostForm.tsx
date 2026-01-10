import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, X, Send, Paperclip, Smile } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createPost, addComment } from "@/lib/postsApi"; // Imported addComment
import { Comment } from "@/types/lounge";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";

export interface ReplyContext {
    postId: string;
    commentId?: string; // If replying to a comment
    userName: string;
    contentPreview?: string;
}

interface CreatePostFormProps {
    onPostCreated: (isComment?: boolean) => void;
    replyContext: ReplyContext | null; // New Prop
    onCancelReply: () => void; // New Prop
    onCommentSuccess?: (comment: Comment) => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onPostCreated, replyContext, onCancelReply, onCommentSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | undefined>(undefined);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Emoji State
    const { toast } = useToast();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { register, handleSubmit, reset, watch, setValue, setFocus } = useForm<{ content: string }>();

    const content = watch("content");

    // Focus input when reply context changes
    useEffect(() => {
        if (replyContext) {
            setFocus("content");
        }
    }, [replyContext, setFocus]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [content]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    variant: "destructive",
                    title: "File too large",
                    description: "Image size must be less than 5MB",
                });
                return;
            }

            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(undefined);
        setImagePreview(null);
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setValue("content", (content || "") + emojiData.emoji);
    };

    const onSubmit = async (data: { content: string }) => {
        if (!data.content.trim() && !selectedImage) return;

        console.log("CreatePostForm: onSubmit triggered", { replyContext, content: data.content });

        try {
            setIsLoading(true);

            if (replyContext) {
                // Handle Reply (Comment)
                const newComment = await addComment(replyContext.postId, {
                    content: data.content,
                    parent_id: replyContext.commentId
                });

                // We need to notify the parent to update comments locally or refetch
                // For now, onPostCreated triggers a refresh of posts which is heavy but works
                // Ideally we'd pass an onCommentAdded callback

                if (onCommentSuccess) onCommentSuccess(newComment);
                onCancelReply(); // Clear reply context
                onPostCreated(true); // Pass true to indicate it's a comment
            } else {
                // Create New Post
                await createPost({
                    content: data.content,
                    image: selectedImage
                });
                removeImage();
                onPostCreated(false);
            }

            reset();
            setShowEmojiPicker(false);
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
            // onPostCreated(); // Moved inside if/else to handle isComment flag

        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to send message.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(onSubmit)();
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-6">
            <div className="container max-w-3xl mx-auto">
                <AnimatePresence>
                    {/* Reply Context Banner */}
                    {replyContext && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="relative mb-2 mx-2 bg-muted/80 backdrop-blur-xl p-3 rounded-xl border border-primary/20 shadow-lg flex items-center justify-between"
                        >
                            <div className="flex flex-col text-xs border-l-2 border-primary pl-3">
                                <span className="font-bold text-primary">Replying to {replyContext.userName}</span>
                                {replyContext.contentPreview && (
                                    <span className="opacity-70 truncate max-w-[200px] sm:max-w-md">{replyContext.contentPreview}</span>
                                )}
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-background/50" onClick={onCancelReply}>
                                <X size={14} />
                            </Button>
                        </motion.div>
                    )}

                    {/* Image Preview (Only for Posts) */}
                    {!replyContext && imagePreview && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="relative mb-3 inline-block bg-background/50 backdrop-blur-xl p-2 rounded-xl border border-white/10 shadow-lg"
                        >
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="h-24 w-24 object-cover rounded-lg border border-border/10"
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors shadow-md"
                            >
                                <X size={14} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-end gap-2 bg-background/60 backdrop-blur-2xl p-2 rounded-[24px] border border-white/10 shadow-2xl ring-1 ring-black/5"
                >
                    <div className="flex gap-1 pb-1 pl-1 items-center">
                        {/* Image Upload Button (Hidden when replying) */}
                        {!replyContext && (
                            <>
                                <input
                                    type="file"
                                    id="image-upload"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-300"
                                    onClick={() => document.getElementById("image-upload")?.click()}
                                >
                                    <Paperclip size={20} />
                                </Button>
                            </>
                        )}

                        {/* Emoji Picker Trigger */}
                        <div className="relative">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={cn("h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-300", showEmojiPicker && "text-primary bg-primary/10")}
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                                <Smile size={20} />
                            </Button>
                            <AnimatePresence>
                                {showEmojiPicker && (
                                    <div className="absolute bottom-12 left-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-border/10">
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowEmojiPicker(false)}
                                        />
                                        <div className="relative z-50">
                                            <EmojiPicker
                                                onEmojiClick={onEmojiClick}
                                                theme={Theme.AUTO}
                                                width={300}
                                                height={400}
                                                searchDisabled={false}
                                                previewConfig={{ showPreview: false }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex-1 min-w-0">
                        <Textarea
                            {...register("content")}
                            ref={(e) => {
                                register("content").ref(e);
                                textareaRef.current = e;
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder={replyContext ? `Replying to ${replyContext.userName}...` : "Type a message..."}
                            className="min-h-[44px] max-h-[150px] w-full resize-none border-none focus-visible:ring-0 bg-transparent py-3 px-2 text-[15px] leading-relaxed placeholder:text-muted-foreground/50"
                            rows={1}
                        />
                    </form>

                    <Button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        size="icon"
                        disabled={isLoading || (!content?.trim() && !selectedImage)}
                        className="h-11 w-11 mb-[1px] mr-[1px] shrink-0 rounded-full bg-gradient-to-tr from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-white" />
                        ) : (
                            <Send className="h-5 w-5 ml-0.5 text-white" />
                        )}
                    </Button>
                </motion.div>
            </div>
        </div>
    );
};

// Utils import fix (assuming cn is used for Button classes if needed, I imported it but didn't use it in replaced code, adding it just in case or removing if not needed - wait, I used `cn` in className line 280)
import { cn } from "@/lib/utils";

export default CreatePostForm;
