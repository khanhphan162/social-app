import { protectedProcedure, createTRPCRouter } from "../init"
import { z } from "zod"
import { and, or, asc, ilike, eq, count } from "drizzle-orm"
import { users as userTable } from "@/db/schema"

const userRouter = createTRPCRouter({
  updateUser: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name must be at least 1 character").optional(),
      })
    )
    .mutation(async (opts) => {
      const db = opts.ctx.db
      const userId = opts.ctx.user.id

      const user = await db
        .update(userTable)
        .set({ 
          name: opts.input.name,
          updatedAt: new Date()
        })
        .where(eq(userTable.id, userId))
        .returning()

      if (user.length === 0) {
        throw new Error("User not found or unauthorized")
      }

      return user[0]
    }),

  getUsers: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        search: z.string().optional(),
        userId: z.string().optional(),
      })
    )
    .query(async (opts) => {
      const page = opts.input.page
      const limit = 12
      const db = opts.ctx.db
      
      // Build where conditions
      const whereConditions = and(
        opts.input.search
          ? or(
              ilike(userTable.name, `%${opts.input.search}%`),
              ilike(userTable.username, `%${opts.input.search}%`)
            )
          : undefined,
        opts.input.userId ? eq(userTable.id, opts.input.userId) : undefined
      )

      const userTableList = await db.query.users.findMany({
        limit,
        offset: (page - 1) * limit,
        orderBy: [asc(userTable.name)],
        columns: { 
          id: true, 
          name: true, 
          username: true, 
          imageUrl: true, 
          createdAt: true, 
          role: true 
        },
        where: whereConditions,
      })

      const totalData = await db
        .select({ count: count() })
        .from(userTable)
        .where(whereConditions)
      
      const total = totalData[0].count

      return { 
        users: userTableList, 
        page, 
        limit, 
        total,
        totalPages: Math.ceil(total / limit)
      }
    }),

  getUserProfile: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async (opts) => {
      const id = opts.input.id
      const db = opts.ctx.db
      
      const user = await db.query.users.findFirst({
        columns: { 
          id: true, 
          name: true, 
          username: true,
          imageUrl: true, 
          createdAt: true, 
          role: true 
        },
        where: eq(userTable.id, id),
      })

      if (!user) {
        throw new Error("User not found")
      }

      return user
    }),

  getUser: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async (opts) => {
      const id = opts.input.id
      const db = opts.ctx.db
      
      const user = await db.query.users.findFirst({
        columns: { 
          id: true, 
          name: true, 
          username: true,
          imageUrl: true 
        },
        where: eq(userTable.id, id),
      })

      if (!user) {
        throw new Error("User not found")
      }

      return user
    }),

  getMyProfile: protectedProcedure
    .query(async (opts) => {
      const db = opts.ctx.db
      const userId = opts.ctx.user.id
      
      const user = await db.query.users.findFirst({
        columns: { 
          id: true, 
          name: true, 
          username: true,
          imageUrl: true, 
          createdAt: true, 
          role: true 
        },
        where: eq(userTable.id, userId),
      })

      if (!user) {
        throw new Error("User not found")
      }

      return user
    }),
})

export default userRouter;