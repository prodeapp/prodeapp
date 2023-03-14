import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { Address, readContract, ReadContractResult } from '@wagmi/core'
import { useMemo } from 'react'

import { MarketViewAbi } from '@/abi/MarketView'
import { Event } from '@/graphql/subgraph'
import { MARKET_VIEW_ADDRESSES } from '@/lib/config'
import { indexObjectsByKey } from '@/lib/helpers'
import { ArrayElement } from '@/lib/types'

export const marketEventViewToEvent = async (
	marketEventView: ArrayElement<ReadContractResult<typeof MarketViewAbi, 'getEvents'>>
): Promise<Event> => {
	const event: Event = {
		id: marketEventView.id,
		arbitrator: marketEventView.arbitrator,
		answer: null,
		openingTs: marketEventView.openingTs.toNumber(),
		answerFinalizedTimestamp: marketEventView.answerFinalizedTimestamp.toNumber(),
		isPendingArbitration: marketEventView.isPendingArbitration,
		timeout: marketEventView.timeout.toNumber(),
		minBond: marketEventView.minBond,
		lastBond: marketEventView.lastBond,
		bounty: marketEventView.bounty,
		title: marketEventView.title,
		category: marketEventView.category,
		outcomes: marketEventView.outcomes === '' ? [] : JSON.parse(`[${marketEventView.outcomes}]`),
		templateID: marketEventView.templateId.toString(),
	}

	if (event.answerFinalizedTimestamp > 0) {
		event.answer = marketEventView.answer
	}

	return event
}

type FetchEvents = (chainId: number, marketId: Address, orderBy?: 'openingTs' | 'id') => Promise<Event[]>

export const fetchEvents: FetchEvents = async (chainId, marketId, orderBy = 'openingTs') => {
	const marketEventsView = await readContract({
		address: MARKET_VIEW_ADDRESSES[chainId as keyof typeof MARKET_VIEW_ADDRESSES],
		abi: MarketViewAbi,
		functionName: 'getEvents',
		args: [marketId],
		chainId,
	})

	if (typeof marketEventsView.find((e) => e.templateId.eq(0)) !== 'undefined') {
		// it needs to be added to RealityRegistry first
		return []
	}

	const events = await Promise.all(
		marketEventsView.map(async (marketEventView) => await marketEventViewToEvent(marketEventView))
	)

	events.sort((a, b) => (a[orderBy] === b[orderBy] ? 0 : a[orderBy] > b[orderBy] ? 1 : -1))

	return events
}

type UseEvents = (marketId: Address, chainId: number, orderBy?: 'openingTs' | 'id') => UseQueryResult<Event[], Error>
export const useEvents: UseEvents = (marketId: Address, chainId: number, orderBy = 'openingTs') => {
	return useQuery<Event[], Error>(['useEvents', { marketId, orderBy, chainId }], async () => {
		return fetchEvents(chainId, marketId, orderBy)
	})
}

export function useIndexedEvents(events?: Event[]) {
	return useMemo(() => indexObjectsByKey(events || [], 'id'), [events])
}
