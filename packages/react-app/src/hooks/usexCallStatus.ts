import { useQuery } from '@tanstack/react-query'

import { DestinationTransfer, DESTINATIONTRANSFER_FIELDS } from '@/graphql/subgraph'
import { apolloConnextQuery } from '@/lib/apolloClient'

const query = `
    ${DESTINATIONTRANSFER_FIELDS}
    query DestinationTrasnferFields($transferId: String) {
      destinationTransfer(id:$transferId) {
        ...XCallStatusFields
      }
    }
`

export const usexCallStatus = (transferId: string | undefined, chainId: number) => {
	return useQuery<DestinationTransfer, Error>(
		['usexCallStatus', transferId, chainId],
		async () => {
			const response = await apolloConnextQuery<{ destinationTransfer: DestinationTransfer }>(chainId, query, {
				transferId: transferId!.toLowerCase(),
			})

			if (!response) throw new Error('No response from TheGraph')

			return response.data.destinationTransfer
		},
		{ enabled: !!transferId }
	)
}
