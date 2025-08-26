import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/router'
import { createFetchContext } from '@/server/context'

export const runtime = 'nodejs'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createFetchContext,
  })

export { handler as GET, handler as POST }