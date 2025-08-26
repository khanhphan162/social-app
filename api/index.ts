import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify"
import Fastify, { FastifyRequest, FastifyReply } from "fastify"
import fastifyCookie from "@fastify/cookie"
import fastifyCors from "@fastify/cors"
import { authHandler } from "../src/server/handlers/auth"
import createContext from "../src/server/context"
import { AppRouter, appRouter } from "../src/server/router"

const fastify = Fastify({
  maxParamLength: 5000,
  logger: false, // Disable logging for serverless
})

// Register plugins and routes
const setupFastify = async () => {
  await fastify.register(fastifyCors, {
    credentials: true,
    origin: process.env.FRONTEND_URL || true, // Allow all origins in development
  })

  await fastify.register(fastifyCookie)

  fastify.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    handler: authHandler,
  })

  fastify.get("/", async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({ message: "Hello world!" })
  })

  await fastify.register(fastifyTRPCPlugin, {
    prefix: "/api/trpc",
    trpcOptions: {
      router: appRouter,
      createContext,
    } as FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
  })

  await fastify.ready()
}

// Initialize Fastify
setupFastify().catch(console.error)

// Export the handler for Vercel
export default async function handler(req: any, res: any) {
  await fastify.ready()
  fastify.server.emit('request', req, res)
}