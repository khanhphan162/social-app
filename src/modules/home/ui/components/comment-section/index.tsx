"use client";

import { useState, useEffect } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { EditModal } from "@/components/modals/edit-modal";
import { DeleteModal } from "@/components/modals/delete-modal";
import { CommentItem } from "./comment";

interface CommentSectionProps {
    postId: string;
    currentUser: {
        id: string;
        name: string;
        username: string;
        imageUrl: string | null;
        role: string;
    };
}

// Add proper type definitions
interface Comment {
    id: string;
    body: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: string;
        name: string;
        username: string;
        imageUrl: string | null;
    };
    postId: string;
    userId: string;
    editedBy: string | null;
    isEditedByAdmin: boolean | null;
    isDeleted: boolean | null;
    editor?: {
        id: string;
        name: string;
        username: string;
        imageUrl: string | null;
    } | null;
}

export const CommentSection = ({ postId, currentUser }: CommentSectionProps) => {
    const [newComment, setNewComment] = useState("");
    const [editingComment, setEditingComment] = useState<Comment | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showAllComments, setShowAllComments] = useState(false);
    const [allLoadedComments, setAllLoadedComments] = useState<Comment[]>([]);
    const [hasLoadedPrevious, setHasLoadedPrevious] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);

    const trpc = useTRPC();
    const queryClient = useQueryClient();

    // Fetch comments with refetch function
    const { data: commentsData, isLoading, refetch: refetchComments } = useSuspenseQuery(
        trpc.comment.getComments.queryOptions({
            postId,
            page: currentPage,
            limit: 10,
        })
    );

    // Update allLoadedComments when new data arrives
    useEffect(() => {
        if (commentsData?.comments) {
            if (currentPage === 1) {
                // First page load - replace all comments
                setAllLoadedComments(commentsData.comments);
            } else {
                // Additional page load - append to existing comments
                setAllLoadedComments(prev => {
                    const existingIds = new Set(prev.map(c => c.id));
                    const newComments = commentsData.comments.filter(c => !existingIds.has(c.id));
                    return [...prev, ...newComments];
                });
            }
        }
    }, [commentsData, currentPage]);

    // Create comment mutation
    const createCommentMutation = useMutation(
        trpc.comment.createComment.mutationOptions({
            onSuccess: () => {
                setNewComment("");
                // Refetch comments instead of invalidation
                refetchComments();
            },
            onError: (error) => {
                console.error('❌ Failed to create comment:', error);
            },
        })
    );

    // Delete comment mutation
    const deleteCommentMutation = useMutation(
        trpc.comment.deleteComment.mutationOptions({
            onSuccess: () => {
                // Refetch comments instead of invalidation
                refetchComments();
                // Also refetch posts to update comment counts
                queryClient.refetchQueries({
                    queryKey: ['post', 'getPosts'],
                    type: 'active'
                });
                setDeletingCommentId(null);
            },
            onError: (error) => {
                console.error('Failed to delete comment:', error);
            },
        })
    );

    const handleSubmitComment = async () => {
        console.log("Comment submitted");
        if (!newComment.trim()) return;

        createCommentMutation.mutate({
            body: newComment.trim(),
            postId,
        });
    };

    const handleEditComment = (comment: Comment) => {
        setEditingComment(comment);
        setIsEditDialogOpen(true);
    };

    const handleDeleteComment = (commentId: string) => {
        setDeletingCommentId(commentId);
    };

    const confirmDeleteComment = () => {
        if (deletingCommentId) {
            deleteCommentMutation.mutate({ id: deletingCommentId });
            queryClient.refetchQueries({
                queryKey: ['post', 'getPosts'],
                type: 'active'
            });
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const loadMoreComments = () => {
        if (commentsData?.hasMore) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const loadPreviousComments = () => {
        // Load from page 1 to get the latest comments
        setCurrentPage(1);
        setHasLoadedPrevious(true);
        // Reset to show all comments when loading previous
        setShowAllComments(true);
    };

    // Determine which comments to show
    const commentsToShow = showAllComments
        ? allLoadedComments
        : allLoadedComments.slice(0, 3);

    const hasMoreToShow = !showAllComments && allLoadedComments.length > 3;
    const canLoadPrevious = currentPage > 1 && !hasLoadedPrevious;

    return (
        <div className="space-y-4 px-4 md:px-6">
            {/* Comments Header with Collapse Toggle */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-700">
                        Comments {commentsData?.totalCount ? `(${commentsData.totalCount})` : ''}
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="h-8 w-8 p-0"
                >
                    {isCollapsed ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronUp className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Collapsible Content */}
            {!isCollapsed && (
                <>
                    {/* Create Comment */}
                    <div className="flex space-x-3 p-4 bg-white rounded-lg border border-gray-200 mx-2">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="text-xs">{getInitials(currentUser.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                            <Textarea
                                placeholder="Write a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="min-h-[80px] resize-none"
                                maxLength={300}
                                disabled={createCommentMutation.isPending}
                            />
                            {newComment.length > 250 && (
                                <p className="text-sm text-gray-500">
                                    {300 - newComment.length} characters remaining
                                </p>
                            )}
                            <div className="flex justify-end pt-2">
                                <Button
                                    size="sm"
                                    onClick={handleSubmitComment}
                                    disabled={!newComment.trim() || createCommentMutation.isPending}
                                    className="bg-blue-500 hover:bg-blue-600 px-6 py-2"
                                >
                                    {createCommentMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                            Posting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-3 w-3 mr-2" />
                                            Comment
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Comments List */}
                    {isLoading ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        </div>
                    ) : commentsToShow.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>No comments yet. Be the first to comment!</p>
                        </div>
                    ) : (
                        <div className="space-y-3 px-2">
                            {/* Load Previous Comments Button */}
                            {canLoadPrevious && (
                                <div className="flex justify-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={loadPreviousComments}
                                        disabled={isLoading}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            'Load previous comments'
                                        )}
                                    </Button>
                                </div>
                            )}

                            {commentsToShow.map((comment) => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    currentUser={currentUser}
                                    onEdit={handleEditComment}
                                    onDelete={handleDeleteComment}
                                />
                            ))}

                            {/* Show More Comments Button */}
                            {hasMoreToShow && (
                                <div className="flex justify-center py-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowAllComments(true)}
                                        className="text-blue-600 hover:text-blue-800 px-4 py-2"
                                    >
                                        Show {allLoadedComments.length - 3} more comments
                                    </Button>
                                </div>
                            )}

                            {/* Load More Comments (for pagination) */}
                            {showAllComments && commentsData?.hasMore && (
                                <div className="flex justify-center py-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={loadMoreComments}
                                        disabled={isLoading}
                                        className="px-4 py-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            'Load more comments'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Edit Comment Dialog */}
            {editingComment && (
                <EditModal
                    type="comment"
                    item={editingComment}
                    isOpen={isEditDialogOpen}
                    onClose={() => {
                        setIsEditDialogOpen(false);
                        setEditingComment(null);
                    }}
                    onSuccess={refetchComments}
                />
            )}

            {/* Delete Comment Confirmation */}
            <DeleteModal
                isOpen={!!deletingCommentId}
                onClose={() => setDeletingCommentId(null)}
                onConfirm={confirmDeleteComment}
                isLoading={deleteCommentMutation.isPending}
                title="Delete Comment"
                description="Are you sure you want to delete this comment? This action cannot be undone."
            />
        </div>
    );
};