import { useQuery } from '@tanstack/react-query'

import { SVG_AD_FIELDS, SVGAd } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'

export interface UseAdsProps {
	market?: string
}

const query = `
    ${SVG_AD_FIELDS}
    query AdsQuery($marketId: [String!]) {
      svgads(where: {curateSVGAdItem_not: null, markets_contains: $marketId}) {
        ...SVGAdsFields
      }
    }
`

export const useAds = ({ market }: UseAdsProps = {}) => {
	return useQuery<SVGAd[], Error>(['useAds', market], async () => {
		const response = await apolloProdeQuery<{ svgads: SVGAd[] }>(query, {
			marketId: market ? [market] : [],
		})

		if (!response) throw new Error('No response from TheGraph')

		return response.data.svgads
	})
}
