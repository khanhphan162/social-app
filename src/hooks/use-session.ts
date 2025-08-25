import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useEffect, useState, useCallback } from "react";

// Enhanced cookie utilities
const cookieUtils = {
  get: (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue ? decodeURIComponent(cookieValue) : null;
    }
    return null;
  },
  
  set: (name: string, value: string, expires: Date): void => {
    if (typeof document === 'undefined') return;
    
    const secure = window.location.protocol === 'https:' ? 'secure; ' : '';
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; ${secure}samesite=strict; expires=${expires.toUTCString()}`;
  },
  
  remove: (name: string): void => {
    if (typeof document === 'undefined') return;
    
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
  },
  
  getAll: (): string => {
    if (typeof document === 'undefined') return '';
    return document.cookie;
  }
};

export const useSession = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Enhanced session token retrieval
  useEffect(() => {
    const token = cookieUtils.get('sessionToken');
    
    console.log('🍪 Session initialization:', {
      tokenFound: !!token,
      tokenLength: token?.length,
      allCookies: cookieUtils.getAll()
    });
    
    setSessionToken(token);
    setIsInitialized(true);
  }, []);

  const { 
    data: user, 
    isLoading: userLoading, 
    error: userError,
    refetch: refetchUser 
  } = useQuery({
    ...trpc.user.getMyProfile.queryOptions(),
    enabled: !!sessionToken && isInitialized,
    retry: (failureCount, error: unknown) => {
      console.log('🔄 User query retry:', { failureCount, error: (error as Error)?.message });
      
      // Don't retry if it's an authentication error
      if ((error as Error)?.message?.includes('UNAUTHORIZED') || 
          error?.message?.includes('unauthorized') || 
          error?.message?.includes('authentication')) {
        console.log('❌ Authentication error - not retrying');
        return false;
      }
      return failureCount < 2;
    }
  });

  console.log('👤 User query state:', { 
    hasUser: !!user, 
    userLoading,
    userError: userError?.message, 
    hasSessionToken: !!sessionToken,
    isInitialized 
  });

  const { 
    data: sessions, 
    refetch: refetchSessions 
  } = useQuery({
    ...trpc.session.getUserSessions.queryOptions(),
    enabled: !!sessionToken && !!user,
    retry: (failureCount, error: unknown) => {
      console.log('🔄 Sessions query retry:', { failureCount, error: (error as Error)?.message });
      return failureCount < 2;
    }
  });

  const refreshSessionMutation = useMutation({
    ...trpc.session.refreshSession.mutationOptions({
      onSuccess: (data) => {
        console.log('🔄 Session refreshed successfully:', data);
        
        // Update cookie with new expiration
        const expires = new Date(data.expiresAt);
        if (sessionToken) {
          cookieUtils.set('sessionToken', sessionToken, expires);
        }
        
        // Refetch user data
        refetchUser();
      },
      onError: (error) => {
        console.error('❌ Session refresh failed:', error);
        // If refresh fails, logout user
        handleLogout();
      },
    }),
  });

  // Logout mutation
  const logoutMutation = useMutation({
    ...trpc.session.logout.mutationOptions({
      onSuccess: () => {
        console.log('👋 Logout successful');
        handleLogout();
      },
      onError: (error) => {
        console.error('❌ Logout error:', error);
        // Even if logout API fails, clear local session
        handleLogout();
      }
    }),
  });

  // Enhanced logout handler with useCallback
  const handleLogout = useCallback(() => {
    console.log('🔄 Handling logout...');
    
    // Clear cookie
    cookieUtils.remove('sessionToken');
    
    // Clear query cache
    queryClient.clear();
    
    // Reset state
    setSessionToken(null);
    setIsInitialized(true);
  }, [queryClient]);

  // Refresh session function with useCallback
  const refreshSession = useCallback(async () => {
    try {
      console.log('🔄 Refreshing session...');
      await refetchUser();
      await refetchSessions();
    } catch (error) {
      console.error('❌ Failed to refresh session:', error);
      handleLogout();
    }
  }, [refetchUser, refetchSessions, handleLogout]);

  // Logout from current session
  const logout = () => {
    console.log('👋 Initiating logout...');
    
    if (sessions && sessions.length > 0) {
      logoutMutation.mutate({
        sessionId: sessions[0].id,
        logoutAll: false,
      });
    } else {
      handleLogout();
    }
  };

  // Logout from all sessions
  const logoutAll = () => {
    console.log('👋 Initiating logout from all sessions...');
    
    if (sessions && sessions.length > 0) {
      logoutMutation.mutate({
        sessionId: sessions[0].id,
        logoutAll: true,
      });
    } else {
      handleLogout();
    }
  };

  // Auto-refresh session when it's close to expiry
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      const currentSession = sessions[0];
      const expiresAt = new Date(currentSession.expiresAt);
      const now = new Date();
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();
      
      console.log('⏰ Session expiry check:', {
        expiresAt: expiresAt.toISOString(),
        now: now.toISOString(),
        timeUntilExpiryHours: Math.round(timeUntilExpiry / (1000 * 60 * 60)),
        shouldRefresh: timeUntilExpiry < 24 * 60 * 60 * 1000 && timeUntilExpiry > 0
      });
      
      // Refresh if session expires in less than 24 hours
      if (timeUntilExpiry < 24 * 60 * 60 * 1000 && timeUntilExpiry > 0) {
        console.log('🔄 Auto-refreshing session due to upcoming expiry');
        refreshSession();
      }
      
      // Set up auto-logout if session is expired
      if (timeUntilExpiry <= 0) {
        console.log('❌ Session expired, logging out');
        handleLogout();
      }
    }
  }, [sessions, handleLogout, refreshSession]);

  // Handle authentication errors
  useEffect(() => {
    if (userError && sessionToken && isInitialized) {
      const errorMessage = userError.message?.toLowerCase() || '';
      
      if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
        console.log('❌ Authentication error detected, clearing session');
        handleLogout();
      }
    }
  }, [userError, sessionToken, isInitialized, handleLogout]);

  return {
    user,
    sessions,
    sessionToken,
    isLoading: (!isInitialized) || (userLoading && !userError), // Don't show loading if there's an auth error
    isAuthenticated: !!user && !!sessionToken,
    error: userError,
    logout,
    logoutAll,
    refreshSession,
    refetchUser,
    refetchSessions,
    handleLogout,
    isRefreshing: refreshSessionMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isInitialized,
  };
};