import { useQuery } from '@tanstack/react-query'
import { useNetwork } from 'wagmi'

import { SVG_AD_FIELDS, SVGAd } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { filterChainId } from '@/lib/config'

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
	const { chain } = useNetwork()
	const chainId = filterChainId(chain?.id)
	return useQuery<SVGAd[], Error>(['useAds', market, chainId], async () => {
		const response = await apolloProdeQuery<{ svgads: SVGAd[] }>(chainId, query, {
			marketId: market ? [market] : [],
		})

		if (!response) throw new Error('No response from TheGraph')

		return response.data.svgads
	})
}
