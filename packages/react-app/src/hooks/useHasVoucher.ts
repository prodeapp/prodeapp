import { BigNumber } from '@ethersproject/bignumber'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { Address } from '@wagmi/core'
import { readContracts } from 'wagmi'

import { GnosisChainReceiverAbi } from '@/abi/GnosisChainReceiver'
import { VoucherManagerAbi } from '@/abi/VoucherManager'
import { filterChainId, getConfigAddress, GNOSIS_CHAIN_RECEIVER_ADDRESS, isMainChain } from '@/lib/config'

type UseHasVoucher = (
	address: Address | undefined,
	marketId: Address,
	chainId: number,
	price: BigNumber
) => UseQueryResult<{ hasVoucher: boolean; voucherBalance: BigNumber }, Error>

export const useHasVoucher: UseHasVoucher = (
	address,
	marketId,
	chainId,
	price
) => {
	return useQuery(['useHasVoucher', { address, marketId, chainId, price }], async () => {
		const data = await readContracts({
			contracts: [
				isMainChain(chainId)
					? {
							address: getConfigAddress('VOUCHER_MANAGER', chainId),
							abi: VoucherManagerAbi,
							functionName: 'balance',
							args: [address],
							chainId: filterChainId(chainId),
					  }
					: {
							address: GNOSIS_CHAIN_RECEIVER_ADDRESS,
							abi: GnosisChainReceiverAbi,
							functionName: 'voucherBalance',
							args: [address],
							chainId: filterChainId(chainId),
					  },
				{
					address: getConfigAddress('VOUCHER_MANAGER', chainId),
					abi: VoucherManagerAbi,
					functionName: 'marketsWhitelist',
					args: [marketId],
					chainId: filterChainId(chainId),
				},
			],
		}) as [BigNumber, boolean]

		const [voucherBalance, marketWhitelisted] = [data?.[0] || BigNumber.from(0), data?.[1] || false]

		return { hasVoucher: voucherBalance.gte(price) && marketWhitelisted, voucherBalance: voucherBalance }
	})
}
