import { useQuery } from '@tanstack/react-query'

import { apolloProdeQuery } from '@/lib/apolloClient'

export interface MarketPoint {
	tokenID: string
	points: string
}

const query = `
    query BetsQuery($marketId: String) {
      bets(where: {market: $marketId, ranking_not: null}, orderBy: points, orderDirection: desc) {
        tokenID
        points
      }
    }
`

export const useMarketPoints = (marketId: string, chainId: number) => {
	return useQuery<MarketPoint[], Error>(
		['useMarketPoints', marketId, chainId],
		async () => {
			const variables = { marketId: marketId.toLowerCase() }

			const response = await apolloProdeQuery<{ bets: MarketPoint[] }>(chainId, query, variables)

			if (!response) throw new Error('No response from TheGraph')

			return response.data.bets
		},
		{ enabled: !!marketId }
	)
}
