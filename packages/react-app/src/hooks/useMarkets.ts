import { BigNumber } from '@ethersproject/bignumber'
import { AddressZero } from '@ethersproject/constants'
import { useQuery } from '@tanstack/react-query'
import { UseQueryResult } from '@tanstack/react-query/src/types'
import { Address } from '@wagmi/core'
import { readContract } from '@wagmi/core'
import { readContracts } from 'wagmi'

import { MarketViewAbi } from '@/abi/MarketView'
import { GraphMarket, Market, MARKET_FIELDS } from '@/graphql/subgraph'
import { marketViewToMarket } from '@/hooks/useMarket'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { filterChainId, getConfigAddress } from '@/lib/config'
import { getSubcategories } from '@/lib/helpers'
import { buildQuery, QueryVariables } from '@/lib/SubgraphQueryBuilder'

const query = `
    ${MARKET_FIELDS}
    query MarketsQuery(#params#) {
      markets(where: #where#, first: 50, orderBy: closingTime, orderDirection: $orderDirection) {
        ...MarketFields
      }
    }
`

export type MarketStatus = 'active' | 'pending' | 'closed'

export interface UseMarketsFilters {
	curated?: boolean
	status?: MarketStatus
	category?: string
	minEvents?: number
	creatorId?: string
}

async function graphMarketsToMarkets(chainId: number, graphMarkets: GraphMarket[]): Promise<Market[]> {
	const contracts = graphMarkets.map((graphMarket) => ({
		address: getConfigAddress('MARKET_VIEW', chainId),
		abi: MarketViewAbi,
		functionName: 'getMarket',
		args: [graphMarket.id],
		chainId: filterChainId(chainId),
	}))

	const markets = await readContracts({
		contracts,
	})

	// @ts-ignore
	return markets.map((market) => marketViewToMarket(market)).filter((market) => market.id !== AddressZero)
}
type UseMarkets = (chainId: number, filters: UseMarketsFilters) => UseQueryResult<Market[], Error>
export const useMarkets: UseMarkets = (chainId, { curated, status, category, minEvents, creatorId } = {}) => {
	return useQuery<Market[], Error>(
		['useMarkets', { curated, status, category, minEvents, creatorId, chainId }],
		async () => {
			const variables: QueryVariables = { curated, orderDirection: 'desc' }

			if (category) {
				variables['category_in'] = [category, ...getSubcategories(category).map((s) => s.id)]
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

			const buildResult = buildQuery(query, variables)

			try {
				const response = await apolloProdeQuery<{ markets: GraphMarket[] }>(
					chainId,
					buildResult.query,
					buildResult.variables
				)

				if (!response) {
					throw new Error('No response from TheGraph')
				}

				return graphMarketsToMarkets(chainId, response.data.markets)
			} catch (e) {
				// graph error, read on chain data
				const markets = await readContract({
					address: getConfigAddress('MARKET_VIEW', chainId),
					abi: MarketViewAbi,
					functionName: 'getMarkets',
					args: [BigNumber.from(50)],
					chainId: filterChainId(chainId),
				})

				return markets
					.filter((market) => {
						if (market.eventsInfo.numOfEvents.lt(3)) {
							return false
						}

						if (status === 'active') {
							return market.periodsInfo.closingTime.gt(Math.round(Date.now() / 1000))
						} else if (status === 'pending') {
							return (
								market.periodsInfo.resultSubmissionPeriodStart.eq(0) &&
								market.periodsInfo.closingTime.lt(Math.round(Date.now() / 1000))
							)
						} else if (status === 'closed') {
							return market.periodsInfo.resultSubmissionPeriodStart.gt(0)
						}

						return true
					})
					.map((market) => marketViewToMarket(market))
			}
		}
	)
}

export const useMarketsIdsByStatus = (chainId: number, status: MarketStatus | 'not_closed') => {
	return useQuery<Address[], Error>(['useMarketsIdsByStatus', { chainId, status }], async () => {
		const variables: QueryVariables = {}

		if (status === 'active') {
			variables['closingTime_gt'] = String(Math.round(Date.now() / 1000))
		} else if (status === 'pending') {
			variables['resultSubmissionPeriodStart'] = '0'
			variables['closingTime_lt'] = String(Math.round(Date.now() / 1000))
		} else if (status === 'closed') {
			variables['resultSubmissionPeriodStart_gt'] = '0'
		} else if (status === 'not_closed') {
			variables['resultSubmissionPeriodStart'] = '0'
		}

		const buildResult = buildQuery(query, variables)

		const response = await apolloProdeQuery<{ markets: GraphMarket[] }>(
			chainId,
			buildResult.query,
			buildResult.variables
		)

		if (!response) throw new Error('No response from TheGraph')

		return response.data.markets.map((m) => m.id)
	})
}
