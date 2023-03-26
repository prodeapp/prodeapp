import { BigNumber } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'
import { getContract, getProvider, readContract } from '@wagmi/core'

import { ArbitratorAbi } from '@/abi/Arbitrator'
import { GeneralizedTCRAbi } from '@/abi/GeneralizedTCR'
import { filterChainId } from '@/lib/config'

export const useSubmissionDeposit = (tcrAddress: string, chainId: number) => {
	return useQuery<BigNumber, Error>(
		['useSubmissionDeposit', tcrAddress, chainId],
		async () => {
			return getSubmissionDeposit(tcrAddress, chainId)
		},
		{
			enabled: !!tcrAddress,
		}
	)
}

export const getSubmissionDeposit = async (tcrAddress: string, chainId: number) => {
	const generalizedTCR = getContract({
		address: tcrAddress,
		abi: GeneralizedTCRAbi,
		signerOrProvider: getProvider({ chainId: filterChainId(chainId) }),
	})

	const [arbitrator, arbitratorExtraData, submissionBaseDeposit] = await Promise.all([
		generalizedTCR.arbitrator(),
		generalizedTCR.arbitratorExtraData(),
		generalizedTCR.submissionBaseDeposit(),
	])

	const arbitrationCost = await readContract({
		address: arbitrator,
		abi: ArbitratorAbi,
		functionName: 'arbitrationCost',
		args: [arbitratorExtraData],
		chainId: filterChainId(chainId),
	})

	return submissionBaseDeposit.add(arbitrationCost)
}
