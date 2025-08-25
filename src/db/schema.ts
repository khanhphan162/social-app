import { relations } from "drizzle-orm";
import { boolean, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import * as z from "zod";

export const rolesEnum = pgEnum("role", ["admin", "user"]);

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    username: text("username").unique().notNull(),
    password: text("hashed_password").notNull(),
    name: text("name").notNull(),
    role: rolesEnum("role").notNull().default("user"),
    imageUrl: text("image_url").default("/user.svg"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
    posts: many(posts),
    editedPosts: many(posts, { relationName: "editedPosts" }),
    editedComments: many(comments, { relationName: "editedComments" }),
}));

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const posts = pgTable("posts", {
    id: uuid("id").primaryKey().defaultRandom(),
    body: text("body").notNull(),
    userId: uuid("user_id").references(() => users.id, {onDelete: "cascade"}).notNull(),
    editedBy: uuid("edited_by").references(() => users.id),
    isEditedByAdmin: boolean("is_edited_by_admin").default(false),
    isDeleted: boolean("isDeleted").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const postsRelations = relations(posts, ({one, many}) => ({
    user: one(users, {
        fields: [posts.userId],
        references: [users.id],
    }),
    editor: one(users, {
        fields: [posts.editedBy],
        references: [users.id],
        relationName: "editedPosts",
    }),
    comments: many(comments),
}));

export const comments = pgTable("comments", {
    id: uuid("id").primaryKey().defaultRandom(),
    body: text("body").notNull(),
    postId: uuid("post_id").references(() => posts.id, {onDelete: "cascade"}).notNull(),
    userId: uuid("user_id").references(() => users.id, {onDelete: "cascade"}).notNull(),
    editedBy: uuid("edited_by").references(() => users.id),
    isEditedByAdmin: boolean("is_edited_by_admin").default(false),
    isDeleted: boolean("isDeleted").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const commentsRelations = relations(comments, ({one}) => ({
    user: one(users, {
        fields: [comments.userId],
        references: [users.id],
    }),
    editor: one(users, {
        fields: [comments.editedBy],
        references: [users.id],
        relationName: "editedComments",
    }),
    post: one(posts, {
        fields: [comments.postId],
        references: [posts.id],
    }),
}));

export const insertUserSchema = createInsertSchema(users, {
    username: z.string().min(1,{
        message: "Username is required.",
    }),
});

export const loginSchema = insertUserSchema.pick({
  username: true,
  password: true,
}).extend({
    password: z.string().min(1,{
        message: "Password is required.",
    }),
});

export const registerSchema = insertUserSchema.pick({
  username: true,
  name: true,
  password: true,
  role: true,
}).extend({
    name: z.string().min(1,{
        message: "Name is required.",
    }),
    password: z.string().min(6,{
        message: "Minimum 6 characters required.",
    }),
    confirmPassword: z.string().min(6,{
        message: "Minimum 6 characters required.",
    }),
}).refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
});

export const editProfileSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  imageUrl: z.string().optional(),
});

// Post schemas
export const createPostSchema = z.object({
  body: z.string().min(1, { message: "Post content is required." }).max(500, { message: "Post content must be 500 characters or less." }),
});

export const updatePostSchema = z.object({
  id: z.uuid(),
  body: z.string().min(1, { message: "Post content is required." }).max(500, { message: "Post content must be 500 characters or less." }),
});

export const deletePostSchema = z.object({
  id: z.uuid(),
});

export const getPostSchema = z.object({
  id: z.uuid(),
});

// Comment schemas
export const createCommentSchema = z.object({
  body: z.string().min(1, { message: "Comment content is required." }).max(300, { message: "Comment content must be 300 characters or less." }),
  postId: z.string().uuid(),
});

export const updateCommentSchema = z.object({
  id: z.uuid(),
  body: z.string().min(1, { message: "Comment content is required." }).max(300, { message: "Comment content must be 300 characters or less." }),
});

export const deleteCommentSchema = z.object({
  id: z.uuid(),
});

// Search schema
export const searchPostsSchema = z.object({
  query: z.string().min(1, { message: "Search query is required." }),
});

// Timeline schema (for pagination)
export const getTimelineSchema = z.object({
  limit: z.number().min(1).max(50).optional().default(20),
  cursor: z.uuid().optional(),
});