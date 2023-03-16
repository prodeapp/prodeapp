import { useQuery } from '@tanstack/react-query'
import { Address } from '@wagmi/core'
import compareAsc from 'date-fns/compareAsc'
import fromUnixTime from 'date-fns/fromUnixTime'

import { isFinalized } from '@/lib/helpers'

import { useEvents } from './useEvents'
import { useMarket } from './useMarket'

type MarketStatus =
	| 'ACCEPTING_BETS'
	| 'WAITING_ANSWERS'
	| 'WAITING_AVAILABITILY_OF_RESULTS'
	| 'WAITING_REGISTER_POINTS'
	| 'FINALIZED'

export const useMarketStatus = (marketId: Address, chainId: number) => {
	const { data: market } = useMarket(marketId, chainId)
	const { data: events } = useEvents(marketId, chainId)

	return useQuery<MarketStatus | '', Error>(
		['useMarketStatus', marketId],
		async () => {
			if (!market || !events) {
				return ''
			}

			if (compareAsc(fromUnixTime(market.closingTime), new Date()) === 1) {
				// closingTime > now
				return 'ACCEPTING_BETS'
			}

			const hasPendingAnswers = events.filter((q) => !isFinalized(q)).length > 0

			if (hasPendingAnswers) {
				return 'WAITING_ANSWERS'
			}

			if (
				/* now() > closingTime && */
				market.resultSubmissionPeriodStart === 0
			) {
				return 'WAITING_AVAILABITILY_OF_RESULTS'
			}

			if (
				/* market.resultSubmissionPeriodStart !== '0' && */
				compareAsc(fromUnixTime(market.resultSubmissionPeriodStart + market.submissionTimeout), new Date()) === 1
			) {
				// resultSubmissionPeriodStart > now
				return 'WAITING_REGISTER_POINTS'
			}

			// available to claim rewards
			return 'FINALIZED'
		},
		{
			enabled: !!market && !!events,
		}
	)
}
