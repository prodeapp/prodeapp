import { BigNumber } from '@ethersproject/bignumber'
import { useAccount, useBalance, useNetwork } from 'wagmi'

import { formatAmount } from '@/lib/helpers'

export default function TabInfo() {
	const { chain } = useNetwork()
	const { address } = useAccount()
	const { data: nativeBalance = { value: BigNumber.from(0) } } = useBalance({ address })

	return (
		<div>
			{chain && (
				<>
					<div style={{ fontSize: 12 }}>Balance</div>
					<div style={{ fontSize: 30, fontWeight: 600 }}>{formatAmount(nativeBalance.value, chain.id)}</div>
				</>
			)}
		</div>
	)
}
