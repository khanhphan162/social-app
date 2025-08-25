import userRouter from "./userRouter"
import sessionRouter from "./sessionRouter"
import healthRouter from "./healthRouter"
import { createTRPCRouter } from "../init"
import postRouter from "./postRouter"
import commentRouter from "./commentRouter"

export const appRouter = createTRPCRouter({
  session: sessionRouter,
  health: healthRouter,
  user: userRouter,
  post: postRouter,
  comment: commentRouter,
})

export type AppRouter = typeof appRouter;
