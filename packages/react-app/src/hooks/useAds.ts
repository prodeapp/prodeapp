import { useQuery } from '@tanstack/react-query'
import { useNetwork } from 'wagmi'

import { SVG_AD_FIELDS, SVGAd } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { DEFAULT_CHAIN } from '@/lib/config'

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
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()
	return useQuery<SVGAd[], Error>(['useAds', market, chain.id], async () => {
		const response = await apolloProdeQuery<{ svgads: SVGAd[] }>(chain.id, query, {
			marketId: market ? [market] : [],
		})

		if (!response) throw new Error('No response from TheGraph')

		return response.data.svgads
	})
}
