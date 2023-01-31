import { useQuery } from '@tanstack/react-query'

import { Market, MARKET_FIELDS } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'

const query = `
    ${MARKET_FIELDS}
    query MarketQuery($marketId: String) {
        market(id: $marketId) {
            ...MarketFields
        }
    }
`

export const useMarket = (marketId: string) => {
	return useQuery<Market | undefined, Error>(['useMarket', marketId], async () => {
		const response = await apolloProdeQuery<{ market: Market }>(query, {
			marketId,
		})

		if (!response) throw new Error('No response from TheGraph')

		return response.data.market
	})
}
