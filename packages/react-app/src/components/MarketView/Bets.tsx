import { t } from '@lingui/macro'
import { Trans } from '@lingui/macro'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { Address } from '@wagmi/core'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'

import { ReactComponent as EyeIcon } from '@/assets/icons/eye.svg'
import { ReactComponent as MedalIcon } from '@/assets/icons/medal.svg'
import { TableBody, TableHeader } from '@/components'
import BetDetails from '@/components/Bet/BetDetails'
import AppDialog from '@/components/Dialog'
import { Bet } from '@/graphql/subgraph'
import { useBets } from '@/hooks/useBets'
import { useIndexedMarketWinners } from '@/hooks/useMarketWinners'
import { formatPlayerName, getMedalColor } from '@/lib/helpers'

export default function Bets({
	marketId,
	onlyMyBets,
	chainId,
}: {
	marketId: Address
	onlyMyBets?: boolean
	chainId: number
}) {
	const { address } = useAccount()
	const { isLoading, error, data: bets } = useBets({ marketId, chainId })
	const marketWinners = useIndexedMarketWinners(marketId, chainId)
	const [openModal, setOpenModal] = useState(false)
	const [bet, setBet] = useState<Bet | undefined>()

	const handleOpen = (bet: Bet) => {
		setBet(bet)
		setOpenModal(true)
	}

	const handleClose = () => {
		setOpenModal(false)
	}

	if (isLoading) {
		return <Skeleton animation='wave' height={150} />
	}

	if (error) {
		return <Alert severity='error'>{error.message}</Alert>
	}

	return (
		<>
			{bet && (
				<AppDialog open={openModal} handleClose={handleClose} title={t`Details`}>
					<BetDetails bet={bet} chainId={chainId} />
				</AppDialog>
			)}
			<div>
				<TableHeader>
					<div style={{ width: '10%' }}>#</div>
					<div style={{ width: '40%' }}>
						<Trans>Player</Trans>
					</div>
					<Box sx={{ width: '40%', textAlign: { xs: 'center', sm: 'left' } }}>
						<Trans>Points</Trans>
					</Box>
					<div style={{ width: '180px' }}>
						<Trans>Details</Trans>
					</div>
				</TableHeader>
				{bets && bets.length === 0 && (
					<Alert severity='info'>
						<Trans>No bets found.</Trans>
					</Alert>
				)}
				{bets &&
					bets.length > 0 &&
					bets.map((rank, i) => {
						if (onlyMyBets && address && rank.player.id.toLowerCase() !== address.toLowerCase()) {
							return null
						}

						return (
							<TableBody key={i}>
								<div style={{ width: '10%', display: 'flex' }}>
									<div>{i + 1}</div>
									{marketWinners[rank.tokenID] &&
										marketWinners[rank.tokenID].prizes.map((prize, i) => (
											<MedalIcon
												style={{
													marginLeft: '10px',
													fill: getMedalColor(prize),
												}}
												key={i}
											/>
										))}
								</div>
								<div style={{ width: '40%' }}>
									<Link to={`/profile/${rank.player.id}`}>
										{address && rank.player.id.toLowerCase() === address.toLowerCase()
											? t`You`
											: formatPlayerName(rank.player.name, rank.player.id)}
									</Link>
								</div>
								<Box
									sx={{
										width: '40%',
										textAlign: { xs: 'center', sm: 'left' },
										fontWeight: 'bold',
									}}
								>
									{rank.points.toString()}
								</Box>
								<div style={{ width: '180px' }}>
									<span className='js-link' onClick={() => handleOpen(rank)}>
										<EyeIcon /> <Trans>See details</Trans>
									</span>
								</div>
							</TableBody>
						)
					})}
			</div>
		</>
	)
}
