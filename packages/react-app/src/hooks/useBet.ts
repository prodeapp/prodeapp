import { BigNumber } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'
import { Address, readContract } from '@wagmi/core'

import { MarketViewAbi } from '@/abi/MarketView'
import { Bet } from '@/graphql/subgraph'
import { marketBetViewToBet } from '@/hooks/useBets'

export async function getTokenBet(marketId: Address, tokenId: number): Promise<Bet> {
	// TODO: check that this market was created by a whitelisted factory

	const marketBetView = await readContract({
		address: import.meta.env.VITE_MARKET_VIEW as Address,
		abi: MarketViewAbi,
		functionName: 'getTokenBet',
		args: [marketId, BigNumber.from(tokenId)],
	})

	return await marketBetViewToBet(marketBetView)
}

export const useBet = (marketId: Address, tokenId: number) => {
	return useQuery<Bet | undefined, Error>(
		['useBet', { marketId, tokenId }],
		async () => {
			return await getTokenBet(marketId, tokenId)
		},
		{ enabled: !!marketId || !!tokenId }
	)
}
