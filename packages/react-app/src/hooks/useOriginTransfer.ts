import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { OriginTransfer, ORIGINTRANSFER_FIELDS } from '@/graphql/subgraph'
import { apolloConnextQuery } from '@/lib/apolloClient'

const query = `
    ${ORIGINTRANSFER_FIELDS}
    query OriginTransfer($transferId: String) {
		originTransfer(id:$transferId) {
		  chainId
		  status
		}
	  }
`

export const useOriginTransfer = (transferId: string | undefined, chainId: number | undefined) => {
	const [originTransfer, setOriginTransfer] = useState<OriginTransfer | null>(null)

	return useQuery<OriginTransfer, Error>(
		['useOriginTransfer', transferId, chainId],
		async () => {
			if (originTransfer === null || originTransfer?.status !== 'XCalled') {
				const response = await apolloConnextQuery<{ originTransfer: OriginTransfer }>(chainId!, query, {
					transferId: transferId!.toLowerCase(),
				})

				if (!response) throw new Error('No response from TheGraph')
				setOriginTransfer(response.data.originTransfer)
				return response.data.originTransfer
			}
			return originTransfer
		},
		{ enabled: !!transferId && !!chainId, refetchInterval: 5000 }
	)
}
