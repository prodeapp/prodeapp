import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/macro'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import { sequence } from '0xsequence'
import { OpenWalletIntent, Settings } from '0xsequence/dist/declarations/src/provider'
import { useAccount, useBalance, useNetwork } from 'wagmi'

import { RealityAbi } from '@/abi/RealityETH_v3_0'
import { Bet } from '@/graphql/subgraph'
import { useBets } from '@/hooks/useBets'
import { usePlayerWinnerBets } from '@/hooks/usePlayerWinnerBets'
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
				<Button onClick={claimReality} color='primary'>
					<Trans>Claim</Trans> {formatAmount(claimArgs.total, chain.id)}
				</Button>
			</div>
		)
	}

	return null
}

function TopUp() {
	// const { chain } = useNetwork()
	const wallet = sequence.getWallet()

	const openTopUp = () => {
		const settings: Settings = {
			theme: 'light',
			// includedPaymentProviders: ['moonpay', 'ramp', 'wyre'],
			defaultFundingCurrency: 'usdc',
			defaultPurchaseAmount: 100,
			lockFundingCurrencyToDefault: true,
		}
		const intent: OpenWalletIntent = {
			type: 'openWithOptions',
			options: {
				settings,
			},
		}
		const path = 'wallet/add-funds'
		wallet.openWallet(path, intent)
	}
	return (
		<Button onClick={openTopUp} color='primary'>
			<Trans>TopUp</Trans>
		</Button>
	)
}

function ActiveBets({ activeBets, loading }: { activeBets: Bet[] | undefined; loading: boolean }): JSX.Element {
	return (
		<div style={{ marginBottom: 20 }}>
			<details>
				<summary style={{ fontSize: 12 }}>Active Bets</summary>
				<ul>
					{loading ? (
						<Skeleton />
					) : activeBets && activeBets.length > 0 ? (
						activeBets.map((bet) => {
							return (
								<li key={`${bet.market}-${bet.tokenID}`}>
									{bet.market.name}: {bet.points}
								</li>
							)
						})
					) : (
						<li>
							No active Bets. Go to <a href='/#'>markets</a> to place a bet.
						</li>
					)}
				</ul>
			</details>
		</div>
	)
}

function WinnerBets({ address }: { address: string | undefined }): JSX.Element {
	const { data: bets, isLoading } = usePlayerWinnerBets(address)
	return (
		<div style={{ marginBottom: 20 }}>
			<details>
				<summary style={{ fontSize: 12 }}>Last Winner Bets</summary>
				<ul>
					{isLoading ? (
						<Skeleton />
					) : bets && bets.length > 0 ? (
						bets.map((bet) => {
							return (
								<li key={`${bet.market}-${bet.tokenID}`}>
									<a href={`/#/markets/100/${bet.market.id}`}>
										{bet.market.name}: <b>{formatAmount(bet.reward, 100)}</b>
									</a>
								</li>
							)
						})
					) : (
						<li>No winner Bets. Good luck for the next bet!</li>
					)}
				</ul>
			</details>
		</div>
	)
}

export default function TabInfo() {
	const { chain } = useNetwork()
	const { address } = useAccount()
	const { data: bets } = useBets({ playerId: address!, chainId: 100 })
	const activeBets = bets
		? bets.filter((bet) => {
				return Number(bet.market.closingTime) >= Math.floor(Date.now() / 1000)
		  })
		: undefined

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
				<div style={{ marginBottom: 20, display: 'flex', alignItems: 'center' }}>
					<div style={{ flex: '2' }}>
						<div style={{ fontSize: 12 }}>Balance</div>
						{mainChain && (
							<div style={{ fontSize: 30, fontWeight: 600 }}>{formatAmount(nativeBalance.value, chain.id)}</div>
						)}
						{!mainChain && !!usdcAddress && (
							<div style={{ fontSize: 30, fontWeight: 600 }}>{formatAmount(usdcBalance.value, chain.id, true, 6)}</div>
						)}
					</div>
					<div style={{ flex: '1' }}>
						<TopUp />
					</div>
				</div>
			)}
			<RealityClaim />
			<ActiveBets activeBets={activeBets} loading={bets === undefined} />
			<WinnerBets address={address} />
		</div>
	)
}
