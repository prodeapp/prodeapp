import { AddressZero } from '@ethersproject/constants'
import { useQuery } from '@tanstack/react-query'
import { Address, readContract, ReadContractResult } from '@wagmi/core'
import { useNetwork } from 'wagmi'

import { MarketViewAbi } from '@/abi/MarketView'
import { Market } from '@/graphql/subgraph'
import { DEFAULT_CHAIN, MARKET_VIEW_ADDRESSES } from '@/lib/config'

export async function getMarket(chainId: number, marketId: Address): Promise<Market | undefined> {
	// TODO: check that this market was created by a whitelisted factory

	const marketView = await readContract({
		address: MARKET_VIEW_ADDRESSES[chainId as keyof typeof MARKET_VIEW_ADDRESSES],
		abi: MarketViewAbi,
		functionName: 'getMarket',
		args: [marketId],
	})

	if (marketView.id === AddressZero) {
		return
	}

	return marketViewToMarket(marketView)
}

export const marketViewToMarket = (marketView: ReadContractResult<typeof MarketViewAbi, 'getMarket'>): Market => {
	const [id, baseInfo, managerInfo, periodsInfo, eventsInfo, liquidityInfo] = marketView

	return {
		id,
		name: baseInfo.name,
		hash: baseInfo.hash,
		price: baseInfo.price,
		pool: baseInfo.pool,
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

export const useMarket = (marketId: Address) => {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()
	return useQuery<Market | undefined, Error>(['useMarket', marketId, chain.id], async () => {
		const market = await getMarket(chain.id, marketId)

		if (!market) {
			throw new Error('Market not found')
		}

		return market
	})
}
