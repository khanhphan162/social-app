import { protectedProcedure, publicProcedure, createTRPCRouter } from "../init"
import { z } from "zod"
import { comments as commentTable } from "@/db/schema"
// import { broadcastMessage } from "../handlers/sse"
import { EventEmitter } from "events"
import { desc, lt } from "drizzle-orm"
const ee = new EventEmitter()

type PostComment = {
  id: string
  name: string
  image: string
  comment: string
  createdAt: Date
}
const commentRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(
      z.object({
        comment: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(commentTable).values({
        comment: input.comment,
        senderId: ctx.user.id,
      })
      const comment: PostComment = {
        id: ctx.user.id,
        name: ctx.user.name,
        image: ctx.user.image || "",
        comment: input.comment,
        createdAt: new Date(),
      }
      ee.emit("fsb-chat", comment)

      return { success: true }
    }),
  getMessages: publicProcedure
    .input(
      z.object({
        before: z.string().datetime().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const comments = await ctx.db.query.commentTable.findMany({
        where: input.before ? lt(commentTable.createdAt, new Date(input.before)) : undefined,
        orderBy: [desc(commentTable.createdAt)],
        limit: 20,
        with: {
          sender: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      })
      return comments
    }),

  sseMessages: publicProcedure.subscription(async function* () {
    while (true) {
      const comment = await new Promise<PostComment>((resolve) => {
        ee.once("fsb-chat", resolve)
      })

      yield comment
    }
  }),
})

export default commentRouter
