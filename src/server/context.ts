import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import * as schema from "@/db/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, gt } from "drizzle-orm";
import { sessions } from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) throw new Error("DATABASE_URL is not defined");

const config = { databaseUrl };
export const db = drizzle(databaseUrl, { schema });

// Helper function for Fetch API requests (serverless)
const getFetchHeaders = (req: Request) => {
  const getHeaderValue = (value: string | null): string | null => {
    return value || null;
  };
  
  return {
    authorization: getHeaderValue(req.headers.get('authorization')),
    cookie: getHeaderValue(req.headers.get('cookie'))
  };
};

// Enhanced session verification with detailed logging
const verifySessionToken = async (token: string) => {
  console.log('🔍 Verifying session token:', token.substring(0, 10) + '...');
  
  try {
    const session = await db.query.sessions.findFirst({
      where: and(
        eq(sessions.token, token),
        eq(sessions.isActive, true),
        gt(sessions.expiresAt, new Date())
      ),
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            name: true,
            role: true,
            imageUrl: true,
            createdAt: true,
          }
        }
      }
    });

    if (!session) {
      console.log('❌ No valid session found for token');
      
      // Debug: Check if token exists but might be expired/inactive
      const expiredSession = await db.query.sessions.findFirst({
        where: eq(sessions.token, token),
        columns: {
          id: true,
          isActive: true,
          expiresAt: true,
          createdAt: true,
          userId: true
        }
      });
      
      if (expiredSession) {
        console.log('🔍 Found session but invalid:', {
          isActive: expiredSession.isActive,
          isExpired: new Date() > new Date(expiredSession.expiresAt),
          expiresAt: expiredSession.expiresAt,
          now: new Date(),
          userId: expiredSession.userId
        });
      } else {
        console.log('🔍 Token not found in database at all');
        
        // Check if any sessions exist for debugging
        const sessionCount = await db.query.sessions.findMany({
          columns: { id: true, token: true },
          limit: 3
        });
        console.log('🔍 Sample sessions in DB:', sessionCount.map(s => ({ 
          id: s.id, 
          tokenPreview: s.token.substring(0, 10) + '...' 
        })));
      }
      
      return null;
    }

    console.log('✅ Valid session found for user:', session.user.username);
    return {
      session: {
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
      },
      user: session.user
    };
  } catch (error) {
    console.error("❌ Session verification error:", error);
    return null;
  }
};

// Context creation function for Fetch adapter (Next.js API routes)
export const createFetchContext = async (opts: FetchCreateContextFnOptions) => {
  console.log('🚀 Creating tRPC Fetch context...');
  
  try {
    const headers = getFetchHeaders(opts.req);
    
    console.log('🔍 Headers extracted:', {
      hasAuthHeader: !!headers.authorization,
      hasCookieHeader: !!headers.cookie,
      cookiePreview: headers.cookie ? headers.cookie.substring(0, 100) + '...' : 'none'
    });
    
    let token: string | null = null;
    
    // Try Authorization header first (Bearer token)
    if (headers.authorization?.startsWith('Bearer ')) {
      token = headers.authorization.slice(7);
      console.log('📋 Token from Authorization header');
    } 
    // Then try cookie
    else if (headers.cookie) {
      const cookies = headers.cookie.split(';').map((cookie: string) => cookie.trim());
      const sessionCookie = cookies.find((cookie: string) => cookie.startsWith('sessionToken='));
      
      console.log('🍪 Available cookies:', cookies.map((c: string) => c.split('=')[0]));
      
      if (sessionCookie) {
        token = decodeURIComponent(sessionCookie.split('=')[1]);
        console.log('🍪 Token from cookie found, length:', token.length);
      } else {
        console.log('🍪 No sessionToken cookie found');
      }
    }

    if (!token) {
      console.log('❌ No authentication token found in request');
      return { req: opts.req, db, config, user: null, session: null };
    }

    console.log('🔑 Attempting to verify token...');
    const authData = await verifySessionToken(token);
    
    if (authData) {
      console.log('✅ Authentication successful for user:', authData.user.username);
      return { 
        req: opts.req, 
        user: authData.user, 
        session: authData.session,
        db, 
        config 
      };
    } else {
      console.log('❌ Authentication failed - invalid session');
      return { req: opts.req, db, config, user: null, session: null };
    }
  } catch (error: unknown) {
    console.error("❌ Fetch context creation error:", error);
    if (error instanceof Error) {
      console.error("❌ Error stack:", error.stack);
    }
    return { req: opts.req, db, config, user: null, session: null };
  }
};

// Export the context type and function
export type Context = Awaited<ReturnType<typeof createFetchContext>>;
export const createContext = createFetchContext;
export default createFetchContext;