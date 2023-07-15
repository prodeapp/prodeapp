import { Trans } from '@lingui/macro'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import React from 'react'

import { useMarkets } from '@/hooks/useMarkets'
import { formatAmount, shortenAddress } from '@/lib/helpers'
import { paths } from '@/lib/paths'

import { BoxRow } from '..'

export function Markets({ creatorId, chainId }: { creatorId: string; chainId: number }) {
	const {
		data: markets,
		error,
		isLoading,
	} = useMarkets(chainId, {
		creatorId: creatorId,
	})

	if (error) {
		return <Alert severity='error'>{error.message}</Alert>
	}

	if (isLoading) {
		return <Skeleton animation='wave' height={150} />
	}

	if (!markets || markets.length === 0) {
		return (
			<Alert severity='info'>
				<Trans>Create a market and earn fees on each bet.</Trans>
			</Alert>
		)
	}

	return (
		<Grid container columnSpacing={2} rowSpacing={1} sx={{ marginTop: '30px' }}>
			<Grid item sm={12} md={12}>
				<BoxRow>
					<div style={{ width: '40%' }}>
						<Trans>Market</Trans>
					</div>
					<div style={{ width: '20%' }}>
						<Trans>Pool</Trans>
					</div>
					<div style={{ width: '20%' }}>
						<Trans>Rewards receiver</Trans>
					</div>
					<div style={{ width: '20%' }}>
						<Trans>Management Rewards Earned</Trans>
					</div>
				</BoxRow>

				{markets &&
					markets.map((market) => {
						return (
							<BoxRow key={market.id}>
								<div style={{ width: '40%' }}>
									<a href={paths.market(market.id, chainId)}>
										<Trans id={market.name} />
									</a>
								</div>
								<div style={{ width: '20%' }}>{formatAmount(market.pool, chainId)}</div>
								<div style={{ width: '20%' }}>{shortenAddress(market.manager.id)}</div>
								<div style={{ width: '20%' }}>{formatAmount(market.manager.managementRewards, chainId)}</div>
							</BoxRow>
						)
					})}
			</Grid>
		</Grid>
	)
}
