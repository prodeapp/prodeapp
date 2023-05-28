import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { DestinationTransfer, DESTINATIONTRANSFER_FIELDS } from '@/graphql/subgraph'
import { apolloConnextQuery } from '@/lib/apolloClient'

const query = `
    ${DESTINATIONTRANSFER_FIELDS}
    query DestinationTrasnfer($transferId: String) {
      destinationTransfer(id:$transferId) {
        ...DestinationTrasnferFields
      }
    }
`

export const useDestinationTransfer = (transferId: string | undefined, chainId: number | undefined) => {
	const [destinationTransfer, setDestinationTransfer] = useState<undefined | DestinationTransfer>(undefined)

	return useQuery<DestinationTransfer, Error>(
		['useDestinationTransfer', transferId, chainId],
		async () => {
			if (
				destinationTransfer === undefined ||
				['Executed', 'CompletedFast', 'CompletedSlow'].indexOf(destinationTransfer.status) === -1
			) {
				const response = await apolloConnextQuery<{ destinationTransfer: DestinationTransfer }>(chainId!, query, {
					transferId: transferId!.toLowerCase(),
				})

				if (!response) throw new Error('No response from TheGraph')
				setDestinationTransfer(response.data.destinationTransfer)
				return response.data.destinationTransfer
			}
			return destinationTransfer
		},
		{
			enabled: !!transferId && !!chainId,
			refetchInterval: 5000,
		}
	)
}
