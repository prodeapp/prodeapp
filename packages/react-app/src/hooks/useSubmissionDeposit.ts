import { BigNumber } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'
import { getContract, getProvider, readContract } from '@wagmi/core'

import { ArbitratorAbi } from '@/abi/Arbitrator'
import { GeneralizedTCRAbi } from '@/abi/GeneralizedTCR'

export const useSubmissionDeposit = (tcrAddress: string) => {
	return useQuery<BigNumber, Error>(
		['useSubmissionDeposit', tcrAddress],
		async () => {
			return getSubmissionDeposit(tcrAddress)
		},
		{
			enabled: !!tcrAddress,
		}
	)
}

export const getSubmissionDeposit = async (tcrAddress: string) => {
	const generalizedTCR = getContract({
		address: tcrAddress,
		abi: GeneralizedTCRAbi,
		signerOrProvider: getProvider(),
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
	})

	return submissionBaseDeposit.add(arbitrationCost)
}
