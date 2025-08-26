"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface BaseUser {
    id: string;
    name: string;
    username: string;
}

interface Post {
    id: string;
    body: string;
    user: BaseUser;
}

interface Comment {
    id: string;
    body: string;
    postId: string;
    user: BaseUser;
}

type EditModalProps = 
    | {
        type: "post";
        item: Post | null;
        isOpen: boolean;
        onClose: () => void;
        onSuccess?: () => void;
    }
    | {
        type: "comment";
        item: Comment | null;
        isOpen: boolean;
        onClose: () => void;
        onSuccess?: () => void;
    };

export const EditModal = ({ type, item, isOpen, onClose, onSuccess }: EditModalProps) => {
    const [body, setBody] = useState(item?.body || "");
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    // Get refetch function for posts (used for post editing)
    const { refetch: refetchPosts } = useQuery(
        trpc.post.getPosts.queryOptions({
            page: 1,
            limit: 10,
        })
    );

    // Post update mutation
    const updatePostMutation = useMutation(
        trpc.post.updatePost.mutationOptions({
            onSuccess: () => {
                if (onSuccess) {
                    onSuccess();
                } else {
                    refetchPosts();
                }
                onClose();
            },
            onError: (error) => {
                console.error("Failed to update post:", error);
            },
        }),
    );

    // Comment update mutation
    const updateCommentMutation = useMutation(
        trpc.comment.updateComment.mutationOptions({
            onSuccess: () => {
                if (onSuccess) {
                    onSuccess();
                } else {
                    // Fallback: refetch queries directly
                    const comment = item as Comment;
                    queryClient.refetchQueries({ 
                        queryKey: ['comment', 'getComments', { postId: comment?.postId }],
                        type: 'active'
                    });
                    queryClient.refetchQueries({ 
                        queryKey: ['post', 'getPosts'],
                        type: 'active'
                    });
                }
                onClose();
            },
            onError: (error) => {
                console.error("Failed to update comment:", error);
            },
        }),
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!item || !body.trim()) return;

        if (type === "post") {
            updatePostMutation.mutate({
                id: item.id,
                body: body.trim(),
            });
        } else {
            updateCommentMutation.mutate({
                id: item.id,
                body: body.trim(),
            });
        }
    };

    const handleClose = () => {
        setBody(item?.body || "");
        onClose();
    };

    // Update body when item changes
    useEffect(() => {
        setBody(item?.body || "");
    }, [item]);

    const isLoading = type === "post" ? updatePostMutation.isPending : updateCommentMutation.isPending;
    const maxLength = type === "post" ? 2000 : 1000;
    const minHeight = type === "post" ? "min-h-[120px]" : "min-h-[100px]";
    const placeholder = type === "post" ? "What's on your mind?" : "Write your comment...";
    const title = type === "post" ? "Edit Post" : "Edit Comment";

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder={placeholder}
                            className={`${minHeight} resize-none`}
                            maxLength={maxLength}
                            disabled={isLoading}
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-muted-foreground">
                                {body.length}/{maxLength} characters
                            </span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!body.trim() || isLoading || body === item?.body}
                        >
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};