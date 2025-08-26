"use client";

import { HomeNavbar } from "../../modules/home/ui/components/home-navbar";
import { LoadingSpinner } from "../../components/ui/loading-spinner";
import { useSessionContext } from "../../providers/session-provider";

interface HomeLayoutProps {
    children: React.ReactNode;
}

const HomeLayout = ({ children }: HomeLayoutProps) => {
    const { 
        user, 
        isLoading,
    } = useSessionContext();
    
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
            <div className="w-full">
                {user ? (
                    <HomeNavbar 
                        user={user}
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
    );
};

export default HomeLayout;