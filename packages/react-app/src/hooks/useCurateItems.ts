import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNetwork } from 'wagmi'

import { CurateItem } from '@/graphql/subgraph'
import { DEFAULT_CHAIN } from '@/lib/config'
import { DecodedCurateListFields, fetchCurateItemsByHash, getDecodedParams } from '@/lib/curate'

export const useCurateItems = (marketHash: string) => {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()
	return useQuery<CurateItem[], Error>(['useCurateItem', marketHash, chain.id], async () => {
		return fetchCurateItemsByHash(chain.id, marketHash)
	})
}

export const useCurateItemJson = (marketHash: string): DecodedCurateListFields['Details'] | null => {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()
	const [itemJson, setItemJson] = useState<DecodedCurateListFields['Details'] | null>(null)
	const { data: curateItems, error, isLoading } = useCurateItems(marketHash)

	useEffect(() => {
		if (error || isLoading) {
			setItemJson(null)
			return
		}

		;(async () => {
			if (curateItems.length > 0) {
				const itemProps = await getDecodedParams(chain.id, curateItems[0].id)
				setItemJson(itemProps.Details)
			}
		})()
	}, [curateItems, error, isLoading])

	return itemJson
}
