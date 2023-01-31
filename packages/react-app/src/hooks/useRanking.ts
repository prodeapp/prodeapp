import { useQuery } from '@tanstack/react-query'

import { Bet, BET_FIELDS } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { buildQuery } from '@/lib/SubgraphQueryBuilder'

const query = `
    ${BET_FIELDS}
    query BetsQuery(#params#) {
      bets(where: {#where#}, orderBy: points, orderDirection: desc) {
        ...BetFields
      }
    }
`

export const useRanking = (marketId: string) => {
	return useQuery<Bet[], Error>(
		['useRanking', marketId],
		async () => {
			const variables = { market: marketId.toLowerCase() }

			const response = await apolloProdeQuery<{ bets: Bet[] }>(buildQuery(query, variables), variables)

			if (!response) throw new Error('No response from TheGraph')

			return response.data.bets
		},
		{ enabled: !!marketId }
	)
}
