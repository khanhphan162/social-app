import { publicProcedure, createTRPCRouter } from "../init"

const healthRouter = createTRPCRouter({
  trpc: publicProcedure.query(() => {
    return { message: "ok" }
  }),
})
export default healthRouter
