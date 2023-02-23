import { Address } from '@wagmi/core'
import { useMemo } from 'react'

import { indexObjectsByKey } from '@/lib/helpers'

import { useMarket } from './useMarket'
import { MarketPoint, useMarketPoints } from './useMarketPoints'

export interface RankedWinners extends MarketPoint {
	ranking: number
	prizes: number[]
}

export function getMarketWinners(marketPoints: MarketPoint[], totalPrizes: number): RankedWinners[] {
	const winners: RankedWinners[] = []

	let currentPointsLevel = ''
	let currentPrizeLevel = 1
	let currentRanking = 1
	const rankingPrizes: Array<number[]> = [[]] // initialize ranking[0]

	for (const marketPoint of marketPoints) {
		if (currentPointsLevel === '') {
			currentPointsLevel = marketPoint.points
		}

		if (currentPointsLevel !== marketPoint.points) {
			if (winners.length >= totalPrizes) {
				break
			}

			currentPointsLevel = marketPoint.points
			currentRanking++
		}

		if (!rankingPrizes[currentRanking]) {
			rankingPrizes[currentRanking] = []
		}

		const tmpPrizeLevel = Math.min(totalPrizes, currentPrizeLevel++)
		if (!rankingPrizes[currentRanking].includes(tmpPrizeLevel)) {
			rankingPrizes[currentRanking].push(tmpPrizeLevel)
		}

		winners.push(Object.assign({ ranking: currentRanking, prizes: [] }, marketPoint))
	}

	return winners.map(winner => {
		winner.prizes = rankingPrizes[winner.ranking]

		return winner
	})
}

export const useMarketWinners = (marketId: Address): RankedWinners[] => {
	const { data: marketPoints } = useMarketPoints(marketId)
	const { data: market } = useMarket(marketId)

	if (!market || !marketPoints) {
		return []
	}

	return getMarketWinners(marketPoints, market.prizes.length)
}

export function useIndexedMarketWinners(marketId: Address) {
	const marketWinners = useMarketWinners(marketId)
	return useMemo(() => indexObjectsByKey(marketWinners || [], 'tokenID'), [marketWinners])
}
