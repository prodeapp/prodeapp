import { BigNumber } from '@ethersproject/bignumber'
import { Address } from '@wagmi/core'
import { useContractReads } from 'wagmi'

import { VoucherManagerAbi } from '@/abi/VoucherManager'
import { filterChainId, getConfigAddress } from '@/lib/config'

export const useHasVoucher = (address: Address | undefined, marketId: Address, chainId: number, price: BigNumber) => {
	const { data } = useContractReads({
		contracts: [
			{
				address: address && getConfigAddress('VOUCHER_MANAGER', chainId),
				abi: VoucherManagerAbi,
				functionName: 'balance',
				args: [address],
				chainId: filterChainId(chainId),
			},
			{
				address: address && getConfigAddress('VOUCHER_MANAGER', chainId),
				abi: VoucherManagerAbi,
				functionName: 'marketsWhitelist',
				args: [marketId],
				chainId: filterChainId(chainId),
			},
		],
	})

	const [voucherBalance, marketWhitelisted] = [data?.[0] || BigNumber.from(0), data?.[1] || false] as [
		BigNumber,
		boolean
	]

	return voucherBalance.gte(price) && marketWhitelisted
}
