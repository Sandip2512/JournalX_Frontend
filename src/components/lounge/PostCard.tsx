import React, { useState, useRef, useMemo, useEffect } from "react";
import { format, formatDistanceToNowStrict } from "date-fns";
import { Heart, MessageSquare, Trash2, MoreVertical, Reply, SendHorizontal, Loader2, CheckCheck, X, Smile, Pencil } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Post, Comment } from "@/types/lounge";
import { likePost, unlikePost, deletePost, updatePost, addComment, getComments, deleteComment, getImageUrl, likeComment, unlikeComment, reactToPost } from "@/lib/postsApi";
import { ReactionPicker } from "./ReactionPicker";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PostCardProps {
    post: Post;
    onPostDeleted: (postId: string) => void;
    onImageClick?: (imageUrl: string) => void;
    onReply: (postId: string, userName: string, commentId?: string, contentPreview?: string) => void;
    lastCommentAdded?: Comment | null;
}

const PostCard: React.FC<PostCardProps> = ({ post, onPostDeleted, onImageClick, onReply, lastCommentAdded }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLiked, setIsLiked] = useState(post.user_has_liked || false);

    const [userReaction, setUserReaction] = useState<string | null>(post.user_reaction || (post.user_has_liked ? "❤️" : null));
    const [reactions, setReactions] = useState<Record<string, number>>(post.reactions || (post.like_count > 0 ? { "❤️": post.like_count } : {}));

    // Derived total for display (backward compat)
    const likeCount = useMemo(() => Object.values(reactions).reduce((a, b) => a + b, 0), [reactions]);

    const [isHoveringLike, setIsHoveringLike] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [localContent, setLocalContent] = useState(post.content);

    // Watch for new comments added via global input
    useEffect(() => {
        if (lastCommentAdded && lastCommentAdded.post_id === post.post_id) {
            // Check if we already have this comment to avoid dupes (though ID check is good)
            setComments(prev => {
                if (prev.some(c => c.comment_id === lastCommentAdded.comment_id)) return prev;
                return [...prev, lastCommentAdded];
            });
            // Also ensure comments are shown
            setShowComments(true);
        }
    }, [lastCommentAdded, post.post_id]);

    // State to track expanded replies for each parent comment
    const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

    const isOwnPost = user?.user_id === post.user_id;

    // Organise comments into threads
    const { topLevelComments, repliesByParent } = useMemo(() => {
        const top = comments.filter(c => !c.parent_id);
        const replies: Record<string, Comment[]> = {};

        comments.forEach(c => {
            if (c.parent_id) {
                if (!replies[c.parent_id]) replies[c.parent_id] = [];
                replies[c.parent_id].push(c);
            }
        });

        return { topLevelComments: top, repliesByParent: replies };
    }, [comments]);

    const likeLock = useRef(false);

    const handleReaction = async (emoji: string) => {
        if (likeLock.current) return;
        likeLock.current = true;

        const previousReaction = userReaction;
        const previousReactions = { ...reactions };
        const isRemoving = previousReaction === emoji;

        // Optimistic Update
        setUserReaction(isRemoving ? null : emoji);
        setIsLiked(!isRemoving); // approx

        setReactions(prev => {
            const next = { ...prev };

            // Remove previous count if exists
            if (previousReaction) {
                next[previousReaction] = Math.max(0, (next[previousReaction] || 0) - 1);
                if (next[previousReaction] === 0) delete next[previousReaction];
            }

            // Add new count if not removing
            if (!isRemoving) {
                next[emoji] = (next[emoji] || 0) + 1;
            }
            return next;
        });

        try {
            // We use the same endpoint for toggle - sending same emoji removes it
            await reactToPost(post.post_id, emoji);
        } catch (error: any) {
            // Revert
            setUserReaction(previousReaction);
            setReactions(previousReactions);
            setIsLiked(!!previousReaction);

            const errorMessage = error?.response?.data?.detail || "Could not update reaction";
            toast({
                variant: "destructive",
                title: "Reaction failed",
                description: errorMessage
            });
        } finally {
            setTimeout(() => { likeLock.current = false; }, 300);
        }
    };

    const handleLike = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        handleReaction("❤️");
    };

    const handlesCommentLike = async (commentId: string, currentLiked: boolean) => {
        // Optimistic Update
        setComments(prevComments =>
            prevComments.map(c => {
                if (c.comment_id === commentId) {
                    return {
                        ...c,
                        user_has_liked: !currentLiked,
                        like_count: currentLiked ? Math.max(0, c.like_count - 1) : c.like_count + 1
                    };
                }
                return c;
            })
        );

        try {
            if (currentLiked) {
                await unlikeComment(post.post_id, commentId);
            } else {
                await likeComment(post.post_id, commentId);
            }
        } catch (error) {
            // Revert on error
            setComments(prevComments =>
                prevComments.map(c => {
                    if (c.comment_id === commentId) {
                        return {
                            ...c,
                            user_has_liked: currentLiked,
                            like_count: currentLiked ? c.like_count + 1 : Math.max(0, c.like_count - 1)
                        };
                    }
                    return c;
                })
            );
            toast({ variant: "destructive", title: "Action failed" });
        }
    };

    const handleDeletePost = async () => {
        try {
            await deletePost(post.post_id);
            onPostDeleted(post.post_id);
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to delete" });
        }
    };

    const handleEditPost = async () => {
        if (!editContent.trim() || editContent === post.content) {
            setIsEditing(false);
            return;
        }

        try {
            setIsSavingEdit(true);
            await updatePost(post.post_id, editContent);
            setLocalContent(editContent);
            setIsEditing(false);
            toast({ description: "Message updated" });
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to update message" });
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        setDeletingCommentId(commentId);
        try {
            await deleteComment(post.post_id, commentId);
            setComments(prev => prev.filter(c => c.comment_id !== commentId));
            toast({ description: "Comment deleted" });
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to delete comment" });
        } finally {
            setDeletingCommentId(null);
        }
    };

    const toggleComments = async () => {
        if (!showComments && comments.length === 0) {
            setCommentsLoading(true);
            try {
                const data = await getComments(post.post_id);
                setComments(data);
            } finally {
                setCommentsLoading(false);
            }
        }
        setShowComments(!showComments);
    };

    const handleReplyClick = (comment: Comment) => {
        onReply(post.post_id, comment.user_name, comment.comment_id, comment.content);
    };

    const toggleRepliesInfo = (commentId: string) => {
        setExpandedReplies(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };



    const formatShortTime = (dateString: string) => {
        try {
            const dist = formatDistanceToNowStrict(new Date(dateString));
            return dist
                .replace(" minutes", "m")
                .replace(" minute", "m")
                .replace(" hours", "h")
                .replace(" hour", "h")
                .replace(" days", "d")
                .replace(" day", "d")
                .replace(" seconds", "s");
        } catch (e) {
            return "";
        }
    };

    // Component for a single comment row
    const CommentRow = ({ comment, isReply = false }: { comment: Comment, isReply?: boolean }) => {
        const isMyComment = user?.user_id === comment.user_id;
        const isDeleting = deletingCommentId === comment.comment_id;

        return (
            <div className={cn("flex gap-4 items-start group/comment", isReply && "pl-10 mt-4")}>
                <Avatar className={cn("mt-1 shrink-0 border border-border dark:border-white/5 shadow-xl", isReply ? "w-7 h-7" : "w-10 h-10")}>
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.user_name}`} />
                    <AvatarFallback className="text-[10px] bg-muted dark:bg-[#1a1a1a] text-muted-foreground dark:text-slate-400 font-bold">{comment.user_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] leading-relaxed break-words">
                        <span className="font-black text-foreground dark:text-white mr-2 tracking-tight">{comment.user_name}</span>
                        <span className="text-muted-foreground dark:text-slate-300 font-medium opacity-90">{comment.content}</span>
                    </div>

                    <div className="flex gap-4 mt-2 items-center">
                        <span className="text-[10px] text-muted-foreground/50 font-black uppercase tracking-widest">
                            {formatShortTime(comment.created_at)}
                        </span>
                        {comment.like_count > 0 && (
                            <span className="text-[10px] text-primary/80 font-black uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                                {comment.like_count} likes
                            </span>
                        )}
                        <button
                            className="text-[10px] text-muted-foreground/50 font-black uppercase tracking-widest hover:text-primary transition-colors"
                            onClick={() => handleReplyClick(comment)}
                        >
                            Reply
                        </button>

                        {/* Delete Option for Own Comments */}
                        {isMyComment && (
                            <button
                                className={cn(
                                    "text-[10px] font-black uppercase tracking-widest transition-colors",
                                    isDeleting ? "text-red-500" : "text-muted-foreground/40 hover:text-red-500"
                                )}
                                onClick={() => !isDeleting && handleDeleteComment(comment.comment_id)}
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Like Heart Button */}
                <div className="pt-2 pr-1 transition-opacity">
                    <Heart
                        size={comment.user_has_liked ? 14 : 12}
                        className={cn(
                            "cursor-pointer transition-all active:scale-90",
                            comment.user_has_liked
                                ? "fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                : "text-muted-foreground/30 hover:text-red-500 opacity-0 group-hover/comment:opacity-100"
                        )}
                        onClick={() => handlesCommentLike(comment.comment_id, !!comment.user_has_liked)}
                    />
                </div>
            </div>
        );
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={cn(
                "flex w-full mb-3 group relative",
                !isEditing && "select-none",
                isOwnPost ? "justify-end" : "justify-start"
            )}
        >
            <div className={cn(
                "flex max-w-[85%] sm:max-w-[70%] md:max-w-[60%] gap-2.5",
                isOwnPost ? "flex-row-reverse" : "flex-row"
            )}>
                {!isOwnPost && (
                    <div className="relative shrink-0 mt-auto mb-1">
                        <Avatar className="w-8 h-8 md:w-9 md:h-9 border-2 border-background shadow-sm ring-1 ring-border/10">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.user_name}`} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[10px]">{post.user_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background ring-1 ring-green-500/20"></div>
                    </div>
                )}

                <div className="flex flex-col gap-1 w-full min-w-0">
                    {!isOwnPost && (
                        <span className="text-[11px] font-bold text-primary/80 ml-3.5 opacity-90 tracking-tight">
                            {post.user_name}
                        </span>
                    )}

                    <div className={cn(
                        "relative px-4 py-3 md:px-6 md:py-4 shadow-xl break-words transition-all duration-300 group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]",
                        isOwnPost
                            ? "bg-gradient-to-br from-primary via-primary/90 to-blue-700 text-white rounded-[24px] rounded-tr-sm border border-white/10 shadow-primary/20"
                            : "glass-card-premium border-border dark:border-white/5 text-foreground dark:text-slate-200 rounded-[24px] rounded-tl-sm hover:shadow-primary/5"
                    )}>
                        {post.image_file_id && (
                            <div className="mb-4 rounded-2xl overflow-hidden bg-black/20 ring-1 ring-white/10 relative z-10 shadow-2xl">
                                <img
                                    src={getImageUrl(post.image_file_id)}
                                    alt="Attachment"
                                    className="w-full h-auto max-h-[420px] object-cover hover:scale-[1.03] transition-transform duration-700 cursor-zoom-in"
                                    onClick={() => onImageClick?.(getImageUrl(post.image_file_id!))}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                            </div>
                        )}
                        {isEditing ? (
                            <div className="flex flex-col gap-2 min-w-[200px]">
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full bg-card dark:bg-background/50 border border-border dark:border-white/20 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-foreground/50 text-foreground resize-none"
                                    rows={Math.min(5, editContent.split('\n').length + 1)}
                                    autoFocus
                                />
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => { setIsEditing(false); setEditContent(localContent); }}
                                        className="h-7 text-[11px] text-primary-foreground/80 hover:bg-black/10"
                                        disabled={isSavingEdit}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleEditPost}
                                        className="h-7 text-[11px] bg-white text-primary font-bold hover:bg-white/90"
                                        disabled={isSavingEdit || !editContent.trim()}
                                    >
                                        {isSavingEdit ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[15px] md:text-[15.5px] whitespace-pre-wrap leading-relaxed tracking-normal font-normal">
                                {localContent}
                            </p>
                        )}

                        {/* Reaction Chips */}
                        {Object.keys(reactions).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2 mb-1">
                                {Object.entries(reactions).map(([emoji, count]) => (
                                    <button
                                        key={emoji}
                                        onClick={(e) => { e.stopPropagation(); handleReaction(emoji); }}
                                        className={cn(
                                            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium transition-all border",
                                            userReaction === emoji
                                                ? "bg-primary/20 border-primary/30 text-primary"
                                                : "bg-black/5 border-transparent text-muted-foreground hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
                                        )}
                                    >
                                        <span>{emoji}</span>
                                        <span className="opacity-80">{count}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className={cn(
                            "flex items-center gap-1.5 mt-1.5",
                            isOwnPost ? "justify-end text-primary-foreground/70" : "justify-end text-muted-foreground/70"
                        )}>
                            <span className="text-[10px] font-medium opacity-80">
                                {format(new Date(post.created_at), "h:mm a")}
                                {post.updated_at && <span className="ml-1 opacity-60">(edited)</span>}
                            </span>
                            {isLiked && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-1">
                                    <Heart className={cn("h-3 w-3 fill-red-500 text-red-500 drop-shadow-sm")} />
                                </motion.div>
                            )}
                            {isOwnPost && <CheckCheck className="w-3.5 h-3.5 opacity-80 ml-0.5" />}
                            {/* Delete Menu - Only for post owner, admin, or moderator */}
                            {(post.user_id === user?.user_id || user?.role === "admin" || user?.role === "moderator") && (
                                <div className="absolute top-1 right-2 opacity-50 hover:opacity-100 transition-opacity z-10">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-black/10 text-inherit">
                                                <MoreVertical className="h-3.5 w-3.5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-32 bg-background/90 backdrop-blur-xl">
                                            {isOwnPost && (
                                                <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer">
                                                    <Pencil className="mr-2 h-3.5 w-3.5" />
                                                    <span className="font-medium">Edit</span>
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem onClick={handleDeletePost} className="text-destructive focus:text-destructive cursor-pointer">
                                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                <span className="font-medium">Delete</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                            {!isEditing && (
                                <button
                                    className="absolute inset-0 w-full h-full cursor-default"
                                    onDoubleClick={(e) => handleLike(e)}
                                    tabIndex={-1}
                                />
                            )}
                        </div>

                    </div>

                    <div className={cn(
                        "flex items-center gap-0.5 px-2 transition-all duration-300 opacity-100",
                        isOwnPost ? "flex-row-reverse" : "flex-row"
                    )}>
                        <div
                            className="relative"
                            onMouseEnter={() => setIsHoveringLike(true)}
                            onMouseLeave={() => setIsHoveringLike(false)}
                        >
                            <ReactionPicker
                                isVisible={isHoveringLike}
                                onSelect={handleReaction}
                                currentReaction={userReaction}
                            />
                            <Button
                                variant="ghost" size="icon" onClick={(e) => handleLike(e)}
                                className={cn("h-7 w-auto px-2 rounded-full hover:bg-muted/50 gap-1.5", isLiked ? "text-red-500 hover:text-red-600 hover:bg-red-500/10" : "text-muted-foreground")}
                            >
                                <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                                {likeCount > 0 && <span className="text-[10px] font-bold">{likeCount}</span>}
                            </Button>
                        </div>
                        <Button
                            variant="ghost" size="icon" onClick={() => { toggleComments(); onReply(post.post_id, post.user_name); }}
                            className={cn("h-7 w-auto px-2 rounded-full hover:bg-muted/50 gap-1.5 text-muted-foreground hover:text-primary")}
                        >
                            <MessageSquare className="h-4 w-4" />
                            {post.comment_count > 0 && <span className="text-[10px] font-bold">{post.comment_count}</span>}
                        </Button>
                        <Button
                            variant="ghost" size="icon"
                            onClick={() => { toggleComments(); onReply(post.post_id, post.user_name); }}
                            className="h-7 w-7 rounded-full hover:bg-muted/50 text-muted-foreground"
                        >
                            <Reply className="h-4 w-4" />
                        </Button>
                    </div>

                    <AnimatePresence>
                        {showComments && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className={cn("overflow-hidden pl-2 md:pl-4 space-y-3 mt-1", isOwnPost ? "pr-4" : "")}
                            >
                                {commentsLoading ? (
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground py-2 pl-2">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Loading replies...
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-4 pl-1 ml-2">
                                            {topLevelComments.map(comment => {
                                                const replies = repliesByParent[comment.comment_id] || [];
                                                const isExpanded = expandedReplies[comment.comment_id];

                                                return (
                                                    <motion.div key={comment.comment_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>

                                                        <CommentRow comment={comment} />

                                                        {/* View Replies Button */}
                                                        {replies.length > 0 && (
                                                            <div className="pl-12 mt-2">
                                                                <div
                                                                    className="flex items-center gap-2 cursor-pointer group/line"
                                                                    onClick={() => toggleRepliesInfo(comment.comment_id)}
                                                                >
                                                                    <div className="h-[1px] w-8 bg-border dark:bg-muted-foreground/30 group-hover/line:bg-muted-foreground/60 transition-colors"></div>
                                                                    <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                                                                        {isExpanded ? "Hide replies" : `View replies (${replies.length})`}
                                                                    </span>
                                                                </div>

                                                                {/* Nested Replies */}
                                                                <AnimatePresence>
                                                                    {isExpanded && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, height: 0 }}
                                                                            animate={{ opacity: 1, height: "auto" }}
                                                                            exit={{ opacity: 0, height: 0 }}
                                                                            className="overflow-hidden"
                                                                        >
                                                                            {replies.map(reply => (
                                                                                <CommentRow key={reply.comment_id} comment={reply} isReply />
                                                                            ))}
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )
                                            })}
                                        </div>

                                        {comments.length === 0 && (
                                            <div
                                                className="text-[10px] text-muted-foreground italic py-2 pl-2 opacity-50 hover:opacity-100 cursor-pointer hover:text-primary transition-all"
                                                onClick={() => onReply(post.post_id, post.user_name)}
                                            >
                                                Start the conversation...
                                            </div>
                                        )}

                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div >
    );
};

export default PostCard;
