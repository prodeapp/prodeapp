import { BigNumber } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'
import { Address } from '@wagmi/core'
import { useContractReads } from 'wagmi'

import { GnosisChainReceiverAbi } from '@/abi/GnosisChainReceiver'
import { VoucherManagerAbi } from '@/abi/VoucherManager'
import { filterChainId, getConfigAddress, GNOSIS_CHAIN_RECEIVER_ADDRESS, isMainChain } from '@/lib/config'

export const useHasVoucher = (address: Address | undefined, marketId: Address, chainId: number, price: BigNumber) => {
	return useQuery<boolean, Error>(['useHasVoucher', { address, marketId, chainId, price }], async () => {
		try {
			const { data } = useContractReads({
				contracts: [
					isMainChain(chainId)
						? {
								address: address && getConfigAddress('VOUCHER_MANAGER', chainId),
								abi: VoucherManagerAbi,
								functionName: 'balance',
								args: [address],
								chainId: filterChainId(chainId),
						  }
						: {
								address: address && GNOSIS_CHAIN_RECEIVER_ADDRESS,
								abi: GnosisChainReceiverAbi,
								functionName: 'voucherBalance',
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
		} catch (e) {
			// market not whitelisted
			return false
		}
	})
}
