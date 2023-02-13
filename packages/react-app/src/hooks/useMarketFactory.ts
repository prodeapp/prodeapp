import { useQuery } from '@tanstack/react-query'
import { Address } from '@wagmi/core'
import { readContracts } from 'wagmi'

import { MarketFactoryAbi } from '@/abi/MarketFactory'
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

type MarketFactoryAttributes = {
	arbitrator: Address | ''
	realitio: Address | ''
	timeout: number
}

export const useMarketFactoryAttributes = () => {
	return useQuery<MarketFactoryAttributes, Error>(['useMarketFactoryAttributes'], async () => {
		const data = await readContracts({
			contracts: [
				{
					address: import.meta.env.VITE_MARKET_FACTORY as Address,
					abi: MarketFactoryAbi,
					functionName: 'arbitrator',
				},
				{
					address: import.meta.env.VITE_MARKET_FACTORY as Address,
					abi: MarketFactoryAbi,
					functionName: 'realitio',
				},
				{
					address: import.meta.env.VITE_MARKET_FACTORY as Address,
					abi: MarketFactoryAbi,
					functionName: 'QUESTION_TIMEOUT',
				},
			],
		})

		return {
			arbitrator: data?.[0] || '',
			realitio: data?.[1] || '',
			timeout: data?.[2] || 0,
		}
	})
}
