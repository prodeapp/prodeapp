import { useQuery } from '@tanstack/react-query'

import { MARKET_FACTORY_FIELDS, MarketFactory } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'

const query = `
    ${MARKET_FACTORY_FIELDS}
    query MarketFactoriesQuery {
        marketFactories {
                ...MarketFactoryFields
          }
    }
`

export const useMarketFactory = () => {
	return useQuery<MarketFactory | undefined, Error>(['useMarketFactory'], async () => {
		const response = await apolloProdeQuery<{
			marketFactories: MarketFactory[]
		}>(query)

		if (!response) throw new Error('No response from TheGraph')

		return response.data.marketFactories[0]
	})
}
