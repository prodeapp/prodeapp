import { useQuery } from '@tanstack/react-query'
import { Address, readContract } from '@wagmi/core'
import { useAccount } from 'wagmi'

import { MarketViewAbi } from '@/abi/MarketView'
import { Market } from '@/graphql/subgraph'
import { filterChainId, getConfigAddress } from '@/lib/config'

export enum WHITELIST_STATUS {
	OK,
	ALREADY_BET,
	INVALID_CONNECTOR,
}

export async function hasBetInMarket(marketId: Address | undefined, userId: Address | undefined, chainId: number) {
	if (!marketId || !userId) {
		return false
	}

	return await readContract({
		address: getConfigAddress('MARKET_VIEW', chainId),
		abi: MarketViewAbi,
		functionName: 'hasBets',
		args: [userId, marketId],
		chainId: filterChainId(chainId),
	})
}

export const useCheckMarketWhitelist = (market: Market, chainId: number) => {
	const { address, connector } = useAccount()

	return useQuery<WHITELIST_STATUS, Error>(
		['useCheckMarketWhitelist', { marketId: market.id, chainId, address }],
		async () => {
			if (!address) {
				// we'll check it later
				return WHITELIST_STATUS.OK
			}

			if (market.price.eq(0)) {
				if (await hasBetInMarket(market.id, address, chainId)) {
					return WHITELIST_STATUS.ALREADY_BET
				}

				if (connector && connector.id !== 'sequence') {
					return WHITELIST_STATUS.INVALID_CONNECTOR
				}
			}

			return WHITELIST_STATUS.OK
		}
	)
}
