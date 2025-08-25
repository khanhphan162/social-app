"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2Icon, SendIcon } from "lucide-react";
import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearch } from "@/modules/home/contexts/search-context";

interface CreatePostProps {
    user: {
        id: string;
        name: string;
        username: string;
        imageUrl?: string;
    };
}

const CreatePost = ({ user }: CreatePostProps) => {
    const [content, setContent] = useState("");
    const trpc = useTRPC();
    const { searchQuery } = useSearch();

    // Get refetch function from getPosts query
    const { refetch: refetchPosts } = useQuery(
        trpc.post.getPosts.queryOptions({
            page: 1,
            limit: 10,
            search: searchQuery || undefined,
        })
    );

    const createPostMutation = useMutation(trpc.post.createPost.mutationOptions({
        onSuccess: () => {
            setContent("");
            // Refetch posts after successful creation
            refetchPosts();
        },
        onError: (error) => {
            console.error('Failed to create post:', error);
        },
    }));

    const handleSubmit = async () => {
        if (!content.trim()) return;

        createPostMutation.mutate({
            body: content.trim(),
        });
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div className="flex space-x-4">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <Textarea
                                placeholder="What's on your mind?"
                                className="min-h-[100px] resize-none border-none focus-visible:ring-0 text-base p-0"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                disabled={createPostMutation.isPending}
                                maxLength={2000}
                            />
                            {content.length > 1900 && (
                                <p className="text-sm text-gray-500 mt-2">
                                    {2000 - content.length} characters remaining
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex-1" />
                    <Button
                        className="flex items-center bg-blue-500 hover:bg-blue-600"
                        onClick={handleSubmit}
                        disabled={!content.trim() || createPostMutation.isPending}
                    >
                        {createPostMutation.isPending ? (
                            <>
                                <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                                Posting...
                            </>
                        ) : (
                            <>
                                <SendIcon className="h-4 w-4 mr-2" />
                                Post
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default CreatePost;