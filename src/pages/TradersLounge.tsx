import React, { useEffect, useState, useRef } from "react";
import { MessageSquare, RefreshCcw, ArrowLeft, Menu } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { getPosts } from "@/lib/postsApi";
import { Post, Comment } from "@/types/lounge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import CreatePostForm from "@/components/lounge/CreatePostForm";
import PostCard from "@/components/lounge/PostCard";
import UserLayout from "@/components/layout/UserLayout";
import { motion, AnimatePresence } from "framer-motion";
import { ChannelSidebar } from "@/components/lounge/ChannelSidebar";
import { UsersList } from "@/components/lounge/UsersList";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const TradersLounge: React.FC = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const LIMIT = 20;

    const { ref, inView } = useInView({
        threshold: 0,
        triggerOnce: false,
    });

    const bottomRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchPosts = async (currentPage: number, isRefresh = false) => {
        try {
            if (currentPage === 0) {
                if (!isRefresh) setIsLoading(true);
            } else {
                setIsLoadingMore(true);
            }

            const newPosts = await getPosts(currentPage * LIMIT, LIMIT);

            if (isRefresh) {
                setPosts(newPosts);
                setPage(0);
                setTimeout(() => {
                    bottomRef.current?.scrollIntoView({ behavior: "auto" });
                }, 100);
            } else {
                // If loading older messages (page > 0), prepend them
                // Wait, if reverse() is used in render, then posts should be [Newest...Oldest]
                // and reverse() makes it [Oldest...Newest].
                setPosts(prev => [...prev, ...newPosts]);
            }

            setHasMore(newPosts.length === LIMIT);
            setError(null);
        } catch (err) {
            setError("Failed to load posts.");
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchPosts(0, true);
    }, []);

    useEffect(() => {
        if (!isLoading && page === 0 && posts.length > 0) {
            // Ensure initial scroll to bottom
        }
    }, [isLoading, page, posts.length]);


    useEffect(() => {
        if (inView && hasMore && !isLoading && !isLoadingMore && !error) {
            setPage(prev => prev + 1);
            fetchPosts(page + 1);
        }
    }, [inView, hasMore, isLoading, isLoadingMore, page, error]);

    const handlePostDeleted = (postId: string) => {
        setPosts(posts.filter(p => p.post_id !== postId));
    };

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Reply Context State
    const [replyContext, setReplyContext] = useState<{ postId: string; commentId?: string; userName: string; contentPreview?: string } | null>(null);

    const handleReply = (postId: string, userName: string, commentId?: string, contentPreview?: string) => {
        setReplyContext({ postId, commentId, userName, contentPreview });
    };

    const [lastCommentAdded, setLastCommentAdded] = useState<Comment | null>(null);

    const handlePostCreated = (isComment: boolean = false) => {
        fetchPosts(0, true);
        if (!isComment) {
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
        }
    };

    return (
        <UserLayout showHeader={false}>
            <div className="h-[calc(100vh-80px)] flex flex-col overflow-hidden">
                {/* Header - Simplified for Lounge */}
                <div className="h-14 border-b border-border dark:border-border/40 flex items-center px-4 bg-background/80 dark:bg-background/80 backdrop-blur shrink-0 justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate("/community")} className="gap-2 text-muted-foreground hover:text-foreground hidden md:flex">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Community
                        </Button>
                        <div className="h-6 w-px bg-border dark:bg-border/50 mx-2 hidden md:block" />
                        <h1 className="font-bold"># general</h1>
                    </div>

                    {/* Mobile Open Sidebar Trigger could go here */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-80">
                            <ChannelSidebar className="w-full border-r-0" />
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Sidebar (Desktop) */}
                    <div className="hidden md:block h-full">
                        <ChannelSidebar />
                    </div>

                    {/* Main Chat Area */}
                    <div className="flex-1 flex flex-col relative min-w-0 bg-transparent dark:bg-background/50">
                        {/* Advanced Background Pattern */}
                        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            }}
                        />

                        <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 px-4 pb-4">
                            <div className="max-w-3xl mx-auto py-6">
                                {/* Welcome Banner in chat */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-10 mb-8 border-b border-border dark:border-border/40 mx-4"
                                >
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MessageSquare className="w-8 h-8 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">Welcome to #general</h2>
                                    <p className="text-muted-foreground text-sm">This is the start of the #general channel.</p>
                                </motion.div>

                                {/* Load More */}
                                {hasMore && (
                                    <div ref={ref} className="flex justify-center py-4">
                                        {isLoadingMore && <Loader2 className="h-6 w-6 animate-spin text-primary/50" />}
                                    </div>
                                )}

                                {/* Feed */}
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {[...posts].reverse().map((post) => (
                                        <PostCard
                                            key={post.post_id}
                                            post={post}
                                            onPostDeleted={handlePostDeleted}
                                            onImageClick={(url) => setSelectedImage(url)}
                                            onReply={handleReply}
                                            lastCommentAdded={lastCommentAdded}
                                        />
                                    ))}
                                </AnimatePresence>
                                <div ref={bottomRef} className="h-px" />

                                {isLoading && page === 0 && (
                                    <div className="flex flex-col items-center justify-center h-[40vh]">
                                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                        <p className="text-sm text-muted-foreground mt-4 animate-pulse">Connecting to encrypted channel...</p>
                                    </div>
                                )}

                                {error && (
                                    <div className="flex flex-col items-center justify-center p-8 border border-destructive/20 bg-destructive/5 rounded-2xl mb-6 mx-4">
                                        <RefreshCcw className="w-8 h-8 text-destructive mb-3 animate-pulse" />
                                        <p className="text-sm font-medium text-destructive">{error}</p>
                                        <Button variant="ghost" size="sm" onClick={() => fetchPosts(0, true)} className="mt-4 text-xs">
                                            Try Refreshing
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 z-20 shrink-0">
                            <div className="max-w-3xl mx-auto">
                                <CreatePostForm
                                    onPostCreated={handlePostCreated}
                                    replyContext={replyContext}
                                    onCancelReply={() => setReplyContext(null)}
                                    onCommentSuccess={(comment) => setLastCommentAdded(comment)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar (Desktop) */}
                    <div className="hidden lg:block h-full">
                        <UsersList />
                    </div>
                </div>

                {/* Lightbox */}
                <AnimatePresence>
                    {selectedImage && (
                        <motion.div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
                            <motion.img src={selectedImage} alt="Full" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </UserLayout>
    );
};

export default TradersLounge;
