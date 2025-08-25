import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "./context";
import superjson from "superjson";

// Initialize tRPC with context type
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof Error ? error.cause.message : null,
      },
    };
  },
});

// Base router
export const createTRPCRouter = t.router;

// Public procedure (no authentication required)
export const publicProcedure = t.procedure;

// Protected procedure with enhanced debugging
export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  console.log('🔐 Protected procedure middleware check:', {
    hasUser: !!ctx.user,
    hasSession: !!ctx.session,
    userId: ctx.user?.id,
    username: ctx.user?.username
  });

  // Check if user and session exist
  if (!ctx.user || !ctx.session) {
    console.log('❌ Protected procedure: Authentication failed');
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  console.log('✅ Protected procedure: Authentication successful');

  // Return context with guaranteed non-null user and session
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // TypeScript now knows this is non-null
      session: ctx.session, // TypeScript now knows this is non-null
    },
  });
});

// Export the tRPC instance for advanced usage
export { t };