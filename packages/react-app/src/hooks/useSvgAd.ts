import { BigNumber } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'
import { Address, getContract, getProvider } from '@wagmi/core'

import { SVGAbi } from '@/abi/SVG'
import { filterChainId } from '@/lib/config'

export const useSvgAd = (SVGAd: Address, chainId: number) => {
	return useQuery<string, Error>(
		['useSvgAd', SVGAd, chainId],
		async () => {
			const contract = getContract({
				address: SVGAd,
				abi: SVGAbi,
				signerOrProvider: getProvider({ chainId: filterChainId(chainId) }),
			})

			return await contract.getSVG(SVGAd, BigNumber.from(0))
		},
		{
			enabled: !!SVGAd,
		}
	)
}
