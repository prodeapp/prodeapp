import { t } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'

import { Market } from '@/graphql/subgraph'
import { useBets } from '@/hooks/useBets'

export const useCheckMarketWhitelist = (market: Market, chainId: number) => {
	const { address, connector } = useAccount()
	const { data: bets } = useBets({ marketId: market.id, chainId })
	const playerIds = (bets || []).map((b) => b.player.id.toLocaleLowerCase())

	return useQuery<string, Error>(['useUserCanBet', { marketId: market.id, chainId, playerIds, address }], async () => {
		if (!address) {
			// we'll check it later
			return ''
		}

		if (market.price.eq(0)) {
			if (playerIds.includes(address.toLocaleLowerCase())) {
				return t`This market only allows one bet per user.`
			}

			if (connector && connector.id !== 'sequence') {
				return t`To bet in this market you need to connect using your email.`
			}
		}

		return ''
	})
}
