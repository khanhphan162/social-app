"use client";

import { useSession } from '@/hooks/use-session';
import React, { createContext, useContext, ReactNode } from 'react';
import { TRPCClientErrorLike } from '@trpc/client';
import { AppRouter } from '@/server/router';

interface SessionContextType {
  user: {
    id: string;
    name: string;
    username: string;
    imageUrl: string | null;
    createdAt: Date;
    role: string;
  } | null | undefined;
  sessions: {
    id: string;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
    expiresAt: Date;
  }[] | undefined;
  error: TRPCClientErrorLike<AppRouter> | null;
  sessionToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
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