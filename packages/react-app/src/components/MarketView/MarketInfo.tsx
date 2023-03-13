import { Trans } from '@lingui/react'
import { Typography } from '@mui/material'
import Grid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import React from 'react'
import { useNetwork } from 'wagmi'

import { ReactComponent as MedalIcon } from '@/assets/icons/medal.svg'
import { Market } from '@/graphql/subgraph'
import { LiquidityPool, useLiquidityPool } from '@/hooks/useLiquidityPool'
import { DIVISOR } from '@/hooks/useMarketForm'
import { DEFAULT_CHAIN } from '@/lib/config'
import { formatAmount, getBlockExplorerUrl, getMedalColor, shortenAddress } from '@/lib/helpers'

const MANAGER_ADDRESS: Record<string, string> = {
	'0x64ab34d8cb33f8b8bb3d4b38426896297a3e7f81': 'UBI Burner',
	'0xa3954b4adb7caca9c188c325cf9f2991abb3cf71': 'UBI Burner',
	'0x0029ec18568f96afe25ea289dac6c4703868924d': 'Protocol Treasury',
	'0xbca74372c17597fa9da905c7c2b530766768027c': 'Protocol Treasury',
}

function MarketPrizeInfo({ liquidityPool, market }: { liquidityPool: LiquidityPool; market: Market }) {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()

	if (!liquidityPool) {
		return (
			<>
				<Typography variant='p3' component='div'>
					<Trans id='Prize Pool' />
				</Typography>
				<Typography variant='h3' component='h3'>
					{formatAmount(market.pool, chain.id)}
				</Typography>
			</>
		)
	}

	const lpReward = market.pool.mul(market.managementFee).div(DIVISOR)
	const minPrize = market.pool.sub(lpReward)

	return (
		<>
			<Typography variant='p3' component='div'>
				<Trans id='Full Prize' />
			</Typography>
			<Typography variant='h5' component='h5'>
				{formatAmount(liquidityPool.prizePool.add(minPrize), chain.id)}
			</Typography>
			<Typography variant='p3' component='div' sx={{ mt: 2 }}>
				Minimum Prize
			</Typography>
			<Typography variant='h5' component='h5'>
				{formatAmount(minPrize, chain.id)}
			</Typography>
		</>
	)
}

function MarketInfo({ market }: { market: Market }) {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()
	const { data: liquidityPool, isLoading } = useLiquidityPool(market)

	const GridStyled = styled(Grid)(({ theme }) => ({
		borderBottom: `1px solid ${theme.palette.black.dark}`,
		'& > div': {
			padding: '10px 20px',
			[theme.breakpoints.up('md')]: {
				padding: '20px 40px',
			},
			'& > div:first-of-type': {
				marginBottom: '5px',
			},
		},
		[theme.breakpoints.up('md')]: {
			'& > div + div': {
				borderLeft: `1px solid ${theme.palette.black.dark}`,
			},
		},
	}))

	if (isLoading) {
		return null
	}

	let manager, managementFee

	if (!liquidityPool) {
		manager = market.manager.id
		managementFee = market.managementFee
	} else {
		manager = liquidityPool.creator
		managementFee = (market.managementFee * liquidityPool.creatorFee) / DIVISOR
	}

	return (
		<GridStyled container spacing={0}>
			<Grid item xs={6} md={3}>
				<MarketPrizeInfo liquidityPool={liquidityPool!} market={market} />
			</Grid>
			<Grid item xs={6} md={3}>
				<Typography variant='p3' component='div'>
					<Trans id='Prize Distribution' />
				</Typography>
				<div>
					{market.prizes.map((value, index) => {
						return (
							<div style={{ display: 'flex', alignItems: 'center' }} key={index}>
								<MedalIcon style={{ margin: '0 10px 10px 0', fill: getMedalColor(index + 1) }} />
								<Typography variant='h6s' component='h6' key={index}>
									{(Number(value) * 100) / DIVISOR}%
								</Typography>
							</div>
						)
					})}
				</div>
			</Grid>
			<Grid item xs={6} md={3}>
				<Typography variant='p3' component='div'>
					<Trans id='Fee' />
				</Typography>
				<Typography variant='h6s' component='h6'>
					{((managementFee + market.protocolFee) * 100) / DIVISOR}%
				</Typography>
				<div style={{ fontSize: '11.11px' }}>
					{(market.protocolFee * 100) / DIVISOR}% protocol + {(managementFee * 100) / DIVISOR}% manager
				</div>
				{liquidityPool && (
					<>
						<Typography variant='p3' component='div' sx={{ mt: 2 }}>
							<Trans id='Total Liquidity' />
						</Typography>
						<Typography variant='h6s' component='h6'>
							<a href={getBlockExplorerUrl(market.manager.id, chain.id)} target='_blank' rel='noreferrer'>
								{formatAmount(liquidityPool.totalDeposits, chain.id)}
							</a>
						</Typography>
					</>
				)}
			</Grid>
			<Grid item xs={6} md={3}>
				<Typography variant='p3' component='div'>
					<Trans id='Manager' />
				</Typography>
				<Typography variant='h6s' component='h6'>
					<a href={getBlockExplorerUrl(manager, chain.id)} target='_blank' rel='noreferrer'>
						{MANAGER_ADDRESS[manager.toLowerCase()] || shortenAddress(manager)}
					</a>
				</Typography>
			</Grid>
		</GridStyled>
	)
}

export default MarketInfo
