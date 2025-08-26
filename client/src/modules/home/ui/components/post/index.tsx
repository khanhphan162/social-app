"use client";

import { PostContent } from "./post-content";
import { CommentSection } from "../comment-section";

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

interface User {
    id: string;
    name: string;
    username: string;
    imageUrl: string | null;
    role: string;
}

interface PostProps {
    post: Post;
    currentUser: User;
    onEdit: (post: Post) => void;
    onDelete: (postId: string) => void;
    onRestore: (postId: string) => void;
}

export const Post = ({
    post,
    currentUser,
    onEdit,
    onDelete,
    onRestore
}: PostProps) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <PostContent
                post={post}
                currentUser={{
                    id: currentUser.id,
                    role: currentUser.role,
                }}
                onEdit={onEdit}
                onDelete={onDelete}
                onRestore={onRestore}
            />
            <CommentSection
                postId={post.id}
                currentUser={currentUser}
            />
        </div>
    );
};