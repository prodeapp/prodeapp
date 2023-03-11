import { useQuery } from '@tanstack/react-query'
import { useNetwork } from 'wagmi'

import { MarketReferral, MARKETREFERRAL_FIELDS } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { DEFAULT_CHAIN } from '@/lib/config'
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
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()
	return useQuery<MarketReferral[], Error>(
		['useMarketReferrals', provider, chain.id],
		async () => {
			const variables = { provider: provider.toLowerCase() }
			const response = await apolloProdeQuery<{
				marketReferrals: MarketReferral[]
			}>(chain.id, buildQuery(query, variables), variables)

			if (!response) throw new Error('No response from TheGraph')

			return response.data.marketReferrals
		},
		{ enabled: !!provider }
	)
}
