import { useQuery } from '@tanstack/react-query'
import { Address } from '@wagmi/core'

import { Response, RESPONSES_FIELDS } from '@/graphql/subgraph'
import { apolloRealityQuery } from '@/lib/apolloClient'
import { buildQuery, QueryVariables } from '@/lib/SubgraphQueryBuilder'

type ResponsesProps = {
	playerId: Address
	chainId: number
	pending?: boolean
}

const query = `
    ${RESPONSES_FIELDS}
    query ResponsesQuery($user: String) {
      responses(where: {user: $user}, orderBy: timestamp, orderDirection:desc) {
        ...ResponseFields
      }
    }
`

export const useResponses = ({ playerId, chainId, pending }: ResponsesProps) => {
	return useQuery<Response[], Error>(
		['useEventsResponses', playerId, chainId, pending],
		async () => {
			const variables: QueryVariables = { user: playerId.toLowerCase() }

			if (pending) {
				// variables['reward_gt'] = '0'
			}

			const response = await apolloRealityQuery<{ responses: Response[] }>(
				chainId,
				buildQuery(query, variables),
				variables
			)

			if (!response) throw new Error('No response from TheGraph')

			return response.data.responses
		},
		{ enabled: !!playerId }
	)
}
