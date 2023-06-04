import { useQuery } from '@tanstack/react-query'

import { DestinationTransfer, DESTINATIONTRANSFER_FIELDS } from '@/graphql/subgraph'
import { apolloConnextQuery } from '@/lib/apolloClient'

const query = `
    ${DESTINATIONTRANSFER_FIELDS}
    query DestinationTransfer($transferId: String) {
      destinationTransfer(id:$transferId) {
        ...DestinationTrasnferFields
      }
    }
`

export const useDestinationTransfer = (transferId: string | undefined, chainId: number | null) => {
	return useQuery<DestinationTransfer, Error>(
		['useDestinationTransfer', transferId, chainId],
		async () => {
			console.log('destination ', transferId)
			const response = await apolloConnextQuery<{ destinationTransfer: DestinationTransfer }>(chainId!, query, {
				transferId: transferId!.toLowerCase(),
			})

			if (!response) throw new Error('No response from TheGraph')

			return response.data.destinationTransfer
		},
		{
			enabled: !!transferId && !!chainId,
		}
	)
}
