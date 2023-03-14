import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/react'
import { Alert, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import React, { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

import { ReactComponent as ArrowRight } from '@/assets/icons/arrow-right-2.svg'
import { ReactComponent as CurrencyIcon } from '@/assets/icons/currency.svg'
import { Market } from '@/graphql/subgraph'
import { useHasVoucher } from '@/hooks/useHasVoucher'
import { betsClosingSoon, formatAmount, getTimeLeft } from '@/lib/helpers'
import { useI18nContext } from '@/lib/I18nContext'

export default function PlaceBet({
	market,
	chainId,
	onBetClick,
	onResultsClick,
}: {
	market: Market
	chainId: number
	onBetClick: () => void
	onResultsClick: () => void
}) {
	const { address } = useAccount()
	const hasVoucher = useHasVoucher(address, market.id, chainId, BigNumber.from(market.price))
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

	return (
		<div style={{ textAlign: 'center', margin: '0 auto' }}>
			<Box sx={{ marginTop: '50px', marginBottom: { xs: '50px', md: '100px' } }}>
				<CurrencyIcon />
				<Typography variant='p3' component='div'>
					<Trans id='Bet Price:' />
				</Typography>
				<div style={{ fontWeight: 'bold' }}>{formatAmount(market.price, chainId)}</div>
			</Box>

			{timeLeft !== false && (
				<>
					{hasVoucher && (
						<Alert severity={'info'} sx={{ mb: 2, fontWeight: 700, justifyContent: 'center' }}>
							<Trans id='You have a voucher available to place a bet for free!' />
						</Alert>
					)}
					{betsClosingSoon(market.closingTime) && (
						<Typography variant='p3' component='div'>
							<Trans id="There's not much time left, hurry!" />
						</Typography>
					)}
					<div style={{ fontWeight: 'bold', marginBottom: '15px' }}>{timeLeft}</div>
					<Button color='primary' size='large' fullWidth onClick={onBetClick}>
						<Trans id='Place Bet' /> - {formatAmount(market.price, chainId)} <ArrowRight style={{ marginLeft: 10 }} />
					</Button>
				</>
			)}

			{timeLeft === false && market.hasPendingAnswers && (
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
						<Trans id='Answer results' /> <ArrowRight style={{ marginLeft: 10 }} />
					</Button>
				</>
			)}
		</div>
	)
}
