import { BigNumber } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'
import { UseQueryResult } from '@tanstack/react-query/src/types'
import { Address, readContract, ReadContractResult } from '@wagmi/core'
import { readContracts } from 'wagmi'

import { MarketViewAbi } from '@/abi/MarketView'
import { Bytes } from '@/abi/types'
import { Bet, BET_FIELDS, GraphBet } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never

export const marketBetViewToBet = async (
	marketBetsView: ArrayElement<ReadContractResult<typeof MarketViewAbi, 'getMarketBets'>>
): Promise<Bet> => {
	const { marketId, marketName, tokenId, owner } = marketBetsView
	let { points, predictions } = marketBetsView

	if (predictions.length === 0) {
		const query = `
		query BetQuery($marketId: String, $tokenId: String) {
			bets(where: {market: $marketId, tokenID: $tokenId}) {
				id
				results
				points
			}
		}`

		const response = await apolloProdeQuery<{ bets: { results: Bytes[]; points: number }[] }>(query, {
			marketId: marketId.toLowerCase(),
			tokenId: tokenId.toString(),
		})

		// it's an old market, we need to load predictions and points from the graph
		predictions = response?.data?.bets?.[0]?.results || []
		points = BigNumber.from(response?.data?.bets?.[0]?.points || 0)
	}

	return {
		id: `${marketId}-${tokenId}`,
		tokenID: tokenId.toNumber(),
		player: {
			id: owner,
			name: owner, // TODO
		},
		results: predictions,
		points: points.toNumber(),
		market: {
			id: marketId,
			name: marketName,
		},
		reward: BigNumber.from(0), // TODO
	}
}

export async function getMarketBets(marketId: Address): Promise<Bet[]> {
	// TODO: check that this market was created by a whitelisted factory

	const marketBetsView = (
		await readContract({
			address: import.meta.env.VITE_MARKET_VIEW as Address,
			abi: MarketViewAbi,
			functionName: 'getMarketBets',
			args: [marketId],
		})
	).slice()

	const bets = await Promise.all(marketBetsView.map(async marketBetView => await marketBetViewToBet(marketBetView)))

	bets.sort((a, b) => b.points - a.points)

	return bets
}

async function graphBetsToBets(graphBets: GraphBet[]): Promise<Bet[]> {
	const contracts = graphBets.map(graphBet => ({
		address: import.meta.env.VITE_MARKET_VIEW as Address,
		abi: MarketViewAbi,
		functionName: 'getTokenBet',
		args: [graphBet.market.id, graphBet.tokenID],
	}))

	const marketBetsView = await readContracts({
		contracts,
	})

	return await Promise.all(
		// @ts-ignore
		marketBetsView.map(async marketBetView => await marketBetViewToBet(marketBetView))
	)
}

type UseBets = {
	({ playerId }: { playerId: Address }): UseQueryResult<Bet[], Error>
	({ marketId }: { marketId: Address }): UseQueryResult<Bet[], Error>
}

export const useBets: UseBets = ({ playerId, marketId }: { playerId?: Address; marketId?: Address }) => {
	return useQuery<Bet[], Error>(
		['useBets', playerId],
		async () => {
			if (marketId) {
				return await getMarketBets(marketId)
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
				const response = await apolloProdeQuery<{ bets: GraphBet[] }>(query, { playerId: playerId.toLowerCase() })

				if (!response) throw new Error('No response from TheGraph')

				return await graphBetsToBets(response.data.bets)
			}

			throw new Error('Missing market or player')
		},
		{ enabled: !!playerId || !!marketId }
	)
}
