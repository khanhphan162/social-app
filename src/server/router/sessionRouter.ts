import { publicProcedure, protectedProcedure, createTRPCRouter } from "../init";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { users as userTable, sessions as sessionTable, loginSchema, registerSchema } from "@/db/schema";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

export const sessionRouter = createTRPCRouter({
  login: publicProcedure
    .input(loginSchema.safeExtend({
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async (opts) => {
      const { username, password, ipAddress, userAgent } = opts.input
      const db = opts.ctx.db

      // Find user by username
      const user = await db.query.users.findFirst({
        where: eq(userTable.username, username),
      })

      if (!user) {
        throw new Error("Invalid username or password")
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        throw new Error("Invalid username or password")
      }

      // Generate session token
      const token = randomBytes(32).toString('hex')
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30) // 30 days from now

      // Create session
      const session = await db
        .insert(sessionTable)
        .values({
          userId: user.id,
          token,
          expiresAt,
          ipAddress,
          userAgent,
          isActive: true,
        })
        .returning()

      if (session.length === 0) {
        throw new Error("Failed to create session")
      }

      return {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          imageUrl: user.imageUrl,
        },
        session: {
          id: session[0].id,
          token: session[0].token,
          expiresAt: session[0].expiresAt,
        },
      }
    }),

  register: publicProcedure
    .input(registerSchema.safeExtend({
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async (opts) => {
      const { username, password, name, role, ipAddress, userAgent } = opts.input
      const db = opts.ctx.db

      // Check if username already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(userTable.username, username),
      })

      if (existingUser) {
        throw new Error("Username already exists")
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Create user
      const newUser = await db
        .insert(userTable)
        .values({
          username,
          password: hashedPassword,
          name,
          role: role || "user",
        })
        .returning()

      if (newUser.length === 0) {
        throw new Error("Failed to create user")
      }

      const user = newUser[0]

      // Generate session token
      const token = randomBytes(32).toString('hex')
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30) // 30 days from now

      // Create session
      const session = await db
        .insert(sessionTable)
        .values({
          userId: user.id,
          token,
          expiresAt,
          ipAddress,
          userAgent,
          isActive: true,
        })
        .returning()

      if (session.length === 0) {
        throw new Error("Failed to create session")
      }

      return {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          imageUrl: user.imageUrl,
        },
        session: {
          id: session[0].id,
          token: session[0].token,
          expiresAt: session[0].expiresAt,
        },
      }
    }),

  logout: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        logoutAll: z.boolean().default(false),
      })
    )
    .mutation(async (opts) => {
      const { sessionId, logoutAll } = opts.input
      const db = opts.ctx.db
      const userId = opts.ctx.user.id

      if (logoutAll) {
        // Deactivate all sessions for the user
        await db
          .update(sessionTable)
          .set({
            isActive: false,
            updatedAt: new Date(),
          })
          .where(eq(sessionTable.userId, userId))
      } else {
        // Deactivate specific session
        await db
          .update(sessionTable)
          .set({
            isActive: false,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(sessionTable.id, sessionId),
              eq(sessionTable.userId, userId)
            )
          )
      }

      return { success: true }
    }),

  getSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .query(async (opts) => {
      const { sessionId } = opts.input
      const db = opts.ctx.db
      const userId = opts.ctx.user.id

      const session = await db.query.sessions.findFirst({
        where: and(
          eq(sessionTable.id, sessionId),
          eq(sessionTable.userId, userId),
          eq(sessionTable.isActive, true)
        ),
        columns: {
          id: true,
          token: true,
          expiresAt: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
        },
      })

      if (!session) {
        throw new Error("Session not found or expired")
      }

      return session
    }),

  getUserSessions: protectedProcedure
    .query(async (opts) => {
      const db = opts.ctx.db
      const userId = opts.ctx.user.id

      const sessions = await db.query.sessions.findMany({
        where: and(
          eq(sessionTable.userId, userId),
          eq(sessionTable.isActive, true)
        ),
        columns: {
          id: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          expiresAt: true,
        },
        orderBy: (sessions, { desc }) => [desc(sessions.createdAt)],
      })

      return sessions
    }),

  refreshSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().optional(),
      })
    )
    .mutation(async (opts) => {
      const db = opts.ctx.db;
      const userId = opts.ctx.user.id;
      const sessionId = opts.input.sessionId;

      if (!sessionId) {
        throw new Error("No session to refresh");
      }

      // Extend session expiration by 30 days
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 30);

      const updatedSession = await db
        .update(sessionTable)
        .set({
          expiresAt: newExpiresAt,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(sessionTable.id, sessionId),
            eq(sessionTable.userId, userId),
            eq(sessionTable.isActive, true)
          )
        )
        .returning();

      if (updatedSession.length === 0) {
        throw new Error("Session not found or expired");
      }

      return {
        sessionId: updatedSession[0].id,
        expiresAt: updatedSession[0].expiresAt,
      }
    }),
})

export default sessionRouter;