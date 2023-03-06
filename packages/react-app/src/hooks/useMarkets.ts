import { AddressZero } from '@ethersproject/constants'
import { useQuery } from '@tanstack/react-query'
import { readContracts, useNetwork } from 'wagmi'

import { MarketViewAbi } from '@/abi/MarketView'
import { GraphMarket, Market, MARKET_FIELDS } from '@/graphql/subgraph'
import { marketViewToMarket } from '@/hooks/useMarket'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { DEFAULT_CHAIN, MARKET_VIEW_ADDRESSES } from '@/lib/config'
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

async function graphMarketsToMarkets(chainId: number, graphMarkets: GraphMarket[]): Promise<Market[]> {
	const contracts = graphMarkets.map(graphMarket => ({
		address: MARKET_VIEW_ADDRESSES[chainId as keyof typeof MARKET_VIEW_ADDRESSES],
		abi: MarketViewAbi,
		functionName: 'getMarket',
		args: [graphMarket.id],
	}))

	const markets = await readContracts({
		contracts,
	})

	// @ts-ignore
	return markets.map(market => marketViewToMarket(market)).filter(market => market.id !== AddressZero)
}

export const useMarkets = ({ curated, status, category, minEvents, creatorId }: UseMarketsProps = {}) => {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()
	return useQuery<Market[], Error>(
		['useMarkets', { curated, status, category, minEvents, creatorId, chainId: chain.id }],
		async () => {
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

			const response = await apolloProdeQuery<{ markets: GraphMarket[] }>(buildQuery(query, variables), variables)

			if (!response) throw new Error('No response from TheGraph')

			return graphMarketsToMarkets(chain.id, response.data.markets)
		}
	)
}
