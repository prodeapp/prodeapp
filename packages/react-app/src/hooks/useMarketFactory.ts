import { useQuery } from '@tanstack/react-query'
import { Address, readContract } from '@wagmi/core'
import { useNetwork } from 'wagmi'

import { MarketViewAbi } from '@/abi/MarketView'
import { MARKET_FACTORY_FIELDS, MarketFactory } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { DEFAULT_CHAIN, getConfigAddress } from '@/lib/config'

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
	const factoryAddress = getConfigAddress('MARKET_FACTORY', chain.id)

	return useQuery<MarketFactoryAttributes, Error>(['useMarketFactoryAttributes', chain.id], async () => {
		const attrs = await readContract({
			address: getConfigAddress('MARKET_VIEW', chain.id),
			abi: MarketViewAbi,
			functionName: 'getMarketFactoryAttrs',
			args: [factoryAddress],
			chainId: chain.id,
		})

		return {
			factory: factoryAddress,
			arbitrator: attrs.arbitrator,
			realitio: attrs.realitio,
			timeout: attrs.timeout.toNumber(),
		}
	})
}
