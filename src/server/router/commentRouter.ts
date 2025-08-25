import { protectedProcedure, createTRPCRouter } from "../init";
import { z } from "zod";
import { and, count, desc, eq } from "drizzle-orm";
import { comments as commentTable, posts as postTable, users as userTable } from "@/db/schema";
import { createCommentSchema, updateCommentSchema, deleteCommentSchema } from "@/db/schema";

const commentRouter = createTRPCRouter({
  createComment: protectedProcedure
    .input(createCommentSchema)
    .mutation(async (opts) => {
      const { body, postId } = opts.input;
      const db = opts.ctx.db;
      const userId = opts.ctx.user.id;

      // Check if post exists and is not deleted
      const post = await db.query.posts.findFirst({
        where: and(eq(postTable.id, postId), eq(postTable.isDeleted, false)),
      });

      if (!post) {
        throw new Error("Post not found or has been deleted");
      }

      const newComment = await db
        .insert(commentTable)
        .values({
          body,
          postId,
          userId,
        })
        .returning();

      if (newComment.length === 0) {
        throw new Error("Failed to create comment");
      }

      // Fetch the created comment with user information
      const commentWithUser = await db.query.comments.findFirst({
        where: eq(commentTable.id, newComment[0].id),
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

      return commentWithUser;
    }),

  getComments: protectedProcedure
    .input(
      z.object({
        postId: z.string().uuid(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async (opts) => {
      const { postId, page, limit } = opts.input;
      const db = opts.ctx.db;
      const offset = (page - 1) * limit;
      const userRole = opts.ctx.user.role;

      // Build where condition based on user role
      const whereCondition = userRole === "admin" 
        ? eq(commentTable.postId, postId)
        : and(eq(commentTable.postId, postId), eq(commentTable.isDeleted, false));

      const comments = await db.query.comments.findMany({
        where: whereCondition,
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
        orderBy: [desc(commentTable.createdAt)],
        limit: limit,
        offset: offset,
      });

      // Get total count for pagination
      const totalCount = await db
        .select({ count: count(commentTable.id) })
        .from(commentTable)
        .where(whereCondition);

      return {
        comments,
        totalCount: totalCount[0]?.count || 0,
        hasMore: offset + comments.length < (totalCount[0]?.count || 0),
      };
    }),

  updateComment: protectedProcedure
    .input(updateCommentSchema)
    .mutation(async (opts) => {
      const { id, body } = opts.input;
      const db = opts.ctx.db;
      const userId = opts.ctx.user.id;
      const userRole = opts.ctx.user.role;

      // Find the comment
      const comment = await db.query.comments.findFirst({
        where: eq(commentTable.id, id),
      });

      if (!comment) {
        throw new Error("Comment not found");
      }

      if (comment.isDeleted && userRole !== "admin") {
        throw new Error("Comment has been deleted");
      }

      // Check permissions
      const canEdit = comment.userId === userId || userRole === "admin";
      if (!canEdit) {
        throw new Error("You don't have permission to edit this comment");
      }

      const isEditedByAdmin = userRole === "admin" && comment.userId !== userId;

      const updatedComment = await db
        .update(commentTable)
        .set({
          body,
          editedBy: userId,
          isEditedByAdmin,
          updatedAt: new Date(),
        })
        .where(eq(commentTable.id, id))
        .returning();

      if (updatedComment.length === 0) {
        throw new Error("Failed to update comment");
      }

      // Fetch the updated comment with user information
      const commentWithUser = await db.query.comments.findFirst({
        where: eq(commentTable.id, id),
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

      return commentWithUser;
    }),

  deleteComment: protectedProcedure
    .input(deleteCommentSchema)
    .mutation(async (opts) => {
      const { id } = opts.input;
      const db = opts.ctx.db;
      const userId = opts.ctx.user.id;
      const userRole = opts.ctx.user.role;

      // Find the comment
      const comment = await db.query.comments.findFirst({
        where: eq(commentTable.id, id),
      });

      if (!comment) {
        throw new Error("Comment not found");
      }

      if (comment.isDeleted) {
        throw new Error("Comment has already been deleted");
      }

      // Check permissions
      const canDelete = comment.userId === userId || userRole === "admin";
      if (!canDelete) {
        throw new Error("You don't have permission to delete this comment");
      }

      // Soft delete the comment
      const deletedComment = await db
        .update(commentTable)
        .set({
          isDeleted: true,
          updatedAt: new Date(),
        })
        .where(eq(commentTable.id, id))
        .returning();

      if (deletedComment.length === 0) {
        throw new Error("Failed to delete comment");
      }

      return { success: true, message: "Comment deleted successfully" };
    }),
});

export default commentRouter;