import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import { Typography, useTheme } from '@mui/material'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import React from 'react'
import { Link, Link as RouterLink } from 'react-router-dom'

import { Market } from '@/graphql/subgraph'
import { usePhone } from '@/hooks/useResponsive'
import { useSubmissionPeriodEnd } from '@/hooks/useSubmissionPeriodEnd'
import { betsClosingSoon, formatAmount, getTimeLeft } from '@/lib/helpers'
import { useI18nContext } from '@/lib/I18nContext'

type MarketsTableProps = {
	markets?: Market[]
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

function MarketBox({ market }: { market: Market }) {
	const { locale } = useI18nContext()
	const theme = useTheme()
	const closingTimeLeft = getTimeLeft(market.closingTime, false, locale)
	const { data: submissionPeriodEnd = 0 } = useSubmissionPeriodEnd(market.id)
	const distributionTimeLeft = getTimeLeft(submissionPeriodEnd, false, locale)
	let status = <Chip label={i18n._('Closed')} color='error' />

	if (market.resultSubmissionPeriodStart === 0) {
		if (closingTimeLeft !== false) {
			status = <Chip label={i18n._('Betting')} color='success' />
		} else {
			status = <Chip label={i18n._('Playing')} color='warning' />
		}
	}

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: { xs: 'column', md: 'row' },
				justifyContent: 'space-between',
			}}
		>
			<Box sx={{ p: '24px', paddingRight: { md: '15%' } }}>
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
							<Link to={`/markets/${market.id.toString()}`}>{market.name}</Link>
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
										to={`/markets/${market.id.toString()}`}
										color={'primary'}
										fullWidth
										size='large'
									>
										<Trans id='Answer results' />
									</Button>
								</>
							)}

							{distributionTimeLeft !== false && (
								<div>
									<div style={{ marginBottom: 10, fontWeight: 700 }}>
										{i18n._('Prize distribution:') + ' ' + distributionTimeLeft}
									</div>
								</div>
							)}
						</div>
					)}
					{closingTimeLeft !== false && (
						<div style={{ textAlign: 'center' }}>
							{betsClosingSoon(market.closingTime) && (
								<Typography variant='p3' component='div'>
									<Trans id="There's not much time left, hurry!" />
								</Typography>
							)}
							<div style={{ marginBottom: 10, fontWeight: 700 }}>{closingTimeLeft}</div>
							<Button
								component={RouterLink}
								to={`/markets/${market.id.toString()}`}
								color={'primary'}
								fullWidth
								size='large'
							>
								<Trans id='Place Bet' />
							</Button>
						</div>
					)}
				</div>
			</Box>
			<MarketDetails sx={{ minWidth: { md: '245px' } }}>
				<div>
					<div>
						<Trans id='Bet price' />
					</div>
					<div style={{ fontWeight: 'bold' }}>{formatAmount(market.price)}</div>
				</div>

				<div>
					<div>
						<Trans id='Pool prize' />
					</div>
					<div style={{ fontWeight: 'bold' }}>{formatAmount(market.pool)}</div>
				</div>

				<div>
					<div>
						<Trans id='Participants' />
					</div>
					<div style={{ fontWeight: 'bold' }}>{market.numOfBets}</div>
				</div>

				<div>
					<div>
						<Trans id='Verified' />
					</div>
					<div
						style={{
							fontWeight: 'bold',
							color: market.curated ? theme.palette.success.dark : theme.palette.error.dark,
						}}
					>
						{market.curated && <Trans id='Yes' />}
						{!market.curated && <Trans id='Not yet' />}
					</div>
				</div>
			</MarketDetails>
		</Box>
	)
}

function MarketsTable({ markets }: MarketsTableProps) {
	const isPhone = usePhone()

	if (!markets || markets.length === 0) {
		return (
			<Alert severity='info'>
				<Trans id='No markets found.' />
			</Alert>
		)
	}

	return (
		<MarketsGrid container spacing={0}>
			{markets.map((market, i) => {
				return (
					<Grid item xs={12} md={6} key={i}>
						<MarketBox market={market} />
					</Grid>
				)
			})}

			{!isPhone && markets.length % 2 !== 0 && <div></div>}
		</MarketsGrid>
	)
}

export default MarketsTable
