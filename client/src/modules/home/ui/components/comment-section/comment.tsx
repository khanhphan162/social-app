"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

interface CommentProps {
    comment: Comment;
    currentUser: {
        id: string;
        name: string;
        username: string;
        imageUrl: string | null;
        role: string;
    };
    onEdit: (comment: Comment) => void;
    onDelete: (commentId: string) => void;
}

export const CommentItem = ({ comment, currentUser, onEdit, onDelete }: CommentProps) => {
    const canEdit = currentUser.id === comment.user.id || currentUser.role === 'admin';
    const canDelete = currentUser.id === comment.user.id || currentUser.role === 'admin';
    const isEdited = comment.createdAt.getTime() !== comment.updatedAt.getTime();
    const isDeleted = comment.isDeleted;
    const isAdmin = currentUser.role === 'admin';

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Skip deleted comments for non-admin users
    if (isDeleted && !isAdmin) {
        return null;
    }

    return (
        <Card className={`mb-2 ${isDeleted ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
            <CardContent className="p-4 mx-2">
                <div className="flex space-x-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="text-xs">{getInitials(comment.user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <span className="font-medium text-sm">{comment.user.name}</span>
                                <span className="text-xs text-gray-500">@{comment.user.username}</span>
                                <span className="text-xs text-gray-500">
                                    {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                                </span>
                                {isDeleted && (
                                    <>
                                        <span className="text-xs text-gray-500">•</span>
                                        <span className="text-xs text-red-600 font-medium flex items-center">
                                            <Trash2 className="h-2 w-2 mr-1" />
                                            DELETED
                                        </span>
                                    </>
                                )}
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
                            {(canEdit || canDelete) && !isDeleted && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                            <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {canEdit && (
                                            <DropdownMenuItem onClick={() => onEdit(comment)}>
                                                <Edit className="mr-2 h-3 w-3" />
                                                Edit
                                            </DropdownMenuItem>
                                        )}
                                        {canDelete && (
                                            <DropdownMenuItem
                                                onClick={() => onDelete(comment.id)}
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
                        <p className={`text-sm mt-2 whitespace-pre-wrap break-all overflow-wrap-anywhere ${
                            isDeleted ? 'text-gray-500 italic line-through' : 'text-gray-900'
                        }`}>
                            {isDeleted ? '[This comment has been deleted]' : comment.body}
                        </p>
                        {comment.isEditedByAdmin && comment.editor && (
                            <div className="flex items-center space-x-1 mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
                                <Shield className="h-3 w-3" />
                                <span>Edited by admin (@{comment.editor.username})</span>
                            </div>
                        )}
                        {isDeleted && isAdmin && (
                            <div className="flex items-center space-x-1 mt-3 p-2 bg-red-100 rounded text-xs text-red-800">
                                <Trash2 className="h-3 w-3" />
                                <span>This comment has been deleted</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};