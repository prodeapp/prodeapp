import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import React, { useContext } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useNetwork } from 'wagmi'

import AdsFilter from '@/components/AdsFilter'
import { AdImg } from '@/components/ImgSvg'
import { MarketDetails, MarketsGrid } from '@/components/MarketsTable'
import { SVGAd } from '@/graphql/subgraph'
import { useAds } from '@/hooks/useAds'
import { useSvgAd } from '@/hooks/useSvgAd'
import { DEFAULT_CHAIN } from '@/lib/config'
import { GlobalContext } from '@/lib/GlobalContext'
import { formatAmount } from '@/lib/helpers'

function getBidsInfo(ad: SVGAd): { max: BigNumber; min: BigNumber } {
	const bids = ad.bids
		.map(bid => {
			return BigNumber.from(bid.bidPerSecond)
		})
		.sort((a, b) => {
			return a.sub(b).lt(0) ? 1 : -1
		})

	if (bids.length > 0) {
		return { max: bids[0], min: bids[bids.length - 1] }
	}

	return { max: BigNumber.from(0), min: BigNumber.from(0) }
}

function AdBox({ ad }: { ad: SVGAd }) {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()
	const { data: svgAd } = useSvgAd(ad.id)

	const { max: maxBid, min: minBid } = getBidsInfo(ad)

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: { xs: 'column', md: 'row' },
				justifyContent: 'space-between',
			}}
		>
			<Box sx={{ p: '24px', width: '100%' }}>
				<div
					style={{
						height: '95%',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
						textAlign: 'center',
					}}
				>
					<div style={{ margin: '0 auto' }}>{svgAd && <AdImg svg={svgAd} type='base64' width={290} />}</div>
				</div>
			</Box>
			<MarketDetails sx={{ minWidth: { md: '245px' } }}>
				<div>
					<div>
						<Trans id='Total Bids' />
					</div>
					<div style={{ fontWeight: 'bold' }}>{ad.bids.length}</div>
				</div>

				{ad.bids.length === 1 && (
					<div>
						<div>
							<Trans id='Current Bid' />
						</div>
						<div style={{ fontWeight: 'bold' }}>{formatAmount(maxBid, chain.id)}</div>
					</div>
				)}

				{ad.bids.length > 1 && (
					<>
						<div>
							<div>
								<Trans id='Highest Bid' />
							</div>
							<div style={{ fontWeight: 'bold' }}>{formatAmount(maxBid, chain.id)}</div>
						</div>

						<div>
							<div>
								<Trans id='Lower Bid' />
							</div>
							<div style={{ fontWeight: 'bold' }}>{formatAmount(minBid, chain.id)}</div>
						</div>
					</>
				)}

				<div>
					<Button component={RouterLink} to={`/ads/${ad.id}`} color={'primary'} fullWidth>
						<Trans id='See ad' />
					</Button>
				</div>
			</MarketDetails>
		</Box>
	)
}

function AdsList() {
	const { adsFilters } = useContext(GlobalContext)

	const { isLoading, error, data: ads } = useAds(adsFilters.filters)

	return (
		<>
			<AdsFilter />

			{isLoading && <CircularProgress />}

			{error && <Alert severity='error'>{error.message}</Alert>}

			{!isLoading && !error && (
				<MarketsGrid container spacing={0}>
					{ads.map((ad, i) => {
						return (
							<Grid item xs={12} md={6} key={i}>
								<AdBox ad={ad} />
							</Grid>
						)
					})}
				</MarketsGrid>
			)}
		</>
	)
}

export default AdsList
