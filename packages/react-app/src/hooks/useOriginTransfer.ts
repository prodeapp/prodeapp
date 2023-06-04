import { useQuery } from '@tanstack/react-query'

import { OriginTransfer, ORIGINTRANSFER_FIELDS } from '@/graphql/subgraph'
import { apolloConnextQuery } from '@/lib/apolloClient'

const query = `
    ${ORIGINTRANSFER_FIELDS}
    query OriginTransfer($transferId: String) {
		originTransfer(id:$transferId) {
		  ...OriginTransferFields
		}
	  }
`

export const useOriginTransfer = (transferId: string | undefined, chainId: number | undefined) => {
	return useQuery<OriginTransfer, Error>(
		['useOriginTransfer', transferId, chainId],
		async () => {
			console.log('origin ', transferId)
			const response = await apolloConnextQuery<{ originTransfer: OriginTransfer }>(chainId!, query, {
				transferId: transferId!.toLowerCase(),
			})

			if (!response) throw new Error('No response from TheGraph')

			return response.data.originTransfer
		},
		{ enabled: !!transferId && !!chainId }
	)
}
