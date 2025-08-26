"use client";

import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import { makeQueryClient } from "./query-client";
import superjson from 'superjson';

import type { AppRouter } from '../../../server/src/router';

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()

let browserQueryClient: QueryClient;
function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

function getUrl() {
  const base = (() => {
    if (process.env.BACKEND_URL) return process.env.BACKEND_URL;
    return 'http://localhost:4000';
  })();
  return `${base}/api/trpc`;
}

export function TRPCReactProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          transformer: superjson,
          url: getUrl(),
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: 'include',
            })
          }
        }),
      ]
    }),
  );
  
  return (
    <QueryClientProvider client={queryClient}>
    <TRPCProvider trpcClient={ trpcClient } queryClient = { queryClient } >
      { props.children }
      </TRPCProvider>
      </QueryClientProvider>
  );
}