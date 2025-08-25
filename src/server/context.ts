import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import * as schema from "@/db/schema";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, gt } from "drizzle-orm";
import { users, sessions } from "@/db/schema";

dotenv.config({path: ".env.local"});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) throw new Error("DATABASE_URL is not defined");

const config = { databaseUrl };
export const db = drizzle(databaseUrl, { schema });

// Custom function to verify session token
const verifySessionToken = async (token: string) => {
  try {
    const session = await db.query.sessions.findFirst({
      where: and(
        eq(sessions.token, token),
        eq(sessions.isActive, true),
        gt(sessions.expiresAt, new Date()) // Check if session hasn't expired
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
      return null;
    }

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
    console.log("Session verification error:", error);
    return null;
  }
};

const createTRPCContext = async ({ req }: FetchCreateContextFnOptions) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.get('authorization');
    const cookieHeader = req.headers.get('cookie');
    
    // Get token from either Authorization header or cookie
    let token: string | null = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (cookieHeader) {
      // Parse sessionToken from cookie string
      const sessionTokenMatch = cookieHeader.match(/sessionToken=([^;]+)/);
      if (sessionTokenMatch) {
        token = sessionTokenMatch[1];
      }
    }

    if (token) {
      const authData = await verifySessionToken(token);
      
      if (authData) {
        return { 
          req, 
          user: authData.user, 
          session: authData.session,
          db, 
          config 
        };
      }
    }
  } catch (error) {
    console.log("Authentication error:", error);
  }

  // Return context without user/session if authentication fails
  return { req, db, config };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

export default createTRPCContext;