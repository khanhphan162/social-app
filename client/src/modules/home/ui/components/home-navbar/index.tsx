"use client";

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

import { SearchInput } from "./search-input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, User, Settings } from "lucide-react"

import { useTRPC } from "@/trpc/client"
import { useMutation } from "@tanstack/react-query"
import { AuthButton } from "@/modules/auth/ui/components/auth-button";

interface User {
    id: string;
    name: string;
    username: string;
    imageUrl: string | null;
    role: string;
}

interface HomeNavbarProps {
    user?: User;
}

export const HomeNavbar = ({
    user
}: HomeNavbarProps) => {
    const trpc = useTRPC();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const logoutMutation = useMutation(trpc.session.logout.mutationOptions({
        onSuccess: () => {
            // Clear the session cookie
            document.cookie = 'sessionToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
            // Refresh the page to reset all state
            window.location.href = '/';
        },
        onError: (error) => {
            console.error('Logout failed:', error);
            // Even if logout fails on server, clear local session
            document.cookie = 'sessionToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            
            // Refresh the page to reset all state
            window.location.href = '/';
        },
        onSettled: () => {
            setIsLoggingOut(false);
        }
    }));

    const handleLogout = () => {
        setIsLoggingOut(true);

        // Get session ID from cookie if available
        const sessionToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('sessionToken='))
            ?.split('=')[1];

        logoutMutation.mutate({
            sessionId: sessionToken || "",
            logoutAll: false,
        });
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b flex items-center px-4 z-50">
            <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
                {/* Logo */}
                <div className="flex items-center flex-shrink-0">
                    <Link href="/">
                        <div className="p-2 flex items-center gap-2">
                            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
                            <p className="text-xl font-semibold text-blue-500 tracking-tight">SocialApp</p>
                        </div>
                    </Link>
                </div>
                
                {user ? (
                    <>
                        {/* Search bar */}
                        <div className="flex-1 flex justify-center max-w-[600px] mx-auto">
                            <SearchInput />
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <div className="flex flex-col space-y-1 p-2">
                                        <p className="text-sm font-medium leading-none">{user.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            @{user.username}
                                        </p>
                                        {user.role === 'admin' && (
                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                                Admin
                                            </span>
                                        )}
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={`/profile/${user.id}`} className="flex items-center">
                                            <User className="mr-2 h-4 w-4" />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings" className="flex items-center">
                                            <Settings className="mr-2 h-4 w-4" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="text-red-600 focus:text-red-600"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        {isLoggingOut ? "Logging out..." : "Log out"}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-2 ml-auto">
                        <AuthButton href="/register">
                            <Button
                                variant="outline"
                                className="px-4 py-2 text-sm font-medium bg-blue-500 text-white hover:text-white hover:bg-blue-600 rounded-md shadow-sm">
                                Register
                            </Button>
                        </AuthButton>
                        <AuthButton href="/login">
                            <Button
                                variant="outline"
                                className="px-4 py-2 text-sm font-medium bg-white text-blue-600 hover:text-blue-600 hover:bg-blue-50 rounded-md shadow-sm">
                                Log In
                            </Button>
                        </AuthButton>
                    </div>
                )}
            </div>
        </nav >
    )
}