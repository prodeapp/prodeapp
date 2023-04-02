import { BigNumber } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'

import { sdkConfig } from '@/lib/connext'
import { create } from '@/lib/connext/sdk'

export const useEstimateRelayerFee = (originDomain: string, destinationDomain: string) => {
	return useQuery<BigNumber, Error>(
		['useEstimateRelayerFee', originDomain, destinationDomain],
		async () => {
			const { sdkBase } = await create(sdkConfig)

			return await sdkBase.estimateRelayerFee({
				originDomain,
				destinationDomain,
			})
		},
		{
			enabled: !!originDomain && !!destinationDomain,
		}
	)
}
