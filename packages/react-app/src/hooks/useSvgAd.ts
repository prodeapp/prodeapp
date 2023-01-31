import { BigNumber } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'
import { Address, getContract, getProvider } from '@wagmi/core'

import { SVGAbi } from '@/abi/SVG'

export const useSvgAd = (SVGAd: Address) => {
	return useQuery<string, Error>(
		['useSvgAd', SVGAd],
		async () => {
			const contract = getContract({
				address: SVGAd,
				abi: SVGAbi,
				signerOrProvider: getProvider(),
			})

			return await contract.getSVG(SVGAd, BigNumber.from(0))
		},
		{
			enabled: !!SVGAd,
		}
	)
}
