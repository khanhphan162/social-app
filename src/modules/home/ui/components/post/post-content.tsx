"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Shield, RotateCcw, Crown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Post {
    id: string;
    body: string;
    createdAt: Date;
    updatedAt: Date;
    isEditedByAdmin: boolean | null;
    isDeleted: boolean | null;
    editedBy: string | null;
    user: {
        id: string;
        name: string;
        username: string;
        imageUrl: string | null;
        role?: string;
    };
    editor?: {
        id: string;
        name: string;
        username: string;
    } | null;
}

interface PostContentProps {
    post: Post;
    currentUser: {
        id: string;
        role: string;
    };
    onEdit?: (post: Post) => void;
    onDelete?: (postId: string) => void;
    onRestore?: (postId: string) => void;
    onToggleExpanded?: () => void;
}

export const PostContent = ({
    post,
    currentUser,
    onEdit,
    onDelete,
    onRestore,
}: PostContentProps) => {
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const canEdit = (currentUser.id === post.user.id || currentUser.role === 'admin') && !post.isDeleted;
    const canDelete = (currentUser.id === post.user.id || currentUser.role === 'admin') && !post.isDeleted;
    const canRestore = currentUser.role === 'admin' && post.isDeleted;

    const isEdited = post.createdAt.getTime() !== post.updatedAt.getTime();
    const isAdmin = currentUser.role === 'admin';
    const isUserAdmin = post.user.role === 'admin';

    return (
        <div className={`border-b border-gray-200 px-4 py-3 hover:bg-gray-50 transition-colors ${
            post.isDeleted ? 'opacity-60 bg-red-50' : ''
        }`}>
            {/* Deleted Post Banner */}
            {post.isDeleted && isAdmin && (
                <div className="flex items-center justify-between p-3 mb-3 bg-red-100 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-red-800">
                        <Trash2 className="h-4 w-4" />
                        <span className="font-medium">This post has been deleted</span>
                    </div>
                    {canRestore && onRestore && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRestore(post.id)}
                            className="text-red-700 border-red-300 hover:bg-red-200"
                        >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Restore
                        </Button>
                    )}
                </div>
            )}

            <div className="flex space-x-3">
                {/* Avatar */}
                <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarFallback>{getInitials(post.user.name)}</AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-wrap">
                            <h3 className="font-bold text-gray-900 hover:underline cursor-pointer">
                                {post.user.name}
                            </h3>
                            {isUserAdmin && (
                                <Badge variant="secondary" className="text-xs">
                                    <Crown className="h-3 w-3 mr-1" />
                                    Admin
                                </Badge>
                            )}
                            <span className="text-gray-500 text-sm">
                                @{post.user.username}
                            </span>
                            <span className="text-gray-500 text-sm">·</span>
                            <time className="text-gray-500 text-sm hover:underline cursor-pointer" dateTime={post.createdAt.toISOString()}>
                                {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                            </time>
                            {isEdited && (
                                <>
                                    <span className="text-gray-500 text-sm">·</span>
                                    <span className="flex items-center text-gray-500 text-sm">
                                        {post.isEditedByAdmin && (<Shield className="h-3 w-3 mr-1" />)}
                                        edited
                                        {post.editor && post.editor.id !== post.user.id && (
                                            <span className="ml-1">by @{post.editor.username}</span>
                                        )}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Actions Menu */}
                        {(canEdit || canDelete || canRestore) && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-200 rounded-full">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {canEdit && onEdit && (
                                        <DropdownMenuItem onClick={() => onEdit(post)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                    )}
                                    {canRestore && onRestore && (
                                        <DropdownMenuItem onClick={() => onRestore(post.id)}>
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            Restore
                                        </DropdownMenuItem>
                                    )}
                                    {canDelete && onDelete && (
                                        <DropdownMenuItem 
                                            onClick={() => onDelete(post.id)}
                                            className="text-red-600 focus:text-red-600"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {/* Post Content */}
                    <div className={`mt-2 text-gray-900 whitespace-pre-wrap break-words ${
                        post.isDeleted ? 'text-gray-600 line-through' : ''
                    }`}>
                        {post.body}
                    </div>

                    {/* Admin edited notice */}
                    {post.isEditedByAdmin && post.editor && (
                        <div className="flex items-center space-x-2 mt-2 p-2 bg-blue-50 rounded-lg text-sm text-blue-800">
                            <Shield className="h-4 w-4" />
                            <span>
                                This post was edited by an administrator (@{post.editor.username})
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}