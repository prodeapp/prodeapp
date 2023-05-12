import { t } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { Address } from '@wagmi/core'
import { useAccount } from 'wagmi'

import { useBets } from '@/hooks/useBets'

const marketWhitelist = ['0xfF26f7E94562eDeF05602a2f0bB0A733770525B1'].map((m) => m.toLocaleLowerCase())

export const useCheckMarketWhitelist = (marketId: Address, chainId: number) => {
	const { address, connector } = useAccount()
	const { data: bets } = useBets({ marketId, chainId })
	const playerIds = (bets || []).map((b) => b.player.id.toLocaleLowerCase())

	return useQuery<string, Error>(['useUserCanBet', marketId, chainId, playerIds, address], async () => {
		if (!address) {
			// we'll check it later
			return ''
		}

		if (marketWhitelist.includes(marketId.toLocaleLowerCase())) {
			if (playerIds.includes(address.toLocaleLowerCase())) {
				// user already placed a bet
				return t`This market only allows one bet per user.`
			}

			if (connector && connector.id !== 'sequence') {
				return t`To bet in this market you need to connect using Sequence wallet.`
			}
		}

		return ''
	})
}
