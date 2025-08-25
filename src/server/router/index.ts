import userRouter from "./userRouter"
import sessionRouter from "./sessionRouter"
import healthRouter from "./healthRouter"
import messageRouter from "./messageRouter"
import { createTRPCRouter } from "../init"

export const appRouter = createTRPCRouter({
  session: sessionRouter,
  health: healthRouter,
  user: userRouter,
  message: messageRouter,
})

export type AppRouter = typeof appRouter;
