import { useQuery } from '@tanstack/react-query'

import { SVG_AD_FIELDS, SVGAd } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'

const query = `
    ${SVG_AD_FIELDS}
    query AdsQuery($id: String) {
      svgad(id: $id) {
        ...SVGAdsFields
      }
    }
`

export const useAd = (id: string, chainId: number) => {
	return useQuery<SVGAd, Error>(['useAd', id, chainId], async () => {
		const response = await apolloProdeQuery<{ svgad: SVGAd }>(chainId, query, {
			id: id.toLowerCase(),
		})

		if (!response) throw new Error('No response from TheGraph')

		return response.data.svgad
	})
}
