import { useQuery } from '@tanstack/react-query'
import { Address } from '@wagmi/core'
import { useMemo } from 'react'

import { Event, EVENT_FIELDS } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { indexObjectsByKey } from '@/lib/helpers'

const query = `
    ${EVENT_FIELDS}
    query EventsQuery ($marketId: String!, $orderBy: String!, $orderDirection: String!){
      events(where:{markets_contains: [$marketId]}, orderBy: $orderBy, orderDirection: $orderDirection) {
        ...EventFields
      }
    }
`

export const fetchEvents = async (marketId: string, orderBy = 'openingTs', orderDirection = 'asc') => {
	const response = await apolloProdeQuery<{ events: Event[] }>(query, {
		marketId: marketId.toLowerCase(),
		orderBy,
		orderDirection,
	})

	if (!response) throw new Error('No response from TheGraph')

	return response.data.events
}

export const useEvents = (marketId: Address, orderBy = 'openingTs', orderDirection = 'asc') => {
	return useQuery<Event[], Error>(['useEvents', marketId, orderBy, orderDirection], async () => {
		return fetchEvents(marketId, orderBy, orderDirection)
	})
}

export function useIndexedEvents(events?: Event[]) {
	return useMemo(() => indexObjectsByKey(events || [], 'id'), [events])
}
