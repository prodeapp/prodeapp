import { useQuery } from '@tanstack/react-query'

import { MarketReferral, MARKETREFERRAL_FIELDS } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { buildQuery } from '@/lib/SubgraphQueryBuilder'

const query = `
    ${MARKETREFERRAL_FIELDS}
    query MarketReferralsQuery(#params#) {
      marketReferrals(where: {#where#}) {
        ...MarketReferralFields
      }
    }
`

interface Props {
	provider: string
}

export const useMarketReferrals = ({ provider }: Props) => {
	return useQuery<MarketReferral[], Error>(
		['useMarketReferrals', provider],
		async () => {
			const variables = { provider: provider.toLowerCase() }
			const response = await apolloProdeQuery<{
				marketReferrals: MarketReferral[]
			}>(buildQuery(query, variables), variables)

			if (!response) throw new Error('No response from TheGraph')

			return response.data.marketReferrals
		},
		{ enabled: !!provider }
	)
}
