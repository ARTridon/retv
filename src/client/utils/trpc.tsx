import {
  createTRPCQueryUtils,
  createTRPCReact,
  httpBatchLink,
  splitLink,
  unstable_httpSubscriptionLink,
  type inferReactQueryProcedureOptions,
} from "@trpc/react-query";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/api/router";
import { QueryClient, MutationCache, QueryCache } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { toast } from "sonner";

export type ReactQueryOptions = inferReactQueryProcedureOptions<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export const trpc = createTRPCReact<AppRouter>();
const unautorizedMessage = [
  "Access token is required",
  "Token already expired",
];

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      retry: 0,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
        toast.error(error.message);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
        toast.error(error.message);
    },
  }),
});

export const trpcClient = trpc.createClient({
  links: [
    splitLink({
      condition: (op) => op.type === "subscription",
      true: unstable_httpSubscriptionLink({
        url: `/trpc`,
      }),
      false: httpBatchLink({
        url: `/trpc`,
      }),
    }),
  ],
});

export const trpcQueryUtils = createTRPCQueryUtils({
  queryClient,
  client: trpcClient,
});

export type TRPCProviderPropsType = {
  children: ReactNode;
};

export const TRPCProvider = ({ children }: TRPCProviderPropsType) => {
  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </trpc.Provider>
    </QueryClientProvider>
  );
};
