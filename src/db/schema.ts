import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import * as z from "zod";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    username: text("username").unique().notNull(),
    password: text("hashed_password").notNull(),
    imageUrl: text("image_url").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    // TODO: add followingIds for personalized timeline, hasNotif for message
});

export const insertUserSchema = createInsertSchema(users, {
    username: z.string().min(1,{
        message: "Username is required.",
    }),
    password: z.string().min(1,{
        message: "Password is required."
    }),
});

export const loginSchema = insertUserSchema.pick({
  username: true,
  password: true,
});