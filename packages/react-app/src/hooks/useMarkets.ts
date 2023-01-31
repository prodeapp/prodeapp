import { useQuery } from '@tanstack/react-query'

import { Market, MARKET_FIELDS } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { getSubcategories } from '@/lib/helpers'
import { buildQuery, QueryVariables } from '@/lib/SubgraphQueryBuilder'

const query = `
    ${MARKET_FIELDS}
    query MarketsQuery(#params#) {
      markets(where: {#where#}, first: 50, orderBy: closingTime, orderDirection: $orderDirection) {
        ...MarketFields
      }
    }
`

export type MarketStatus = 'active' | 'pending' | 'closed'

export interface UseMarketsProps {
	curated?: boolean
	status?: MarketStatus
	category?: string
	minEvents?: number
	creatorId?: string
}

export const useMarkets = ({ curated, status, category, minEvents, creatorId }: UseMarketsProps = {}) => {
	return useQuery<Market[], Error>(['useMarkets', curated, status, category, minEvents, creatorId], async () => {
		const variables: QueryVariables = { curated, orderDirection: 'desc' }

		if (category) {
			variables['category_in'] = [category, ...getSubcategories(category).map(s => s.id)]
		}

		if (minEvents) {
			variables['numOfEvents_gte'] = String(minEvents)
		}

		if (status !== undefined) {
			if (status === 'active') {
				variables['closingTime_gt'] = String(Math.round(Date.now() / 1000))
				variables['orderDirection'] = 'asc'
			} else if (status === 'pending') {
				variables['resultSubmissionPeriodStart'] = '0'
				variables['closingTime_lt'] = String(Math.round(Date.now() / 1000))
			} else if (status === 'closed') {
				variables['resultSubmissionPeriodStart_gt'] = '0'
			}
		}

		if (creatorId) {
			variables['creator'] = creatorId.toLowerCase()
		}

		const response = await apolloProdeQuery<{ markets: Market[] }>(buildQuery(query, variables), variables)

		if (!response) throw new Error('No response from TheGraph')

		return response.data.markets
	})
}
