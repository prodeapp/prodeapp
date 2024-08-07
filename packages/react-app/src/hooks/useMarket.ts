import { AddressZero } from '@ethersproject/constants'
import { useQuery } from '@tanstack/react-query'
import { Address, readContract, ReadContractResult } from '@wagmi/core'

import { MarketViewAbi } from '@/abi/MarketView'
import { Market } from '@/graphql/subgraph'
import { DIVISOR } from '@/hooks/useMarketForm'
import { filterChainId, getConfigAddress } from '@/lib/config'

export async function getMarket(marketId: Address, chainId: number): Promise<Market | undefined> {
	// TODO: check that this market was created by a whitelisted factory

	const marketView = await readContract({
		address: getConfigAddress('MARKET_VIEW', chainId),
		abi: MarketViewAbi,
		functionName: 'getMarket',
		args: [marketId],
		chainId: filterChainId(chainId),
	})

	if (marketView.id === AddressZero) {
		return
	}

	return marketViewToMarket(marketView)
}

export const marketViewToMarket = (marketView: ReadContractResult<typeof MarketViewAbi, 'getMarket'>): Market => {
	const { id, baseInfo, managerInfo, periodsInfo, eventsInfo, liquidityInfo } = marketView

	const fees = baseInfo.pool.mul(managerInfo.managementFee.add(managerInfo.protocolFee)).div(DIVISOR)
	const pool = baseInfo.pool.sub(fees)

	return {
		id,
		name: baseInfo.name,
		hash: baseInfo.hash,
		price: baseInfo.price,
		pool,
		prizes: baseInfo.prizes.map((p) => p.toNumber()),
		manager: {
			id: managerInfo.managerId,
			managementRewards: managerInfo.managementRewards,
		},
		numOfBets: baseInfo.numOfBets.toNumber(),
		closingTime: periodsInfo.closingTime.toNumber(),
		resultSubmissionPeriodStart: periodsInfo.resultSubmissionPeriodStart.toNumber(),
		submissionTimeout: periodsInfo.submissionTimeout.toNumber(),
		numOfEvents: eventsInfo.numOfEvents.toNumber(),
		managementFee: managerInfo.managementFee.toNumber(),
		protocolFee: managerInfo.protocolFee.toNumber(),
		numOfEventsWithAnswer: eventsInfo.numOfEventsWithAnswer.toNumber(),
		hasPendingAnswers: eventsInfo.hasPendingAnswers,
		curated: baseInfo.curated,
		creator: baseInfo.creator,
		liquidityInfo: {
			id: liquidityInfo.id,
			creator: liquidityInfo.creator,
			creatorFee: liquidityInfo.creatorFee.toNumber(),
			pointsToWin: liquidityInfo.pointsToWin.toNumber(),
			betMultiplier: liquidityInfo.betMultiplier,
			totalDeposits: liquidityInfo.totalDeposits,
			prizePool: liquidityInfo.prizePool,
		},
	}
}

export const useMarket = (marketId: Address, chainId: number) => {
	return useQuery<Market | undefined, Error>(['useMarket', marketId, chainId], async () => {
		const market = await getMarket(marketId, chainId)

		if (!market) {
			throw new Error('Market not found')
		}

		return market
	})
}
