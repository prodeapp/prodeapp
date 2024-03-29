import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/macro'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import React, { useEffect, useState } from 'react'
import { useAccount, useNetwork } from 'wagmi'

import { ReactComponent as ArrowRight } from '@/assets/icons/arrow-right-2.svg'
import { ReactComponent as CurrencyIcon } from '@/assets/icons/currency.svg'
import { Market } from '@/graphql/subgraph'
import { useHasVoucher } from '@/hooks/useHasVoucher'
import { betsClosingSoon, formatAmount, getTimeLeft } from '@/lib/helpers'
import { useI18nContext } from '@/lib/I18nContext'

export default function PlaceBet({
	market,
	chainId,
	fullDetails,
	onBetClick,
	onResultsClick,
}: {
	market: Market
	chainId: number
	fullDetails: boolean
	onBetClick: () => void
	onResultsClick: () => void
}) {
	const { address } = useAccount()
	const { chain } = useNetwork()
	const { data: { hasVoucher, voucherBalance } = { hasVoucher: false, voucherBalance: BigNumber.from(0) } } =
		useHasVoucher(address, market.id, chain?.id || chainId, BigNumber.from(market.price))
	const [timeLeft, setTimeLeft] = useState<string | false>(false)
	const { locale } = useI18nContext()

	useEffect(() => {
		// to prevent initial flickering
		setTimeLeft(getTimeLeft(market.closingTime, true, locale))

		const interval = setInterval(() => {
			setTimeLeft(getTimeLeft(market.closingTime, true, locale))
		}, 1000)
		return () => clearInterval(interval)
	}, [market, locale])

	const isCrossChainBet = chain?.id !== chainId

	return (
		<div style={{ textAlign: 'center', margin: '0 auto' }}>
			<Box sx={{ marginTop: '50px', marginBottom: { xs: '50px', md: '100px' } }}>
				<CurrencyIcon />
				<Typography variant='p3' component='div'>
					<Trans>Bet Price:</Trans>
				</Typography>
				<div style={{ fontWeight: 'bold' }}>
					{market.price.gt(0) && formatAmount(market.price, chainId, isCrossChainBet)}
					{market.price.eq(0) && <Trans>Free!</Trans>}
				</div>
			</Box>

			{fullDetails && timeLeft !== false && (
				<>
					{hasVoucher && (
						<Alert severity={'info'} sx={{ mb: 2, fontWeight: 700, justifyContent: 'center' }}>
							<Trans>
								You have a voucher available for {formatAmount(voucherBalance, chainId)} to place bets for free!
							</Trans>
						</Alert>
					)}
					{betsClosingSoon(market.closingTime) && (
						<Typography variant='p3' component='div'>
							<Trans>{`There's not much time left, hurry!`}</Trans>
						</Typography>
					)}
					<div style={{ fontWeight: 'bold', marginBottom: '15px' }}>{timeLeft}</div>
					<Button color={market.price.eq(0) ? 'success' : 'primary'} size='large' fullWidth onClick={onBetClick}>
						<Trans>Place Bet</Trans>{' '}
						{market.price.gt(0) && <>- {formatAmount(market.price, chainId, isCrossChainBet)}</>}{' '}
						<ArrowRight style={{ marginLeft: 10 }} />
					</Button>
				</>
			)}

			{fullDetails && timeLeft === false && market.hasPendingAnswers && (
				<>
					<div style={{ fontWeight: 'bold', marginBottom: '15px' }}>
						<Trans
							id='{0, plural, one {# result left to answer} other {# results left to answer}}'
							values={{
								0: market.numOfEvents - market.numOfEventsWithAnswer,
							}}
						/>
					</div>
					<Button color='primary' size='large' fullWidth onClick={onResultsClick}>
						<Trans>Answer results</Trans> <ArrowRight style={{ marginLeft: 10 }} />
					</Button>
				</>
			)}
		</div>
	)
}
