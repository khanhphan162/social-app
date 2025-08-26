"use client";

import { useParams } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit, Save, X, Crown, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PostContent } from "@/modules/home/ui/components/post/post-content";

export default function ProfilePage() {
    const params = useParams();
    const profileId = params.id as string;
    const { user: currentUser } = useSession();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");

    // Fetch user profile
    const { data: profileUser, isLoading: isLoadingProfile } = useQuery(
        trpc.user.getUserProfile.queryOptions({ id: profileId })
    );

    // Fetch user's posts
    const { data: userPosts, isLoading: isLoadingPosts } = useQuery(
        trpc.post.getUserPosts.queryOptions({
            userId: profileId,
            page: 1,
            limit: 20
        })
    );

    // Update user mutation
    const updateUserMutation = useMutation(
        trpc.user.updateUser.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['user', 'getUserProfile'] });
                queryClient.invalidateQueries({ queryKey: ['user', 'getMyProfile'] });
                setIsEditing(false);
            },
            onError: (error) => {
                console.error('Failed to update profile:', error);
            },
        })
    );

    const isOwnProfile = currentUser?.id === profileId;
    const canEdit = isOwnProfile || currentUser?.role === 'admin';

    const handleStartEdit = () => {
        setEditName(profileUser?.name || "");
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        if (editName.trim()) {
            updateUserMutation.mutate({ name: editName.trim() });
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditName("");
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (isLoadingProfile) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="text-center py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
                <p className="text-gray-600">The user you&apos;re looking for doesn&apos;t exist.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-20 w-20">
                                <AvatarFallback className="text-lg">
                                    {getInitials(profileUser.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    {isEditing ? (
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="text-xl font-bold"
                                                placeholder="Enter name"
                                            />
                                            <Button
                                                size="sm"
                                                onClick={handleSaveEdit}
                                                disabled={updateUserMutation.isPending}
                                            >
                                                {updateUserMutation.isPending ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Save className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleCancelEdit}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <h1 className="text-2xl font-bold text-gray-900">
                                                {profileUser.name}
                                            </h1>
                                            {canEdit && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={handleStartEdit}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </>
                                    )}
                                    {profileUser.role === 'admin' && (
                                        <Badge variant="secondary">
                                            <Crown className="h-3 w-3 mr-1" />
                                            Admin
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-gray-600">@{profileUser.username}</p>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span>
                                        Joined {formatDistanceToNow(new Date(profileUser.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Posts Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <span>Posts</span>
                        {userPosts && (
                            <Badge variant="outline">
                                {userPosts.total} {userPosts.total === 1 ? 'post' : 'posts'}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingPosts ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : userPosts && userPosts.posts.length > 0 ? (
                        <div className="space-y-4">
                            {userPosts.posts.map((post) => (
                                <PostContent
                                    key={post.id}
                                    post={{
                                        ...post,
                                        createdAt: new Date(post.createdAt),
                                        updatedAt: new Date(post.updatedAt),
                                    }}
                                    currentUser={{
                                        id: currentUser?.id || "",
                                        role: currentUser?.role || "user",
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>
                                {isOwnProfile
                                    ? "You haven't posted anything yet."
                                    : `${profileUser.name} hasn't posted anything yet.`
                                }
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}