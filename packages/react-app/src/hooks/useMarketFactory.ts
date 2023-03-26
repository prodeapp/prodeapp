import { useQuery } from '@tanstack/react-query'
import { Address, readContract } from '@wagmi/core'
import { useNetwork } from 'wagmi'

import { MarketViewAbi } from '@/abi/MarketView'
import { MARKET_FACTORY_FIELDS, MarketFactory } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { filterChainId, getConfigAddress } from '@/lib/config'

const query = `
    ${MARKET_FACTORY_FIELDS}
    query MarketFactoriesQuery {
        marketFactories {
                ...MarketFactoryFields
          }
    }
`

export const useMarketFactory = () => {
	const { chain } = useNetwork()
	const chainId = filterChainId(chain?.id)
	return useQuery<MarketFactory | undefined, Error>(['useMarketFactory', chainId], async () => {
		const response = await apolloProdeQuery<{
			marketFactories: MarketFactory[]
		}>(chainId, query)

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
	const { chain } = useNetwork()
	const chainId = filterChainId(chain?.id)
	const factoryAddress = getConfigAddress('MARKET_FACTORY', chainId)

	return useQuery<MarketFactoryAttributes, Error>(['useMarketFactoryAttributes', chainId], async () => {
		const attrs = await readContract({
			address: getConfigAddress('MARKET_VIEW', chainId),
			abi: MarketViewAbi,
			functionName: 'getMarketFactoryAttrs',
			args: [factoryAddress],
			chainId: filterChainId(chainId),
		})

		return {
			factory: factoryAddress,
			arbitrator: attrs.arbitrator,
			realitio: attrs.realitio,
			timeout: attrs.timeout.toNumber(),
		}
	})
}
