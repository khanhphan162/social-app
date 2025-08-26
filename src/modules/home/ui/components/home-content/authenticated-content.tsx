"use client";

import { useState, useEffect } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearch } from "@/modules/home/contexts/search-context";
import CreatePost from "../post/create-post";
import { PostCard } from "../post/post-card";
import { CommentSection } from "../comment/comment-section";
import { Button } from "@/components/ui/button";
import { Loader2, SearchIcon } from "lucide-react";
import { EditPostDialog } from "../post/edit-post-dialog";
import { DeleteConfirmDialog } from "../post/delete-confirm-dialog";

interface AuthenticatedContentProps {
    user: {
        id: string;
        name: string;
        username: string;
        imageUrl?: string;
        role: string;
    };
}

interface Post {
    id: string;
    body: string;
    createdAt: Date;
    updatedAt: Date;
    isEditedByAdmin?: boolean;
    isDeleted?: boolean;
    editedBy: string | null;
    user: {
        id: string;
        name: string;
        username: string;
        imageUrl?: string;
        role?: string;
    };
    editor?: {
        id: string;
        name: string;
        username: string;
    } | null;
}

const AuthenticatedContent = ({ user }: AuthenticatedContentProps) => {
    const [currentPage, setCurrentPage] = useState(1);

    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

    const { searchQuery } = useSearch();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const { data: postsData, isLoading, error, refetch: refetchPosts } = useQuery(
        trpc.post.getPosts.queryOptions({
            page: currentPage,
            limit: 10,
            search: searchQuery || undefined,
        })
    );

    const deletePostMutation = useMutation(
        trpc.post.deletePost.mutationOptions({
            onSuccess: () => {
                // Use refetch instead of invalidateQueries for immediate update
                refetchPosts();
                setDeletingPostId(null);
            },
            onError: (error) => {
                console.error('Failed to delete post:', error);
            },
        })
    );

    const restorePostMutation = useMutation(
        trpc.post.restorePost.mutationOptions({
            onSuccess: () => {
                // Use refetch instead of invalidateQueries for immediate update
                refetchPosts();
                if (searchQuery) {
                    queryClient.invalidateQueries({
                        queryKey: ['post', 'searchPosts', { query: searchQuery }]
                    });
                }
            },
            onError: (error) => {
                console.error('Failed to restore post:', error);
            },
        })
    );

    const handleDeletePost = () => {
        if (deletingPostId) {
            deletePostMutation.mutate({ id: deletingPostId });
        }
    };

    const handleRestorePost = (postId: string) => {
        restorePostMutation.mutate({ id: postId });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8 text-red-600">
                Error loading posts: {error.message}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Show search header */}
            {searchQuery && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-blue-800">
                        Search results for &quot;{searchQuery}&quot;
                    </h2>
                    <p className="text-sm text-blue-600 mt-1">
                        Showing posts matching content or username
                    </p>
                </div>
            )}

            {/* Create post */}
            {!searchQuery && <CreatePost user={user} />}

            {/* Posts */}
            {postsData?.posts.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <SearchIcon className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchQuery ? 'No posts found' : 'No posts yet'}
                    </h3>
                    <p className="text-gray-500 text-center py-4">No posts found matching &quot;{searchQuery}&quot;.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {postsData?.posts.map((post) => (
                        <div key={post.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                            <PostCard
                                key={post.id}
                                post={{
                                    ...post,
                                    createdAt: new Date(post.createdAt),
                                    updatedAt: new Date(post.updatedAt),
                                }}
                                currentUser={{
                                    id: user.id,
                                    role: user.role,
                                }}
                                onEdit={setEditingPost}
                                onDelete={setDeletingPostId}
                                onRestore={handleRestorePost}
                            />
                            <CommentSection
                                postId={post.id}
                                currentUser={user}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {postsData && postsData.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8 py-4">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-6"
                    >
                        Previous
                    </Button>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                            Page {currentPage} of {postsData.totalPages}
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage >= postsData.totalPages}
                        className="px-6"
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Edit Post Dialog */}
            {editingPost && (
                <EditPostDialog
                    post={editingPost}
                    isOpen={!!editingPost}
                    onClose={() => setEditingPost(null)}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen={!!deletingPostId}
                onClose={() => setDeletingPostId(null)}
                onConfirm={handleDeletePost}
                isLoading={deletePostMutation.isPending}
            />
        </div>
    );
};

export default AuthenticatedContent;