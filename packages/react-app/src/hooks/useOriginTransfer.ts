import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { OriginTransfer, ORIGINTRANSFER_FIELDS } from '@/graphql/subgraph'
import { apolloConnextQuery } from '@/lib/apolloClient'

const query = `
    ${ORIGINTRANSFER_FIELDS}
    query originTransfer($transferId: String) {
		originTransfer(id:$transferId) {
		  chainId
		  status
		}
	  }
`

export const useOriginTransfer = (transferId: string | undefined, chainId: number | undefined) => {
	const [originTransfer, setOriginTransfer] = useState<undefined | OriginTransfer>(undefined)

	return useQuery<OriginTransfer, Error>(
		['useOriginTransfer', transferId, chainId],
		async () => {
			if (originTransfer === undefined || originTransfer.status !== 'XCalled') {
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
