import { BigNumber } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'
import { getContract, getProvider } from '@wagmi/core'
import { Address } from '@wagmi/core'

import { SVGFactoryAbi } from '@/abi/SVGFactory'

import { getSubmissionDeposit } from './useSubmissionDeposit'

export const useSVGAdFactoryDeposit = () => {
	return useQuery<BigNumber, Error>(['useSVGAdFactoryDeposit'], async () => {
		const contract = getContract({
			address: import.meta.env.VITE_SVG_AD_FACTORY as Address,
			abi: SVGFactoryAbi,
			signerOrProvider: getProvider(),
		})

		const [technicalCurate, contentCurate] = await Promise.all([contract.technicalCurate(), contract.contentCurate()])

		const [technicalCurateDeposit, contentCurateDeposit] = await Promise.all([
			getSubmissionDeposit(technicalCurate),
			getSubmissionDeposit(contentCurate),
		])

		return technicalCurateDeposit.add(contentCurateDeposit)
	})
}
