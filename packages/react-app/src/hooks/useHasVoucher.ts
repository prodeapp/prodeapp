import { BigNumber } from '@ethersproject/bignumber'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { Address } from '@wagmi/core'
import { readContracts } from 'wagmi'

import { GnosisChainReceiverV2Abi } from '@/abi/GnosisChainReceiverV2'
import { DEFAULT_CHAIN, GNOSIS_CHAIN_RECEIVER_ADDRESS } from '@/lib/config'

type UseHasVoucher = (
	address: Address | undefined,
	marketId: Address,
	chainId: number,
	price: BigNumber
) => UseQueryResult<{ hasVoucher: boolean; voucherBalance: BigNumber }, Error>

export const useHasVoucher: UseHasVoucher = (address, marketId, chainId, price) => {
	return useQuery(['useHasVoucher', { address, marketId, chainId, price }], async () => {
		const data = (await readContracts({
			contracts: [
				{
					address: GNOSIS_CHAIN_RECEIVER_ADDRESS,
					abi: GnosisChainReceiverV2Abi,
					functionName: 'voucherBalance',
					args: [address],
					chainId: DEFAULT_CHAIN,
				},
				{
					address: GNOSIS_CHAIN_RECEIVER_ADDRESS,
					abi: GnosisChainReceiverV2Abi,
					functionName: 'marketsWhitelist',
					args: [marketId],
					chainId: DEFAULT_CHAIN,
				},
			],
		})) as [BigNumber, boolean]

		const [voucherBalance, marketWhitelisted] = [data?.[0] || BigNumber.from(0), data?.[1] || false]

		return { hasVoucher: voucherBalance.gte(price) && marketWhitelisted, voucherBalance: voucherBalance }
	})
}
