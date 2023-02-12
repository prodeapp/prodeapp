import { useQuery } from '@tanstack/react-query'
import { Address, readContract, ReadContractResult } from '@wagmi/core'

import { MarketViewAbi } from '@/abi/MarketView'
import { Market } from '@/graphql/subgraph'

export async function getMarket(marketId: Address): Promise<Market> {
	// TODO: check that this market was created by a whitelisted factory

	const marketView = await readContract({
		address: import.meta.env.VITE_MARKET_VIEW as Address,
		abi: MarketViewAbi,
		functionName: 'getMarket',
		args: [marketId],
	})

	return marketViewToMarket(marketView)
}

export const marketViewToMarket = (marketView: ReadContractResult<typeof MarketViewAbi, 'getMarket'>): Market => {
	const [id, baseInfo, managerInfo, periodsInfo, eventsInfo] = marketView

	return {
		id,
		name: baseInfo.name,
		hash: baseInfo.hash,
		price: baseInfo.price,
		pool: baseInfo.pool,
		prizes: baseInfo.prizes.map(p => p.toNumber()),
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
	}
}

export const useMarket = (marketId: Address) => {
	return useQuery<Market | undefined, Error>(['useMarket', marketId], async () => {
		return await getMarket(marketId)
	})
}
