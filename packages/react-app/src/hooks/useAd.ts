import { useQuery } from '@tanstack/react-query'
import { useNetwork } from 'wagmi'

import { SVG_AD_FIELDS, SVGAd } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { DEFAULT_CHAIN } from '@/lib/config'

const query = `
    ${SVG_AD_FIELDS}
    query AdsQuery($id: String) {
      svgad(id: $id) {
        ...SVGAdsFields
      }
    }
`

export const useAd = (id: string) => {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()
	return useQuery<SVGAd, Error>(['useAd', id, chain.id], async () => {
		const response = await apolloProdeQuery<{ svgad: SVGAd }>(chain.id, query, {
			id: id.toLowerCase(),
		})

		if (!response) throw new Error('No response from TheGraph')

		return response.data.svgad
	})
}
