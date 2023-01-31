import { BigNumber } from '@ethersproject/bignumber'
import { Address } from '@wagmi/core'
import { useContractReads } from 'wagmi'

import { VoucherManagerAbi } from '@/abi/VoucherManager'

export const useHasVoucher = (address: Address | undefined, marketId: Address, price: BigNumber) => {
	const { data } = useContractReads({
		contracts: [
			{
				address: import.meta.env.VITE_VOUCHER_MANAGER as Address,
				abi: VoucherManagerAbi,
				functionName: 'balance',
				args: [address],
			},
			{
				address: import.meta.env.VITE_VOUCHER_MANAGER as Address,
				abi: VoucherManagerAbi,
				functionName: 'marketsWhitelist',
				args: [marketId],
			},
		],
	})

	const [voucherBalance, marketWhitelisted] = [data?.[0] || BigNumber.from(0), data?.[1] || false] as [
		BigNumber,
		boolean
	]

	return voucherBalance.gte(price) && marketWhitelisted
}
