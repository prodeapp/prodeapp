import { BigNumber } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'
import { Address, readContract } from '@wagmi/core'
import { useNetwork } from 'wagmi'

import { MarketViewAbi } from '@/abi/MarketView'
import { Bet } from '@/graphql/subgraph'
import { marketBetViewToBet } from '@/hooks/useBets'
import { filterChainId, getConfigAddress } from '@/lib/config'

async function getTokenBet(chainId: number, marketId: Address, tokenId: number): Promise<Bet> {
	// TODO: check that this market was created by a whitelisted factory

	const marketBetView = await readContract({
		address: getConfigAddress('MARKET_VIEW', chainId),
		abi: MarketViewAbi,
		functionName: 'getTokenBet',
		args: [marketId, BigNumber.from(tokenId)],
		chainId: filterChainId(chainId),
	})

	return await marketBetViewToBet(chainId, marketBetView)
}

export const useBet = (marketId: Address, tokenId: number) => {
	const { chain } = useNetwork()
	const chainId = filterChainId(chain?.id)
	return useQuery<Bet | undefined, Error>(
		['useBet', { marketId, tokenId, chainId }],
		async () => {
			return await getTokenBet(chainId, marketId, tokenId)
		},
		{ enabled: !!marketId || !!tokenId }
	)
}
