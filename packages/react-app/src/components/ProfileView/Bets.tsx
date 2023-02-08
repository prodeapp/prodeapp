import { Trans } from '@lingui/react'
import { ExpandMoreOutlined } from '@mui/icons-material'
import { Accordion, AccordionDetails, AccordionSummary, Alert, Button, Skeleton } from '@mui/material'
import Link from '@mui/material/Link'
import { Address } from '@wagmi/core'
import React from 'react'
import { Link as RouterLink } from 'react-router-dom'

import BetDetails from '@/components/Bet/BetDetails'
import { useBets, useBetsRewards, useIndexedBetsRewards } from '@/hooks/useBets'
import { formatAmount } from '@/lib/helpers'

export function Bets({ playerId }: { playerId: Address }) {
	const { data: bets, error, isLoading } = useBets({ playerId })
	const { data: betsRewards } = useBetsRewards(bets || [])
	const indexedBetsRewards = useIndexedBetsRewards(betsRewards)

	if (error) {
		return <Alert severity='error'>{error}</Alert>
	}

	if (isLoading) {
		return <Skeleton animation='wave' height={150} />
	}

	if (!bets || bets.length === 0) {
		return (
			<Alert severity='error'>
				<Trans id='No bets found.' />
			</Alert>
		)
	}

	return (
		<div>
			{bets.map(bet => {
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
										<Trans id='Points' />: {bet.points}
									</div>
									<div>
										<Trans id='Reward' />: {formatAmount(indexedBetsRewards?.[bet.id.toLowerCase()]?.reward || 0)}
									</div>
								</div>
							</div>
						</AccordionSummary>
						<AccordionDetails>
							<div style={{ marginBottom: '20px' }}>
								<Button component={RouterLink} to={`/markets/${bet.market.id}`}>
									<Trans id='Go to market' />
								</Button>
								<Button
									component={Link}
									href={`https://epor.io/tokens/${bet.market.id}/${bet.tokenID}?network=xDai`}
									target='_blank'
									rel='noopener'
								>
									<Trans id='Trade NFT in Eporio' />
								</Button>
							</div>

							<BetDetails bet={bet} />
						</AccordionDetails>
					</Accordion>
				)
			})}
		</div>
	)
}
