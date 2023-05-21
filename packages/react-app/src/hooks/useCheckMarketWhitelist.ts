import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'

import { Market } from '@/graphql/subgraph'
import { useBets } from '@/hooks/useBets'

export enum WHITELIST_STATUS {
	OK,
	ALREADY_BET,
	INVALID_CONNECTOR,
}

export const useCheckMarketWhitelist = (market: Market, chainId: number) => {
	const { address, connector } = useAccount()
	const { data: bets } = useBets({ marketId: market.id, chainId })
	const playerIds = (bets || []).map((b) => b.player.id.toLocaleLowerCase())

	return useQuery<WHITELIST_STATUS, Error>(
		['useUserCanBet', { marketId: market.id, chainId, playerIds, address }],
		async () => {
			if (!address) {
				// we'll check it later
				return WHITELIST_STATUS.OK
			}

			if (market.price.eq(0)) {
				if (playerIds.includes(address.toLocaleLowerCase())) {
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
