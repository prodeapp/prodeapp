import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/macro'
import Button from '@mui/material/Button'
import { useAccount, useBalance, useNetwork } from 'wagmi'

import { RealityAbi } from '@/abi/RealityETH_v3_0'
import { useClaimArgs } from '@/hooks/useReality'
import { useSendRecklessTx } from '@/hooks/useSendTx'
import { getConfigAddress, isMainChain } from '@/lib/config'
import { CROSS_CHAIN_CONFIG } from '@/lib/connext'
import { formatAmount } from '@/lib/helpers'

function RealityClaim() {
	const { chain } = useNetwork()
	const { address } = useAccount()

	const { data: claimArgs } = useClaimArgs(address || '')

	const { isSuccess, write } = useSendRecklessTx({
		address: getConfigAddress('REALITIO', chain?.id),
		abi: RealityAbi,
		functionName: 'claimMultipleAndWithdrawBalance',
	})

	const claimReality = async () => {
		if (!claimArgs) {
			return
		}

		write!({
			recklesslySetUnpreparedArgs: [
				claimArgs.question_ids,
				claimArgs.answer_lengths,
				claimArgs.history_hashes,
				claimArgs.answerers,
				claimArgs.bonds,
				claimArgs.answers,
			],
		})
	}

	if (chain && !chain.unsupported && isMainChain(chain?.id) && !isSuccess && claimArgs && claimArgs.total.gt(0)) {
		return (
			<div style={{ marginBottom: 20 }}>
				<div style={{ marginBottom: 10 }}>
					<Trans>You have funds available to claim for your answers.</Trans>
				</div>
				<Button onClick={claimReality} color='primary' size='small'>
					<Trans>Claim</Trans> {formatAmount(claimArgs.total, chain.id)}
				</Button>
			</div>
		)
	}

	return null
}

export default function TabInfo() {
	const { chain } = useNetwork()
	const { address } = useAccount()

	const usdcAddress = chain ? CROSS_CHAIN_CONFIG?.[chain.id]?.USDC : undefined
	const { data: nativeBalance = { value: BigNumber.from(0) } } = useBalance({ address })
	const { data: usdcBalance = { value: BigNumber.from(0) } } = useBalance({
		address,
		token: usdcAddress,
		chainId: chain?.id,
	})

	const mainChain = isMainChain(chain?.id)

	return (
		<div>
			{chain && (
				<div style={{ marginBottom: 20 }}>
					<div style={{ fontSize: 12 }}>Balance</div>
					{mainChain && (
						<div style={{ fontSize: 30, fontWeight: 600 }}>{formatAmount(nativeBalance.value, chain.id)}</div>
					)}
					{!mainChain && !!usdcAddress && (
						<div style={{ fontSize: 30, fontWeight: 600 }}>{formatAmount(usdcBalance.value, chain.id, true, 6)}</div>
					)}
				</div>
			)}
			<RealityClaim />
		</div>
	)
}
