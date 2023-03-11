import { useQuery } from '@tanstack/react-query'
import { useNetwork } from 'wagmi'

import { apolloProdeQuery } from '@/lib/apolloClient'
import { DEFAULT_CHAIN } from '@/lib/config'

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

export const useMarketPoints = (marketId: string) => {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()
	return useQuery<MarketPoint[], Error>(
		['useMarketPoints', marketId, chain.id],
		async () => {
			const variables = { marketId: marketId.toLowerCase() }

			const response = await apolloProdeQuery<{ bets: MarketPoint[] }>(chain.id, query, variables)

			if (!response) throw new Error('No response from TheGraph')

			return response.data.bets
		},
		{ enabled: !!marketId }
	)
}
