import { Trans } from '@lingui/macro'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { useTheme } from '@mui/material'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { Address } from '@wagmi/core'
import React from 'react'
import { Link as RouterLink } from 'react-router-dom'

import { useBets, useBetsRewards, useIndexedBetsRewards } from '@/hooks/useBets'
import { useMarketsIdsByStatus } from '@/hooks/useMarkets'
import { formatAmount } from '@/lib/helpers'
import { paths } from '@/lib/paths'

export function TabActiveBets({ playerId, chainId }: { playerId: Address; chainId: number }) {
	const { data: activeMarkets } = useMarketsIdsByStatus(chainId, 'not_closed')

	return <TabBets playerId={playerId} chainId={chainId} marketIds={activeMarkets} />
}

export function TabWinningBets({ playerId, chainId }: { playerId: Address; chainId: number }) {
	return <TabBets playerId={playerId} chainId={chainId} winning={true} />
}

function TabBets({
	playerId,
	chainId,
	marketIds,
	winning,
}: {
	playerId: Address
	chainId: number
	marketIds?: Address[]
	winning?: boolean
}) {
	const theme = useTheme()

	const { data: bets, error, isLoading } = useBets({ playerId, chainId, marketIds, winning })
	const { data: betsRewards } = useBetsRewards(bets || [], chainId)
	const indexedBetsRewards = useIndexedBetsRewards(betsRewards)

	if (error) {
		return <Alert severity='error'>{error.message}</Alert>
	}

	if (isLoading) {
		return <Skeleton animation='wave' height={150} />
	}

	if (!bets || bets.length === 0) {
		return (
			<Alert severity='info'>
				<Trans>
					No bets found. Go to <RouterLink to='/'>markets</RouterLink> and start betting
				</Trans>
			</Alert>
		)
	}

	return (
		<div>
			{bets.map((bet) => {
				return (
					<Box
						key={bet.id}
						sx={{ mb: '5px', borderBottom: `1px solid ${theme.palette.secondary.dark}`, p: 1, borderRadius: 1 }}
					>
						<div
							style={{
								width: '100%',
								fontSize: '16px',
								fontWeight: '600',
							}}
						>
							<Trans id={bet.market.name} />
						</div>
						<div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
							<div>
								<Trans>Points</Trans>: {bet.points}
							</div>
							<div>
								<Trans>Reward</Trans>: {formatAmount(indexedBetsRewards?.[bet.id.toLowerCase()]?.reward || 0, chainId)}
							</div>
							<div>
								<RouterLink to={paths.market(bet.market.id, chainId)} style={{ display: 'flex' }}>
									<Trans>Go to market</Trans> <NavigateNextIcon />
								</RouterLink>
							</div>
						</div>
					</Box>
				)
			})}
		</div>
	)
}
