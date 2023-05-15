import { AddressZero } from '@ethersproject/constants'
import { t } from '@lingui/macro'
import { Trans } from '@lingui/macro'
import { useTheme } from '@mui/material'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React from 'react'
import { Link, Link as RouterLink } from 'react-router-dom'

import { Market } from '@/graphql/subgraph'
import { usePhone } from '@/hooks/useResponsive'
import { useSubmissionPeriodEnd } from '@/hooks/useSubmissionPeriodEnd'
import { betsClosingSoon, formatAmount, getTimeLeft } from '@/lib/helpers'
import { useI18nContext } from '@/lib/I18nContext'
import { paths } from '@/lib/paths'

type MarketsTableProps = {
	markets?: Market[]
	chainId: number
}

export const MarketsGrid = styled(Grid)(({ theme }) => ({
	[theme.breakpoints.up('sm')]: {
		borderTop: `1px solid ${theme.palette.black.dark}`,
	},
	'.MuiGrid-item': {
		border: `1px solid ${theme.palette.black.dark}`,

		[theme.breakpoints.down('sm')]: {
			marginBottom: '20px',
		},

		[theme.breakpoints.up('sm')]: {
			borderTop: 'none',

			'&:nth-child(even)': {
				borderLeft: 'none',
			},
			'&:nth-child(n+3)': {
				borderTop: 'none',
			},
			'&:nth-last-child(-n+2)': {
				borderBottom: 'none',
			},
		},
	},
}))

export const MarketDetails = styled(Box)(({ theme }) => ({
	[theme.breakpoints.up('sm')]: {
		borderLeft: `1px solid ${theme.palette.black.dark}`,
	},
	'>div': {
		padding: theme.spacing(2),

		'&:not(:last-child)': {
			borderBottom: `1px solid ${theme.palette.black.dark}`,
		},
	},
}))

function MarketBox({ market, chainId }: { market: Market; chainId: number }) {
	const { locale } = useI18nContext()
	const theme = useTheme()
	const closingTimeLeft = getTimeLeft(market.closingTime, false, locale)
	const { data: submissionPeriodEnd = 0 } = useSubmissionPeriodEnd(market.id, chainId)
	const distributionTimeLeft = getTimeLeft(submissionPeriodEnd, false, locale)
	let status = <Chip label={t`Closed`} color='error' />

	if (market.resultSubmissionPeriodStart === 0) {
		if (closingTimeLeft !== false) {
			status = <Chip label={t`Betting`} color='success' />
		} else {
			status = <Chip label={t`Playing`} color='warning' />
		}
	}

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: { xs: 'column', md: 'row' },
				justifyContent: 'space-between',
				height: '100%',
			}}
		>
			<Box sx={{ p: '24px', paddingRight: { md: '15%' }, flexGrow: 1 }}>
				<div
					style={{
						height: '95%',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
					}}
				>
					<div>
						<div style={{ fontWeight: 'normal', marginBottom: '5px' }}>{status}</div>
						<Typography variant='h4s' component='h2' style={{ marginTop: '20px' }}>
							<Link to={paths.market(market.id, chainId)}>{market.name}</Link>
						</Typography>
					</div>
					{closingTimeLeft === false && (
						<div style={{ textAlign: 'center' }}>
							{market.hasPendingAnswers && (
								<>
									<div style={{ marginBottom: 10, fontWeight: 700 }}>
										<Trans
											id='{0, plural, one {# result left to answer} other {# results left to answer}}'
											values={{
												0: market.numOfEvents - market.numOfEventsWithAnswer,
											}}
										/>
									</div>
									<Button
										component={RouterLink}
										to={paths.market(market.id, chainId)}
										color={'primary'}
										fullWidth
										size='large'
									>
										<Trans>Answer results</Trans>
									</Button>
								</>
							)}

							{distributionTimeLeft !== false && (
								<div>
									<div style={{ marginBottom: 10, fontWeight: 700 }}>
										{t`Prize distribution:` + ' ' + distributionTimeLeft}
									</div>
								</div>
							)}
						</div>
					)}
					{closingTimeLeft !== false && (
						<div style={{ textAlign: 'center' }}>
							{betsClosingSoon(market.closingTime) && (
								<Typography variant='p3' component='div'>
									<Trans>{`There's not much time left, hurry!`}</Trans>
								</Typography>
							)}
							<div style={{ marginBottom: 10, fontWeight: 700 }}>{closingTimeLeft}</div>
							<Button
								component={RouterLink}
								to={paths.market(market.id, chainId)}
								color={'primary'}
								fullWidth
								size='large'
							>
								<Trans>Place Bet</Trans>
							</Button>
						</div>
					)}
				</div>
			</Box>
			<MarketDetails sx={{ minWidth: { md: '245px' } }}>
				<div>
					<div>
						<Trans>Bet Price</Trans>
					</div>
					<div style={{ fontWeight: 'bold' }}>{formatAmount(market.price, chainId)}</div>
				</div>

				<div>
					{market.liquidityInfo.id !== AddressZero && (
						<>
							<div style={{ marginBottom: 10 }}>
								<div>
									<Trans>Perfect Score Prize</Trans>
								</div>
								<div style={{ fontWeight: 'bold' }}>{formatAmount(market.liquidityInfo.prizePool, chainId)}</div>
							</div>
							<div>
								<div>
									<Trans>Base Prize</Trans>
								</div>
								<div style={{ fontWeight: 'bold' }}>{formatAmount(market.pool, chainId)}</div>
							</div>
						</>
					)}

					{market.liquidityInfo.id === AddressZero && (
						<div>
							<div>
								<Trans>Pool Prize</Trans>
							</div>
							<div style={{ fontWeight: 'bold' }}>{formatAmount(market.pool, chainId)}</div>
						</div>
					)}
				</div>

				<div>
					<div>
						<Trans>Participants</Trans>
					</div>
					<div style={{ fontWeight: 'bold' }}>{market.numOfBets}</div>
				</div>

				<div>
					<div>
						<Trans>Verified</Trans>
					</div>
					<div
						style={{
							fontWeight: 'bold',
							color: market.curated ? theme.palette.success.dark : theme.palette.error.dark,
						}}
					>
						{market.curated && <Trans>Yes</Trans>}
						{!market.curated && <Trans>Not yet</Trans>}
					</div>
				</div>
			</MarketDetails>
		</Box>
	)
}

function MarketsTable({ markets, chainId }: MarketsTableProps) {
	const isPhone = usePhone()

	if (!markets || markets.length === 0) {
		return (
			<Alert severity='info'>
				<Trans>No markets found.</Trans>
			</Alert>
		)
	}

	return (
		<MarketsGrid container spacing={0}>
			{markets.map((market, i) => {
				return (
					<Grid item xs={12} md={6} key={i}>
						<MarketBox market={market} chainId={chainId} />
					</Grid>
				)
			})}

			{!isPhone && markets.length % 2 !== 0 && <div></div>}
		</MarketsGrid>
	)
}

export default MarketsTable
