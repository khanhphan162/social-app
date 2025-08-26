
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createFetchContext } from '@/context';
import { appRouter } from '@/router';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createFetchContext,
  });
export { handler as GET, handler as POST };