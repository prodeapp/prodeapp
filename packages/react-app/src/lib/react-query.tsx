import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const queryCache = new QueryCache({
	onError: (error, query) => {
		if (error instanceof Error) console.error({ key: query.queryKey, error: error.message })
	},
})

export const queryClient = new QueryClient({
	queryCache,
	defaultOptions: {
		queries: {
			refetchOnMount: false,
			refetchInterval: false,
			refetchOnReconnect: false,
			refetchOnWindowFocus: false,
		},
	},
})

export const ReactQueryProvider: React.FC = ({ children }) => (
	<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)
