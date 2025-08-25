import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import { username } from "better-auth/plugins"
import { auth } from "@/server/lib/auth"
import dotenv from "dotenv";

dotenv.config({path: ".env.local"});

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    username(),
  ],
  baseURL: process.env.BACKEND_URL,
})