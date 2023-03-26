import { BigNumber } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'
import { getContract, getProvider } from '@wagmi/core'
import { useNetwork } from 'wagmi'

import { SVGFactoryAbi } from '@/abi/SVGFactory'
import { DEFAULT_CHAIN, getConfigAddress } from '@/lib/config'

import { getSubmissionDeposit } from './useSubmissionDeposit'

export const useSVGAdFactoryDeposit = () => {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()

	return useQuery<BigNumber, Error>(['useSVGAdFactoryDeposit', chain.id], async () => {
		const contract = getContract({
			address: getConfigAddress('SVG_AD_FACTORY', chain.id),
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
