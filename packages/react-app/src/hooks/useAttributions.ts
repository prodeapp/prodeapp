import { useQuery } from '@tanstack/react-query'
import { useNetwork } from 'wagmi'

import { Attribution, ATTRIBUTION_FIELDS } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { filterChainId } from '@/lib/config'
import { buildQuery } from '@/lib/SubgraphQueryBuilder'

const query = `
    ${ATTRIBUTION_FIELDS}
    query AttributionsQuery(#params#) {
      attributions(where: #where#, orderBy:timestamp, orderDirection:desc) {
        ...AttributionFields
      }
    }
`

interface Props {
	provider: string
}

export const useAttributions = ({ provider }: Props) => {
	const { chain } = useNetwork()
	const chainId = filterChainId(chain?.id)
	return useQuery<Attribution[], Error>(
		['useAttributions', provider, chainId],
		async () => {
			const buildResult = buildQuery(query, { provider: provider?.toLowerCase() })

			const response = await apolloProdeQuery<{ attributions: Attribution[] }>(
				chainId,
				buildResult.query,
				buildResult.variables
			)

			if (!response) throw new Error('No response from TheGraph')

			return response.data.attributions
		},
		{ enabled: !!provider }
	)
}
