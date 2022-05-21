import React from "react";
import { QueryCache, QueryClient, QueryClientProvider } from "react-query";

const queryCache = new QueryCache({
  onError: (error, query) => {
    if (error instanceof Error) console.error({ key: query.queryKey, error: error.message });
  },
});

export const queryClient = new QueryClient({
  queryCache,
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchInterval: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      notifyOnChangeProps: "tracked",
    },
  },
});

export const invalidateQueriesWithTimeout = (queryKey: string[]) => {
  window.setTimeout(
    async () => {
      await queryClient.invalidateQueries(queryKey)
    },
    // to wait for the graph to update the changes
    2000
  );
}

export const ReactQueryProvider: React.FC = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);