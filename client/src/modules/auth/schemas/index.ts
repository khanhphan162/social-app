import * as z from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

export const registerSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required.",
  }),
  name: z.string().min(1, {
    message: "Name is required.",
  }),
  password: z.string().min(6, {
    message: "Minimum 6 characters required.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Minimum 6 characters required.",
  }),
  role: z.enum(["admin", "user"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;