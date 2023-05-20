import { t } from '@lingui/macro'
import { Trans } from '@lingui/macro'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Grid from '@mui/material/Grid'
import { styled, useTheme } from '@mui/material/styles'
import Switch from '@mui/material/Switch'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { Address } from '@wagmi/core'
import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useAccount } from 'wagmi'

import { ReactComponent as ArrowRightIcon } from '@/assets/icons/arrow-right.svg'
import { ReactComponent as TwitterIcon } from '@/assets/icons/twitter.svg'
import BetForm from '@/components/Bet/BetForm'
import Bets from '@/components/MarketView/Bets'
import DeleteMarket from '@/components/MarketView/DeleteMarket'
import MarketCurateStatus from '@/components/MarketView/MarketCurateStatus'
import MarketInfo from '@/components/MarketView/MarketInfo'
import MarketStatus from '@/components/MarketView/MarketStatus'
import PlaceBet from '@/components/MarketView/PlaceBet'
import ReferralLink from '@/components/MarketView/ReferralLink'
import Results from '@/components/MarketView/Results'
import { Stats } from '@/components/MarketView/Stats'
import { useMarket } from '@/hooks/useMarket'
import { filterChainId } from '@/lib/config'
import { getMarketUrl, getReferralKey, getTwitterShareUrl } from '@/lib/helpers'

const GridLeftColumn = styled(Grid)(({ theme }) => ({
	background: theme.palette.secondary.main,
	padding: '40px 25px',
}))

function a11yProps(index: number) {
	return {
		id: `market-tab-${index}`,
		'aria-controls': `market-tabpanel-${index}`,
	}
}

type MarketSections = 'bet' | 'bets' | 'results' | 'stats'

function MarketsView() {
	const params = useParams()
	const id = params.id as Address
	const chainId = filterChainId(Number(params?.chainId || ''))

	const { isLoading, data: market } = useMarket(id, chainId)
	const [section, setSection] = useState<MarketSections>('bets')
	const [searchParams] = useSearchParams()
	const [onlyMyBets, setOnlyMyBets] = useState(false)
	const theme = useTheme()
	const { address } = useAccount()

	useEffect(() => {
		const referralId = searchParams.get('referralId')

		if (referralId) {
			window.localStorage.setItem(getReferralKey(id), referralId)
		}
	}, [searchParams, id])

	if (isLoading) {
		return (
			<div>
				<Trans>Loading...</Trans>
			</div>
		)
	}

	if (!market) {
		return (
			<div>
				<Trans>Market not found</Trans>
			</div>
		)
	}

	const shareUrl = getTwitterShareUrl(
		t`Check this market on @prode_eth: ${market.name} ${getMarketUrl(market.id, chainId)}`
	)

	const handleChange = (event: React.SyntheticEvent, newValue: MarketSections) => {
		setSection(newValue)
	}

	return (
		<>
			<Grid
				container
				spacing={0}
				style={{
					minHeight: '100%',
					borderTop: `1px solid ${theme.palette.black.dark}`,
				}}
			>
				<GridLeftColumn item xs={12} lg={4}>
					<div>
						<MarketStatus marketId={market.id} chainId={chainId} />
						<h2 style={{ fontSize: '27.65px', marginTop: '10px' }}>{market.name}</h2>

						{address?.toLowerCase() === market.creator.toLowerCase() && market.pool.eq(0) && market.numOfBets === 0 && (
							<div style={{ marginBottom: '20px' }}>
								<DeleteMarket marketId={market.id} />
							</div>
						)}

						<Grid
							container
							spacing={0}
							style={{
								borderBottom: `1px solid ${theme.palette.black.dark}`,
								fontSize: '14px',
								paddingBottom: '20px',
							}}
						>
							<Grid item xs={6} md={6} sx={{ pr: 2 }} style={{ borderRight: `1px solid ${theme.palette.black.dark}` }}>
								<div style={{ fontWeight: 600, marginBottom: 5 }}>
									<Trans>Market verification</Trans>:
								</div>
								<MarketCurateStatus marketHash={market.hash} marketId={market.id} chainId={chainId} />
							</Grid>
							<Grid item xs={6} md={6} sx={{ pl: 2 }}>
								<div style={{ marginBottom: 5 }}>
									<a href={shareUrl} target='_blank' rel='noreferrer'>
										<TwitterIcon /> <Trans>Share on Twitter</Trans>
									</a>
								</div>
								<div>
									<ReferralLink marketId={market.id} chainId={chainId} />
								</div>
							</Grid>
						</Grid>

						<PlaceBet
							market={market}
							chainId={chainId}
							fullDetails={section !== 'bet'}
							onBetClick={() => setSection('bet')}
							onResultsClick={() => setSection('results')}
						/>
					</div>
				</GridLeftColumn>
				<Grid item xs={12} lg={8}>
					{section !== 'bet' && (
						<>
							<MarketInfo market={market} chainId={chainId} />

							<div style={{ display: 'flex', justifyContent: 'space-between' }}>
								<Tabs value={section} onChange={handleChange} aria-label='Market sections' sx={{ marginLeft: '20px' }}>
									<Tab label={t`Bets`} value='bets' {...a11yProps(0)} />
									<Tab label={t`Results`} value='results' {...a11yProps(1)} />
									<Tab label={t`Statistics`} value='stats' {...a11yProps(2)} />
								</Tabs>
								{address && section === 'bets' && (
									<div>
										<FormGroup>
											<FormControlLabel
												control={<Switch checked={onlyMyBets} onClick={() => setOnlyMyBets(!onlyMyBets)} />}
												label={
													<span style={{ fontSize: '14px' }}>
														<Trans>See only my bets</Trans>
													</span>
												}
											/>
										</FormGroup>
									</div>
								)}
							</div>

							{section === 'results' && <Results marketId={market.id} chainId={chainId} />}

							{section === 'bets' && <Bets marketId={market.id} onlyMyBets={onlyMyBets} chainId={chainId} />}

							{section === 'stats' && <Stats marketId={market.id} chainId={chainId} />}
						</>
					)}

					{section === 'bet' && (
						<Box sx={{ mx: { md: 17 }, mb: 10 }}>
							<Button
								variant='text'
								onClick={() => setSection('bets')}
								sx={{
									margin: { xs: '10px 0', md: '40px 0' },
									fontSize: '16px',
								}}
							>
								<ArrowRightIcon style={{ marginRight: 10, transform: 'rotate(180deg)' }} />{' '}
								<Trans>Return to the market</Trans>
							</Button>
							<BetForm market={market} chainId={chainId} cancelHandler={() => setSection('bets')} />
						</Box>
					)}
				</Grid>
			</Grid>
		</>
	)
}

export default MarketsView
