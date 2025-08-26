"use client";

import { useSession } from '@/hooks/use-session';
import React, { createContext, useContext, ReactNode } from 'react';
import { TRPCClientErrorLike } from '@trpc/client';

interface User {
    id: string;
    name: string;
    username: string;
    imageUrl: string | null;
    role: string;
}

interface Session {
    id: string;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
    expiresAt: Date;
}

interface SessionContextType {
    user: User | null | undefined;
    sessions: Session[] | undefined;
    sessionToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: TRPCClientErrorLike<any> | null;
    logout: () => void;
    logoutAll: () => void;
    refreshSession: () => void;
    refetchUser: () => void;
    refetchSessions: () => void;
    isRefreshing: boolean;
    isLoggingOut: boolean;
    isInitialized: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const session = useSession();

    return (
        <SessionContext.Provider value={session}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSessionContext = () => {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSessionContext must be used within a SessionProvider');
    }
    return context;
};