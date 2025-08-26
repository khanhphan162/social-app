"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { HomeNavbar } from "../components/home-navbar";
import { SearchProvider } from "../../contexts/search-context";

export const HomeLayout = ({ children }: { children: React.ReactNode }) => {
    const trpc = useTRPC();

    const { data: user } = useQuery(
        trpc.user.getMyProfile.queryOptions()
    );

    return (
        <SearchProvider>
            <div className="min-h-screen bg-gray-50">
                <HomeNavbar user={user} />
                <main className="pt-16">
                    {children}
                </main>
            </div>
        </SearchProvider>
    );
};