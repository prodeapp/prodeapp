import { BigNumber } from '@ethersproject/bignumber'
import { Address } from '@wagmi/core'
import { useContractReads, useNetwork } from 'wagmi'

import { VoucherManagerAbi } from '@/abi/VoucherManager'
import { DEFAULT_CHAIN, KEY_VALUE_ADDRESSES, VOUCHER_MANAGER_ADDRESSES } from '@/lib/config'

export const useHasVoucher = (address: Address | undefined, marketId: Address, price: BigNumber) => {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()

	const { data } = useContractReads({
		contracts: [
			{
				address: VOUCHER_MANAGER_ADDRESSES[chain.id as keyof typeof KEY_VALUE_ADDRESSES],
				abi: VoucherManagerAbi,
				functionName: 'balance',
				args: [address],
			},
			{
				address: VOUCHER_MANAGER_ADDRESSES[chain.id as keyof typeof KEY_VALUE_ADDRESSES],
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
