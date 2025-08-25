"use client";

import { useSession } from '@/hooks/use-session';
import React, { createContext, useContext, ReactNode } from 'react';

interface User {
    id: string;
    name: string;
    username: string;
    imageUrl?: string;
    role: string;
}

interface Session {
    id: string;
    token: string;
    expiresAt: Date;
}

interface SessionContextType {
    user: User | null;
    sessions: Session[] | undefined;
    sessionToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: Error | null;
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