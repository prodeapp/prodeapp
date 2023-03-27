import { create } from '@connext/sdk'
import { useQuery } from '@tanstack/react-query'
import { BigNumber } from 'ethers'

import { sdkConfig } from '@/lib/connext'

export const useEstimateRelayerFee = (originDomain: string, destinationDomain: string) => {
	return useQuery<BigNumber, Error>(['useEstimateRelayerFee', originDomain, destinationDomain], async () => {
		const { sdkBase } = await create(sdkConfig)

		return await sdkBase.estimateRelayerFee({
			originDomain,
			destinationDomain,
		})
	})
}
