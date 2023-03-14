import { BigNumber } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'
import { Address, readContract } from '@wagmi/core'
import { useNetwork } from 'wagmi'

import { MarketViewAbi } from '@/abi/MarketView'
import { Bet } from '@/graphql/subgraph'
import { marketBetViewToBet } from '@/hooks/useBets'
import { DEFAULT_CHAIN, MARKET_VIEW_ADDRESSES } from '@/lib/config'

async function getTokenBet(chainId: number, marketId: Address, tokenId: number): Promise<Bet> {
	// TODO: check that this market was created by a whitelisted factory

	const marketBetView = await readContract({
		address: MARKET_VIEW_ADDRESSES[chainId as keyof typeof MARKET_VIEW_ADDRESSES],
		abi: MarketViewAbi,
		functionName: 'getTokenBet',
		args: [marketId, BigNumber.from(tokenId)],
		chainId,
	})

	return await marketBetViewToBet(chainId, marketBetView)
}

export const useBet = (marketId: Address, tokenId: number) => {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()
	return useQuery<Bet | undefined, Error>(
		['useBet', { marketId, tokenId, chainId: chain.id }],
		async () => {
			return await getTokenBet(chain.id, marketId, tokenId)
		},
		{ enabled: !!marketId || !!tokenId }
	)
}
