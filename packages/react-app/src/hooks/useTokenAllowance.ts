import { BigNumber } from '@ethersproject/bignumber'
import { AddressZero } from '@ethersproject/constants'
import { useQuery } from '@tanstack/react-query'
import { Address, readContract } from '@wagmi/core'
import { erc20ABI } from 'wagmi'

export const useTokenAllowance = (token?: Address, owner?: Address, spender?: Address) => {
	return useQuery<BigNumber, Error>(
		['useTokenAllowance', token, owner, spender],
		async () => {
			return await readContract({
				address: token!,
				abi: erc20ABI,
				functionName: 'allowance',
				args: [owner!, spender!],
			})
		},
		{ enabled: !!token && token !== AddressZero && !!owner && !!spender }
	)
}
