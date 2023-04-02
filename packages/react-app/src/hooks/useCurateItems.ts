import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNetwork } from 'wagmi'

import { CurateItem } from '@/graphql/subgraph'
import { filterChainId } from '@/lib/config'
import { DecodedCurateListFields, fetchCurateItemsByHash, getDecodedParams } from '@/lib/curate'

export const useCurateItems = (marketHash: string) => {
	const { chain } = useNetwork()
	const chainId = filterChainId(chain?.id)
	return useQuery<CurateItem[], Error>(['useCurateItem', marketHash, chainId], async () => {
		return fetchCurateItemsByHash(chainId, marketHash)
	})
}

export const useCurateItemJson = (marketHash: string): DecodedCurateListFields['Details'] | null => {
	const { chain } = useNetwork()
	const chainId = filterChainId(chain?.id)
	const [itemJson, setItemJson] = useState<DecodedCurateListFields['Details'] | null>(null)
	const { data: curateItems, error, isLoading } = useCurateItems(marketHash)

	useEffect(() => {
		if (error || isLoading) {
			setItemJson(null)
			return
		}

		;(async () => {
			if (curateItems.length > 0) {
				const itemProps = await getDecodedParams(chainId, curateItems[0].id)
				setItemJson(itemProps.Details)
			}
		})()
	}, [curateItems, error, isLoading])

	return itemJson
}
