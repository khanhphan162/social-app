"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface UserCardProps {
    user: {
        id: string;
        name: string;
        username: string;
        imageUrl?: string;
        role?: string;
        createdAt?: string;
    };
}

export const UserCard = ({ user }: UserCardProps) => {
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                        @{user.username}
                    </p>
                    {user.role === 'admin' && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 mt-1">
                            Admin
                        </span>
                    )}
                </div>
            </div>
            <div className="mt-3">
                <Link href={`/profile/${user.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                        <User className="mr-2 h-4 w-4" />
                        View Profile
                    </Button>
                </Link>
            </div>
        </div>
    );
};