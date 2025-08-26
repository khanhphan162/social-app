import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { username } from "better-auth/plugins";
import { auth } from "@/server/lib/auth";

function getBaseUrl() {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return 'http://localhost:3000';
}

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    username(),
  ],
  baseURL: getBaseUrl(),
})