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

interface Post {
    id: string;
    body: string;
    user: {
        id: string;
        name: string;
        username: string;
    };
}

interface EditPostDialogProps {
    post: Post | null;
    isOpen: boolean;
    onClose: () => void;
}

export const EditPostDialog = ({ post, isOpen, onClose }: EditPostDialogProps) => {
    const [body, setBody] = useState(post?.body || "");
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const updatePostMutation = useMutation(
        trpc.post.updatePost.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["post", "getPosts"] });
                onClose();
            },
            onError: (error) => {
                console.error("Failed to update post:", error);
            },
        }),
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!post || !body.trim()) return;

        updatePostMutation.mutate({
            id: post.id,
            body: body.trim(),
        });
    };

    const handleClose = () => {
        setBody(post?.body || "");
        onClose();
    };

    // Update body when post changes
    useEffect(() => {
        setBody(post?.body || "");
    }, [post]);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Post</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="What's on your mind?"
                            className="min-h-[120px] resize-none"
                            maxLength={2000}
                            disabled={updatePostMutation.isPending}
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-muted-foreground">
                                {body.length}/2000 characters
                            </span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={updatePostMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!body.trim() || updatePostMutation.isPending || body === post?.body}
                        >
                            {updatePostMutation.isPending && (
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