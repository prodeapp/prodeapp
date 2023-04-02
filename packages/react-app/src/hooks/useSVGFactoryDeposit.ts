import { BigNumber } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'
import { getContract, getProvider } from '@wagmi/core'
import { useNetwork } from 'wagmi'

import { SVGFactoryAbi } from '@/abi/SVGFactory'
import { filterChainId, getConfigAddress } from '@/lib/config'

import { getSubmissionDeposit } from './useSubmissionDeposit'

export const useSVGAdFactoryDeposit = () => {
	const { chain } = useNetwork()
	const chainId = filterChainId(chain?.id)

	return useQuery<BigNumber, Error>(['useSVGAdFactoryDeposit', chainId], async () => {
		const contract = getContract({
			address: getConfigAddress('SVG_AD_FACTORY', chainId),
			abi: SVGFactoryAbi,
			signerOrProvider: getProvider({ chainId: filterChainId(chainId) }),
		})

		const [technicalCurate, contentCurate] = await Promise.all([contract.technicalCurate(), contract.contentCurate()])

		const [technicalCurateDeposit, contentCurateDeposit] = await Promise.all([
			getSubmissionDeposit(technicalCurate, chainId),
			getSubmissionDeposit(contentCurate, chainId),
		])

		return technicalCurateDeposit.add(contentCurateDeposit)
	})
}
