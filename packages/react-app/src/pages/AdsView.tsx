import { formatUnits } from '@ethersproject/units'
import { Trans } from '@lingui/react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { Address } from '@wagmi/core'
import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAccount, useNetwork } from 'wagmi'

import { FirstPriceAuctionAbi } from '@/abi/FirstPriceAuction'
import { ReactComponent as MedalIcon } from '@/assets/icons/medal.svg'
import { TableBody, TableHeader } from '@/components'
import PlaceBidDialog from '@/components/Ads/PlaceBidDialog'
import { AdImg } from '@/components/ImgSvg'
import { AdBid } from '@/graphql/subgraph'
import { useAd } from '@/hooks/useAd'
import { useSendRecklessTx } from '@/hooks/useSendTx'
import { useSvgAd } from '@/hooks/useSvgAd'
import { DEFAULT_CHAIN, getConfigAddress } from '@/lib/config'
import { formatAmount, getBidBalance, getMedalColor, shortenAddress } from '@/lib/helpers'

export interface BidInfo {
	market: Address | ''
	bid: string
	bidPerSecond: string
}

const EMPTY_BID_INFO: BidInfo = {
	market: '',
	bid: '0',
	bidPerSecond: '0',
}

const GridLeftColumn = styled(Grid)(({ theme }) => ({
	background: theme.palette.secondary.main,
	padding: '40px 25px',
}))

export function useIndexedBids(bids?: AdBid[]) {
	return useMemo(() => {
		const res: Record<string, { market: AdBid['market']; bids: AdBid[] }> = {}

		bids?.forEach(bid => {
			if (!res[bid.market.id]) {
				res[bid.market.id] = {
					market: bid.market,
					bids: [],
				}
			}

			res[bid.market.id].bids.push(bid)
		})

		return Object.values(res)
	}, [bids])
}

function AdsView() {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()
	const { id } = useParams()
	const { isLoading, data: ad } = useAd(String(id))
	const groupedBids = useIndexedBids(ad?.bids)
	const { data: svgAd } = useSvgAd(String(id) as Address)
	const theme = useTheme()
	const [openModal, setOpenModal] = useState(false)
	const [bidInfo, setBidInfo] = useState<BidInfo>(EMPTY_BID_INFO)
	const { address } = useAccount()

	const { isSuccess, error, write } = useSendRecklessTx({
		address: getConfigAddress('FIRST_PRICE_AUCTION', chain?.id),
		abi: FirstPriceAuctionAbi,
		functionName: 'removeBid',
	})

	const handleClose = () => {
		setBidInfo(EMPTY_BID_INFO)
		setOpenModal(false)
	}

	const handleOpen = (market: Address | '', bid: string, bidPerSecond: string) => {
		setBidInfo({ market, bid, bidPerSecond })
		setOpenModal(true)
	}

	if (isLoading) {
		return (
			<div>
				<Trans id='Loading...' />
			</div>
		)
	}

	if (!ad) {
		return (
			<div>
				<Trans id='Ad not found' />
			</div>
		)
	}

	const itemId = ad?.curateSVGAdItem?.id

	const handleRemove = (itemId: Address, marketId: Address) => {
		return async () => {
			write!({
				recklesslySetUnpreparedArgs: [itemId, marketId],
			})

			// TODO: remove bid from react-query cache
		}
	}

	return (
		<>
			{itemId && <PlaceBidDialog open={openModal} handleClose={handleClose} itemId={itemId} bidInfo={bidInfo} />}
			<Grid
				container
				spacing={0}
				style={{
					minHeight: '100%',
					borderTop: `1px solid ${theme.palette.black.dark}`,
				}}
			>
				<GridLeftColumn item xs={12} lg={4}>
					<div style={{ textAlign: 'center' }}>
						{svgAd && <AdImg svg={svgAd} type='base64' width={290} />}

						<div style={{ marginTop: '20px' }}>
							<Button color='primary' onClick={() => handleOpen('', '0', '0')}>
								Place new bid
							</Button>
						</div>
					</div>
				</GridLeftColumn>
				<Grid item xs={12} lg={8} sx={{ p: 3 }}>
					{isSuccess && (
						<Alert severity='success'>
							<Trans id='Bid removed.' />
						</Alert>
					)}
					{error && <Alert severity='error'>{error.message}</Alert>}
					{groupedBids.length === 0 && (
						<Alert severity='info'>
							<Trans id='No bids found.' />
						</Alert>
					)}
					{groupedBids.map((bidInfo, i) => {
						return (
							<Box key={i} sx={{ my: 3 }}>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
										marginBottom: '10px',
									}}
								>
									<div>
										<Typography variant='h6'>{bidInfo.market.name}</Typography>
									</div>
									<div>
										<Button color='primary' size='small' onClick={() => handleOpen(bidInfo.market.id, '0', '0')}>
											Place bid
										</Button>
									</div>
								</div>
								<TableHeader>
									<div style={{ width: '25%' }}>Bidder</div>
									<div style={{ width: '25%' }}>Bid per second</div>
									<div style={{ width: '25%' }}>Balance</div>
									<div style={{ width: '25%' }}></div>
								</TableHeader>

								{bidInfo.bids.map((bid, j) => {
									return (
										<TableBody key={j}>
											<div style={{ width: '25%' }}>{shortenAddress(bid.bidder)}</div>
											<div style={{ width: '25%' }}>
												{formatAmount(bid.bidPerSecond, chain.id)}
												{bid.currentHighest && (
													<MedalIcon
														style={{
															marginLeft: '10px',
															fill: getMedalColor(1),
														}}
													/>
												)}
											</div>
											<div style={{ width: '25%' }}>{formatAmount(getBidBalance(bid), chain.id)}</div>
											<div style={{ width: '25%' }}>
												{address?.toLowerCase() === bid.bidder.toLowerCase() && itemId && (
													<>
														<Button
															color='primary'
															variant='outlined'
															size='small'
															onClick={handleRemove(itemId, bid.market.id)}
														>
															Remove
														</Button>
														<Button
															color='primary'
															variant='outlined'
															size='small'
															onClick={() =>
																handleOpen(
																	bidInfo.market.id,
																	formatUnits(bid.balance, 18),
																	formatUnits(bid.bidPerSecond, 18)
																)
															}
														>
															Update
														</Button>
													</>
												)}
											</div>
										</TableBody>
									)
								})}
							</Box>
						)
					})}
				</Grid>
			</Grid>
		</>
	)
}

export default AdsView
