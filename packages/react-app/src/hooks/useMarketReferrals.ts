import { useQuery } from '@tanstack/react-query'
import { useNetwork } from 'wagmi'

import { MarketReferral, MARKETREFERRAL_FIELDS } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { filterChainId } from '@/lib/config'
import { buildQuery } from '@/lib/SubgraphQueryBuilder'

const query = `
    ${MARKETREFERRAL_FIELDS}
    query MarketReferralsQuery(#params#) {
      marketReferrals(where: #where#) {
        ...MarketReferralFields
      }
    }
`

interface Props {
	provider: string
}

export const useMarketReferrals = ({ provider }: Props) => {
	const { chain } = useNetwork()
	const chainId = filterChainId(chain?.id)
	return useQuery<MarketReferral[], Error>(
		['useMarketReferrals', provider, chainId],
		async () => {
			const buildResult = buildQuery(query, { provider: provider.toLowerCase() })

			const response = await apolloProdeQuery<{
				marketReferrals: MarketReferral[]
			}>(chainId, buildResult.query, buildResult.variables)

			if (!response) throw new Error('No response from TheGraph')

			return response.data.marketReferrals
		},
		{ enabled: !!provider }
	)
}
