import { useQuery } from '@tanstack/react-query'
import { useNetwork } from 'wagmi'

import { Attribution, ATTRIBUTION_FIELDS } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { DEFAULT_CHAIN } from '@/lib/config'
import { buildQuery } from '@/lib/SubgraphQueryBuilder'

const query = `
    ${ATTRIBUTION_FIELDS}
    query AttributionsQuery(#params#) {
      attributions(where: {#where#}, orderBy:timestamp, orderDirection:desc) {
        ...AttributionFields
      }
    }
`

interface Props {
	provider: string
}

export const useAttributions = ({ provider }: Props) => {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()
	return useQuery<Attribution[], Error>(
		['useAttributions', provider, chain.id],
		async () => {
			const variables = { provider: provider?.toLowerCase() }

			const response = await apolloProdeQuery<{ attributions: Attribution[] }>(
				chain.id,
				buildQuery(query, variables),
				variables
			)

			if (!response) throw new Error('No response from TheGraph')

			return response.data.attributions
		},
		{ enabled: !!provider }
	)
}
