import { BigNumber } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'
import { UseQueryResult } from '@tanstack/react-query/src/types'
import { Address, readContract, ReadContractResult } from '@wagmi/core'
import { useMemo } from 'react'
import { readContracts } from 'wagmi'

import { MarketViewAbi } from '@/abi/MarketView'
import { Bytes } from '@/abi/types'
import { Bet, BET_FIELDS, GraphBet } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { filterChainId, getConfigAddress } from '@/lib/config'
import { indexObjectsByKey } from '@/lib/helpers'
import { ArrayElement } from '@/lib/types'

export const marketBetViewToBet = async (
	chainId: number,
	marketBetsView: ArrayElement<ReadContractResult<typeof MarketViewAbi, 'getMarketBets'>>
): Promise<Bet> => {
	const { marketId, marketName, tokenId, owner, ownerName } = marketBetsView
	let { points, predictions } = marketBetsView

	if (predictions.length === 0) {
		// it's an old market, we need to load predictions and points from the graph

		const query = `
		query BetQuery($marketId: String, $tokenId: String) {
			bets(where: {market: $marketId, tokenID: $tokenId}) {
				id
				results
				points
			}
		}`

		const response = await apolloProdeQuery<{ bets: { results: Bytes[]; points: number }[] }>(chainId, query, {
			marketId: marketId.toLowerCase(),
			tokenId: tokenId.toString(),
		})

		predictions = response?.data?.bets?.[0]?.results || []
		points = BigNumber.from(response?.data?.bets?.[0]?.points || 0)
	}

	return {
		id: `${marketId}-${tokenId}`,
		tokenID: tokenId.toNumber(),
		player: {
			id: owner,
			name: ownerName || owner,
		},
		results: predictions,
		points: points.toNumber(),
		market: {
			id: marketId,
			name: marketName,
		},
	}
}

export async function getMarketBets(chainId: number, marketId: Address): Promise<Bet[]> {
	// TODO: check that this market was created by a whitelisted factory

	const marketBetsView = (
		await readContract({
			address: getConfigAddress('MARKET_VIEW', chainId),
			abi: MarketViewAbi,
			functionName: 'getMarketBets',
			args: [marketId],
			chainId: filterChainId(chainId),
		})
	).slice()

	const bets = await Promise.all(
		marketBetsView.map(async marketBetView => await marketBetViewToBet(chainId, marketBetView))
	)

	bets.sort((a, b) => b.points - a.points)

	return bets
}

async function graphBetsToBets(chainId: number, graphBets: GraphBet[]): Promise<Bet[]> {
	const contracts = graphBets.map(graphBet => ({
		address: getConfigAddress('MARKET_VIEW', chainId),
		abi: MarketViewAbi,
		functionName: 'getTokenBet',
		args: [graphBet.market.id, graphBet.tokenID],
		chainId: filterChainId(chainId),
	}))

	const marketBetsView = await readContracts({
		contracts,
	})

	return await Promise.all(
		marketBetsView
			// remove multicall errors
			.filter(mbv => mbv !== null)
			// @ts-ignore
			.map(async marketBetView => await marketBetViewToBet(chainId, marketBetView))
	)
}

type UseBets = {
	({ playerId, chainId }: { playerId: Address; chainId: number }): UseQueryResult<Bet[], Error>
	({ marketId, chainId }: { marketId: Address; chainId: number }): UseQueryResult<Bet[], Error>
}

export const useBets: UseBets = ({
	playerId,
	marketId,
	chainId,
}: {
	playerId?: Address
	marketId?: Address
	chainId: number
}) => {
	return useQuery<Bet[], Error>(
		['useBets', { marketId, playerId, chainId }],
		async () => {
			if (marketId) {
				return await getMarketBets(chainId, marketId)
			}

			if (playerId) {
				const query = `
    ${BET_FIELDS}
    query BetQuery($playerId: String) {
      bets(where: {player: $playerId}, orderBy: points, orderDirection: desc) {
        ...BetFields
      }
    }
`
				const response = await apolloProdeQuery<{ bets: GraphBet[] }>(chainId, query, {
					playerId: playerId.toLowerCase(),
				})

				if (!response) throw new Error('No response from TheGraph')

				return await graphBetsToBets(chainId, response.data.bets)
			}

			throw new Error('Missing market or player')
		},
		{ enabled: !!playerId || !!marketId }
	)
}

export function useIndexedBetsRewards(graphBets?: GraphBet[]) {
	return useMemo(() => indexObjectsByKey(graphBets || [], 'id'), [graphBets])
}

export const useBetsRewards = (bets: Bet[], chainId: number) => {
	const betsId = bets.map(b => b.id.toLowerCase())

	return useQuery<GraphBet[], Error>(['useBetsRewards', { bets: betsId, chainId }], async () => {
		const query = `
    ${BET_FIELDS}
    query BetsRewardQuery($betsId: [String]) {
      bets(where: {id_in: $betsId}) {
        ...BetFields
      }
    }
`
		const response = await apolloProdeQuery<{ bets: GraphBet[] }>(chainId, query, { betsId: betsId })

		if (!response) throw new Error('No response from TheGraph')

		return response.data.bets
	})
}
