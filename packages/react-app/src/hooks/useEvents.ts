import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { Address, readContract, ReadContractResult } from '@wagmi/core'
import { useMemo } from 'react'

import { MarketViewAbi } from '@/abi/MarketView'
import { Event, EVENT_FIELDS, GraphEvent } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { indexObjectsByKey } from '@/lib/helpers'
import { ArrayElement } from '@/lib/types'

export const marketEventViewToEvent = async (
	marketEventView: ArrayElement<ReadContractResult<typeof MarketViewAbi, 'getEvents'>>
): Promise<Event> => {
	const query = `
		${EVENT_FIELDS}
		query EventQuery($eventId: String) {
			event(id: $eventId) {
				...EventFields
			}
		}`

	const response = await apolloProdeQuery<{ event: GraphEvent }>(query, {
		eventId: marketEventView.id,
	})

	if (!response) {
		throw new Error('No response from TheGraph')
	}

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
		title: response.data.event.title,
		category: response.data.event.category,
		outcomes: response.data.event.outcomes,
		templateID: response.data.event.templateID,
	}

	if (event.answerFinalizedTimestamp > 0) {
		event.answer = marketEventView.answer
	}

	return event
}

type FetchEvents = (marketId: Address, orderBy?: 'openingTs' | 'id') => Promise<Event[]>
export const fetchEvents: FetchEvents = async (marketId: Address, orderBy = 'openingTs') => {
	const marketEventsView = await readContract({
		address: import.meta.env.VITE_MARKET_VIEW as Address,
		abi: MarketViewAbi,
		functionName: 'getEvents',
		args: [marketId],
	})

	const events = await Promise.all(
		marketEventsView.map(async marketEventView => await marketEventViewToEvent(marketEventView))
	)

	events.sort((a, b) => (a[orderBy] === b[orderBy] ? 0 : a[orderBy] > b[orderBy] ? 1 : -1))

	return events
}

type UseEvents = (marketId: Address, orderBy?: 'openingTs' | 'id') => UseQueryResult<Event[], Error>
export const useEvents: UseEvents = (marketId: Address, orderBy = 'openingTs') => {
	return useQuery<Event[], Error>(['useEvents', { marketId, orderBy }], async () => {
		return fetchEvents(marketId, orderBy)
	})
}

export function useIndexedEvents(events?: Event[]) {
	return useMemo(() => indexObjectsByKey(events || [], 'id'), [events])
}
