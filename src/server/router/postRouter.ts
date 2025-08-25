import { protectedProcedure, createTRPCRouter } from "../init";
import { z } from "zod";
import { and, or, desc, ilike, eq, count, isNull } from "drizzle-orm";
import { posts as postTable, users as userTable } from "@/db/schema";

const postRouter = createTRPCRouter({
  createPost: protectedProcedure
    .input(
      z.object({
        body: z.string().min(1, "Post content cannot be empty").max(2000, "Post content too long"),
      })
    )
    .mutation(async (opts) => {
      const { body } = opts.input;
      const db = opts.ctx.db;
      const userId = opts.ctx.user.id;

      const newPost = await db
        .insert(postTable)
        .values({
          body,
          userId,
        })
        .returning();

      if (newPost.length === 0) {
        throw new Error("Failed to create post");
      }

      // Fetch the created post with user information
      const postWithUser = await db.query.posts.findFirst({
        where: eq(postTable.id, newPost[0].id),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              username: true,
              imageUrl: true,
            },
          },
          editor: {
            columns: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      });

      return postWithUser;
    }),

  getPosts: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
        search: z.string().optional(),
        userId: z.string().optional(),
      })
    )
    .query(async (opts) => {
      const { page, limit, search, userId } = opts.input;
      const db = opts.ctx.db;
      const userRole = opts.ctx.user.role;
  
      // Build where conditions based on user role
      const whereConditions = and(
        // Admins can see deleted posts, regular users cannot
        userRole === "admin" ? undefined : eq(postTable.isDeleted, false),
        search ? ilike(postTable.body, `%${search}%`) : undefined,
        userId ? eq(postTable.userId, userId) : undefined
      );
  
      const posts = await db.query.posts.findMany({
        limit,
        offset: (page - 1) * limit,
        orderBy: [desc(postTable.createdAt)],
        where: whereConditions,
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              username: true,
              imageUrl: true,
              role: true, // Include role for admin badge
            },
          },
          editor: {
            columns: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      });
  
      // Filter by username on the client side if search is provided
      let filteredPosts = posts;
      if (search) {
        filteredPosts = posts.filter(post => 
          post.body.toLowerCase().includes(search.toLowerCase()) ||
          post.user.username.toLowerCase().includes(search.toLowerCase())
        );
      }
  
      // Get total count
      const totalData = await db
        .select({ count: count() })
        .from(postTable)
        .where(whereConditions);
  
      const total = totalData[0].count;
  
      return {
        posts: filteredPosts,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };
    }),

  getPost: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async (opts) => {
      const { id } = opts.input;
      const db = opts.ctx.db;

      const post = await db.query.posts.findFirst({
        where: and(
          eq(postTable.id, id),
          eq(postTable.isDeleted, false)
        ),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              username: true,
              imageUrl: true,
            },
          },
          editor: {
            columns: {
              id: true,
              name: true,
              username: true,
            },
          },
          comments: {
            where: eq(postTable.isDeleted, false),
            orderBy: [desc(postTable.createdAt)],
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  username: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });

      if (!post) {
        throw new Error("Post not found");
      }

      return post;
    }),

  updatePost: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        body: z.string().min(1, "Post content cannot be empty").max(2000, "Post content too long"),
      })
    )
    .mutation(async (opts) => {
      const { id, body } = opts.input;
      const db = opts.ctx.db;
      const userId = opts.ctx.user.id;
      const userRole = opts.ctx.user.role;

      // Check if user owns the post or is admin
      const existingPost = await db.query.posts.findFirst({
        where: eq(postTable.id, id),
      });

      if (!existingPost) {
        throw new Error("Post not found");
      }

      if (existingPost.userId !== userId && userRole !== "admin") {
        throw new Error("Unauthorized to edit this post");
      }

      const updatedPost = await db
        .update(postTable)
        .set({
          body,
          editedBy: userRole === "admin" && existingPost.userId !== userId ? userId : undefined,
          isEditedByAdmin: userRole === "admin" && existingPost.userId !== userId,
          updatedAt: new Date(),
        })
        .where(eq(postTable.id, id))
        .returning();

      if (updatedPost.length === 0) {
        throw new Error("Failed to update post");
      }

      // Fetch updated post with user information
      const postWithUser = await db.query.posts.findFirst({
        where: eq(postTable.id, id),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              username: true,
              imageUrl: true,
            },
          },
          editor: {
            columns: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      });

      return postWithUser;
    }),

  deletePost: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { id } = opts.input;
      const db = opts.ctx.db;
      const userId = opts.ctx.user.id;
      const userRole = opts.ctx.user.role;

      // Check if user owns the post or is admin
      const existingPost = await db.query.posts.findFirst({
        where: eq(postTable.id, id),
      });

      if (!existingPost) {
        throw new Error("Post not found");
      }

      if (existingPost.userId !== userId && userRole !== "admin") {
        throw new Error("Unauthorized to delete this post");
      }

      const deletedPost = await db
        .update(postTable)
        .set({
          isDeleted: true,
          updatedAt: new Date(),
        })
        .where(eq(postTable.id, id))
        .returning();

      if (deletedPost.length === 0) {
        throw new Error("Failed to delete post");
      }

      return { success: true };
    }),

  getUserPosts: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async (opts) => {
      const { userId, page, limit } = opts.input;
      const db = opts.ctx.db;

      const posts = await db.query.posts.findMany({
        limit,
        offset: (page - 1) * limit,
        orderBy: [desc(postTable.createdAt)],
        where: and(
          eq(postTable.userId, userId),
          eq(postTable.isDeleted, false)
        ),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              username: true,
              imageUrl: true,
            },
          },
          editor: {
            columns: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      });

      // Get total count for user posts
      const totalData = await db
        .select({ count: count() })
        .from(postTable)
        .where(and(
          eq(postTable.userId, userId),
          eq(postTable.isDeleted, false)
        ));

      const total = totalData[0].count;

      return {
        posts,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };
    }),
  restorePost: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { id } = opts.input;
      const db = opts.ctx.db;
      const userRole = opts.ctx.user.role;
  
      // Only admins can restore posts
      if (userRole !== "admin") {
        throw new Error("Unauthorized: Only admins can restore posts");
      }
  
      // Check if post exists and is deleted
      const existingPost = await db.query.posts.findFirst({
        where: eq(postTable.id, id),
      });
  
      if (!existingPost) {
        throw new Error("Post not found");
      }
  
      if (!existingPost.isDeleted) {
        throw new Error("Post is not deleted");
      }
  
      const restoredPost = await db
        .update(postTable)
        .set({
          isDeleted: false,
          updatedAt: new Date(),
        })
        .where(eq(postTable.id, id))
        .returning();
  
      if (restoredPost.length === 0) {
        throw new Error("Failed to restore post");
      }
  
      return { success: true, message: "Post restored successfully" };
    }),
});

export default postRouter;