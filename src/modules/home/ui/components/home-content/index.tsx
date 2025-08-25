"use client"

import { useState } from "react";
import { useSession } from "@/hooks/use-session";
import AuthenticatedContent from "./authenticated-content";

const HomeContent = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const { user, isLoading, isInitialized } = useSession();

    // Show loading only while actively loading user data (not during initialization)
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Show welcome page for unauthenticated users (after initialization)
    if (!user) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Welcome to SocialApp
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Connect with friends and share your thoughts
                    </p>
                    <div className="space-x-4">
                        <a 
                            href="/register"
                            className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 inline-block"
                        >
                            Get Started
                        </a>
                        <a 
                            href="/login"
                            className="bg-gray-200 text-gray-900 px-6 py-3 rounded-md hover:bg-gray-300 inline-block"
                        >
                            Sign In
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Show authenticated content for logged-in users
    // Convert imageUrl from string | null to string | undefined for compatibility
    const userForAuth = {
        ...user,
        imageUrl: user.imageUrl ?? undefined
    };

    return (
        <AuthenticatedContent user={userForAuth} />
    );
}
 
export default HomeContent;