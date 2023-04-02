import { BigNumber } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'
import { getContract, getProvider } from '@wagmi/core'

import { MarketAbi } from '@/abi/Market'
import { filterChainId } from '@/lib/config'

export const useBetToken = (marketId: string, tokenId: BigNumber, chainId: number) => {
	return useQuery<string, Error>(
		['useBetToken', { marketId, tokenId, chainId }],
		async () => {
			const contract = getContract({
				address: marketId,
				abi: MarketAbi,
				signerOrProvider: getProvider({ chainId: filterChainId(chainId) }),
			})

			const tokenUri = await contract.tokenURI(tokenId)

			if (tokenUri !== undefined) {
				const data = JSON.parse(atob(tokenUri.split(',')[1]))
				return data.image
			}

			return ''
		},
		{
			enabled: !!marketId && !!tokenId,
		}
	)
}
