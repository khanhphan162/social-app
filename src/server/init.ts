import { initTRPC, TRPCError } from "@trpc/server"
import createTRPCContext from "./context"
import superjson from "superjson";

type Context = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(async function isAuthed(opts) {
  if (!opts.ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }

  return opts.next({ ctx: { user: opts.ctx.user } })
})
export const adminProcedure = t.procedure.use(async function isAuthed(opts) {
  if (!opts.ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  if (opts.ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "You must be an admin" })
  }
  return opts.next({ ctx: { user: opts.ctx.user } })
})
