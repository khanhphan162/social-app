"use client";

import { HomeNavbar } from "@/modules/home/ui/components/home-navbar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SearchProvider } from "@/modules/home/contexts/search-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSessionContext } from "@/providers/session-provider";

interface HomeLayoutProps {
    children: React.ReactNode;
}

const HomeLayout = ({ children }: HomeLayoutProps) => {
    const { 
        user, 
        isLoading, 
        isAuthenticated, 
        error,
        logout,
        logoutAll,
        sessions,
        isRefreshing 
    } = useSessionContext();
    
    const router = useRouter();

    // Remove the automatic redirect - let individual pages handle authentication
    // useEffect(() => {
    //     if (!isLoading && !isAuthenticated && !error) {
    //         router.push('/login');
    //     }
    // }, [isLoading, isAuthenticated, error, router]);

    // Show loading spinner only while actively checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    // Always render the layout, regardless of authentication status
    return (
        <SearchProvider>
            <div className="w-full">
                {user ? (
                    <HomeNavbar 
                        user={user} 
                        onLogout={logout}
                        onLogoutAll={logoutAll}
                        sessions={sessions}
                        isRefreshing={isRefreshing}
                    />
                ) : (
                    <HomeNavbar />
                )}

                <div className="flex min-h-screen pt-[4rem]">
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </SearchProvider>
    );
};

export default HomeLayout;