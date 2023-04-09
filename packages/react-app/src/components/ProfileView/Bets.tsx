import { Trans } from '@lingui/macro'
import ExpandMoreOutlined from '@mui/icons-material/ExpandMoreOutlined'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import { Address } from '@wagmi/core'
import React from 'react'
import { Link as RouterLink } from 'react-router-dom'

import BetDetails from '@/components/Bet/BetDetails'
import { useBets, useBetsRewards, useIndexedBetsRewards } from '@/hooks/useBets'
import { formatAmount } from '@/lib/helpers'
import { paths } from '@/lib/paths'

export function Bets({ playerId, chainId }: { playerId: Address; chainId: number }) {
	const { data: bets, error, isLoading } = useBets({ playerId, chainId })
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
			<Alert severity='error'>
				<Trans>No bets found.</Trans>
			</Alert>
		)
	}

	return (
		<div>
			{bets.map((bet) => {
				return (
					<Accordion id={bet.id} key={bet.id} sx={{ mt: 4 }}>
						<AccordionSummary expandIcon={<ExpandMoreOutlined />} sx={{ alignContent: 'center' }}>
							<div style={{ width: '100%' }}>
								<div
									style={{
										width: '100%',
										fontSize: '20px',
										marginBottom: '10px',
										fontWeight: '600',
									}}
								>
									{bet.market.name}
								</div>
								<div style={{ width: '100%', display: 'flex' }}>
									<div style={{ marginRight: '50px' }}>
										<Trans>Points</Trans>: {bet.points}
									</div>
									<div>
										<Trans>Reward</Trans>:{' '}
										{formatAmount(indexedBetsRewards?.[bet.id.toLowerCase()]?.reward || 0, chainId)}
									</div>
								</div>
							</div>
						</AccordionSummary>
						<AccordionDetails>
							<div style={{ marginBottom: '20px' }}>
								<Button component={RouterLink} to={paths.market(bet.market.id, chainId)}>
									<Trans>Go to market</Trans>
								</Button>
							</div>

							<BetDetails bet={bet} chainId={chainId} />
						</AccordionDetails>
					</Accordion>
				)
			})}
		</div>
	)
}
