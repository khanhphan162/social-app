"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

interface Comment {
    id: string;
    body: string;
    postId: string;
    user: {
        id: string;
        name: string;
        username: string;
    };
}

interface EditCommentDialogProps {
    comment: Comment | null;
    isOpen: boolean;
    onClose: () => void;
}

export const EditCommentDialog = ({ comment, isOpen, onClose }: EditCommentDialogProps) => {
    const [body, setBody] = useState(comment?.body || "");
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const updateCommentMutation = useMutation(
        trpc.comment.updateComment.mutationOptions({
            onSuccess: () => {
                // Invalidate comments for this specific post
                if (comment?.postId) {
                    queryClient.invalidateQueries({ 
                        queryKey: ['comment', 'getComments', { postId: comment.postId }] 
                    });
                }
                // Also invalidate the posts query to update any comment counts
                queryClient.invalidateQueries({ 
                    queryKey: ['post', 'getPosts'] 
                });
                onClose();
            },
            onError: (error) => {
                console.error("Failed to update comment:", error);
            },
        }),
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment || !body.trim()) return;

        updateCommentMutation.mutate({
            id: comment.id,
            body: body.trim(),
        });
    };

    const handleClose = () => {
        setBody(comment?.body || "");
        onClose();
    };

    // Update body when comment changes
    useEffect(() => {
        setBody(comment?.body || "");
    }, [comment]);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Comment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Write your comment..."
                            className="min-h-[100px] resize-none"
                            maxLength={1000}
                            disabled={updateCommentMutation.isPending}
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-muted-foreground">
                                {body.length}/1000 characters
                            </span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={updateCommentMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!body.trim() || updateCommentMutation.isPending || body === comment?.body}
                        >
                            {updateCommentMutation.isPending && (
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