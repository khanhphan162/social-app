"use client";

import { useState, useEffect } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Shield, Send, Loader2, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EditCommentDialog } from "./edit-comment-dialog";
import { DeleteConfirmDialog } from "../post/delete-confirm-dialog";

interface CommentSectionProps {
    postId: string;
    currentUser: {
        id: string;
        name: string;
        username: string;
        imageUrl?: string;
        role: string;
    };
}

export const CommentSection = ({ postId, currentUser }: CommentSectionProps) => {
    const [newComment, setNewComment] = useState("");
    const [editingComment, setEditingComment] = useState<any>(null);
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showAllComments, setShowAllComments] = useState(false);
    const [allLoadedComments, setAllLoadedComments] = useState<any[]>([]);
    const [hasLoadedPrevious, setHasLoadedPrevious] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    // Fetch comments
    const { data: commentsData, isLoading } = useQuery(
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
                // Invalidate comments for this specific post
                queryClient.invalidateQueries({ 
                    queryKey: ['comment', 'getComments', { postId }] 
                });
                // Also invalidate the posts query to update comment counts if needed
                queryClient.invalidateQueries({ 
                    queryKey: ['post', 'getPosts'] 
                });
            },
            onError: (error) => {
                console.error('Failed to create comment:', error);
            },
        })
    );

    // Delete comment mutation
    const deleteCommentMutation = useMutation(
        trpc.comment.deleteComment.mutationOptions({
            onSuccess: () => {
                // Invalidate comments for this specific post
                queryClient.invalidateQueries({ 
                    queryKey: ['comment', 'getComments', { postId }] 
                });
                // Also invalidate the posts query to update comment counts if needed
                queryClient.invalidateQueries({ 
                    queryKey: ['post', 'getPosts'] 
                });
                setDeletingCommentId(null);
            },
            onError: (error) => {
                console.error('Failed to delete comment:', error);
            },
        })
    );

    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;

        createCommentMutation.mutate({
            body: newComment.trim(),
            postId,
        });
    };

    const handleEditComment = (comment: any) => {
        setEditingComment(comment);
    };

    const handleDeleteComment = (commentId: string) => {
        setDeletingCommentId(commentId);
    };

    const confirmDeleteComment = () => {
        if (deletingCommentId) {
            deleteCommentMutation.mutate({ id: deletingCommentId });
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
        <div className="space-y-4">
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
                    <div className="flex space-x-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="text-xs">{getInitials(currentUser.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
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
                            <div className="flex justify-end">
                                <Button
                                    size="sm"
                                    onClick={handleSubmitComment}
                                    disabled={!newComment.trim() || createCommentMutation.isPending}
                                    className="bg-blue-500 hover:bg-blue-600"
                                >
                                    {createCommentMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                            Posting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-3 w-3 mr-1" />
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
                    ) : commentsData?.comments.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                    ) : (
                        <div className="space-y-3">
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

                            {commentsToShow.map((comment) => {
                                const canEdit = currentUser.id === comment.user.id || currentUser.role === 'admin';
                                const canDelete = currentUser.id === comment.user.id || currentUser.role === 'admin';
                                const isEdited = comment.createdAt.getTime() !== comment.updatedAt.getTime();

                                return (
                                    <Card key={comment.id} className="bg-gray-50">
                                        <CardContent className="p-3">
                                            <div className="flex space-x-3">
                                                <Avatar className="h-8 w-8 flex-shrink-0">
                                                    <AvatarFallback className="text-xs">{getInitials(comment.user.name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-medium text-sm">{comment.user.name}</span>
                                                            <span className="text-xs text-gray-500">@{comment.user.username}</span>
                                                            <span className="text-xs text-gray-500">
                                                                {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                                                            </span>
                                                            {isEdited && (
                                                                <>
                                                                    <span className="text-xs text-gray-500">•</span>
                                                                    <span className="text-xs text-gray-500 flex items-center">
                                                                        {comment.isEditedByAdmin && <Shield className="h-2 w-2 mr-1" />}
                                                                        edited
                                                                        {comment.editor && comment.editor.id !== comment.user.id && (
                                                                            <span className="ml-1">by @{comment.editor.username}</span>
                                                                        )}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                        {(canEdit || canDelete) && (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                                        <MoreHorizontal className="h-3 w-3" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    {canEdit && (
                                                                        <DropdownMenuItem onClick={() => handleEditComment(comment)}>
                                                                            <Edit className="mr-2 h-3 w-3" />
                                                                            Edit
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {canDelete && (
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleDeleteComment(comment.id)}
                                                                            className="text-red-600 focus:text-red-600"
                                                                        >
                                                                            <Trash2 className="mr-2 h-3 w-3" />
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap break-all overflow-wrap-anywhere">
                                                        {comment.body}
                                                    </p>
                                                    {comment.isEditedByAdmin && comment.editor && (
                                                        <div className="flex items-center space-x-1 mt-2 p-1 bg-blue-100 rounded text-xs text-blue-800">
                                                            <Shield className="h-3 w-3" />
                                                            <span>Edited by admin (@{comment.editor.username})</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}

                            {/* Show More Comments Button */}
                            {hasMoreToShow && (
                                <div className="flex justify-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowAllComments(true)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        Show {allLoadedComments.length - 3} more comments
                                    </Button>
                                </div>
                            )}

                            {/* Load More Comments (for pagination) */}
                            {showAllComments && commentsData?.hasMore && (
                                <div className="flex justify-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={loadMoreComments}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
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
                <EditCommentDialog
                    comment={editingComment}
                    isOpen={!!editingComment}
                    onClose={() => setEditingComment(null)}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['comment', 'getComments'] });
                        setEditingComment(null);
                    }}
                />
            )}

            {/* Delete Comment Confirmation */}
            <DeleteConfirmDialog
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