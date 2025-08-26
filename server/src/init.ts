import { initTRPC, TRPCError } from "@trpc/server";
import { Context, FetchContext } from "./context";
import superjson from "superjson";

type UniversalContext = Context | FetchContext;

// Initialize tRPC with union context type
const t = initTRPC.context<UniversalContext>().create({
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

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      session: ctx.session,
    },
  });
});

export { t };