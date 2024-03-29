import { useQuery } from '@tanstack/react-query'
import { getContract, getProvider } from '@wagmi/core'

import { MarketAbi } from '@/abi/Market'
import { filterChainId } from '@/lib/config'

export const useSubmissionPeriodEnd = (marketId: string, chainId: number) => {
	return useQuery<number, Error>(
		['useSubmissionPeriodEnd', marketId, chainId],
		async () => {
			const contract = getContract({
				address: marketId,
				abi: MarketAbi,
				signerOrProvider: getProvider({ chainId: filterChainId(chainId) }),
			})

			const [resultSubmissionPeriodStart, submissionTimeout] = await Promise.all([
				contract.resultSubmissionPeriodStart(),
				contract.submissionTimeout(),
			])

			return resultSubmissionPeriodStart.add(submissionTimeout).toNumber()
		},
		{
			enabled: !!marketId,
		}
	)
}
