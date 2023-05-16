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
    query ResponsesQuery(#params#) {
      responses(where: #where#, orderBy: timestamp, orderDirection: desc) {
        ...ResponseFields
      }
    }
`

export const useEventsResponses = ({ playerId, chainId, pending }: ResponsesProps) => {
	return useQuery<Response[], Error>(
		['useEventsResponses', { playerId, chainId, pending }],
		async () => {
			const variables: QueryVariables = { user: playerId.toLowerCase() }

			if (pending) {
				variables['question_'] = {
					currentScheduledFinalizationTimestamp_gt: String(Math.floor(Date.now() / 1000)),
				}
			}

			const buildResult = buildQuery(query, variables)

			const response = await apolloRealityQuery<{ responses: Response[] }>(
				chainId,
				buildResult.query,
				buildResult.variables
			)

			if (!response) throw new Error('No response from TheGraph')

			return response.data.responses
		},
		{ enabled: !!playerId }
	)
}
