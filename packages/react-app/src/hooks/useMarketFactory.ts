import { useQuery } from '@tanstack/react-query'
import { Address } from '@wagmi/core'
import { readContracts, useNetwork } from 'wagmi'

import { MarketFactoryAbi } from '@/abi/MarketFactory'
import { MARKET_FACTORY_FIELDS, MarketFactory } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { DEFAULT_CHAIN, MARKET_FACTORY_ADDRESSES } from '@/lib/config'

const query = `
    ${MARKET_FACTORY_FIELDS}
    query MarketFactoriesQuery {
        marketFactories {
                ...MarketFactoryFields
          }
    }
`

export const useMarketFactory = () => {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()
	return useQuery<MarketFactory | undefined, Error>(['useMarketFactory', chain.id], async () => {
		const response = await apolloProdeQuery<{
			marketFactories: MarketFactory[]
		}>(chain.id, query)

		if (!response) throw new Error('No response from TheGraph')

		return response.data.marketFactories[0]
	})
}

export type MarketFactoryAttributes = {
	factory: Address
	arbitrator: Address | ''
	realitio: Address | ''
	timeout: number
}

export const useMarketFactoryAttributes = () => {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()
	const factoryAddress = MARKET_FACTORY_ADDRESSES[chain.id as keyof typeof MARKET_FACTORY_ADDRESSES]

	return useQuery<MarketFactoryAttributes, Error>(['useMarketFactoryAttributes', chain.id], async () => {
		const data = await readContracts({
			contracts: [
				{
					address: factoryAddress,
					abi: MarketFactoryAbi,
					functionName: 'arbitrator',
				},
				{
					address: factoryAddress,
					abi: MarketFactoryAbi,
					functionName: 'realitio',
				},
				{
					address: factoryAddress,
					abi: MarketFactoryAbi,
					functionName: 'QUESTION_TIMEOUT',
				},
			],
		})

		return {
			factory: factoryAddress,
			arbitrator: data?.[0] || '',
			realitio: data?.[1] || '',
			timeout: data?.[2] || 0,
		}
	})
}
