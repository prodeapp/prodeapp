import { Trans } from '@lingui/react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { Address } from '@wagmi/core'
import * as React from 'react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAccount, useNetwork } from 'wagmi'

import { BoxRow, BoxWrapper } from '@/components'
import { Bets } from '@/components/ProfileView/Bets'
import { Markets } from '@/components/ProfileView/Markets'
import ProfileForm from '@/components/ProfileView/ProfileForm'
import { Referrals } from '@/components/ProfileView/Referrals'
import { usePlayer } from '@/hooks/usePlayer'
import { usePlayerStats } from '@/hooks/usePlayerStats'
import { filterChainId } from '@/lib/config'
import { formatAmount } from '@/lib/helpers'

export default function Profile() {
	const { id } = useParams()
	const { address } = useAccount()
	const { chain } = useNetwork()
	const chainId = filterChainId(chain?.id)
	const [section, setSection] = useState<'bets' | 'referrals' | 'markets'>('bets')
	const playerId = (id || address || '') as Address
	const { data: playerStats } = usePlayerStats(playerId)
	const { data: player } = usePlayer(playerId)

	if (!id) {
		if (!address) {
			return (
				<Alert severity='error'>
					<Trans id='Connect your wallet to view your profile.' />
				</Alert>
			)
		}
	}

	return (
		<Container>
			<Grid container columnSpacing={2} rowSpacing={1} sx={{ marginTop: '30px', justifyContent: 'space-between' }}>
				<Grid item sm={12} md={4} sx={{ alignItems: 'center', justifyContent: 'center' }}>
					<BoxWrapper sx={{ padding: 2 }}>
						<Typography variant='h5'>
							<Trans
								id='Total Bet: {0}'
								values={{
									0: playerStats ? formatAmount(playerStats?.amountBet, chainId) : <Skeleton />,
								}}
							/>
						</Typography>
					</BoxWrapper>
				</Grid>
				<Grid item sm={12} md={4} sx={{ alignItems: 'center', justifyContent: 'center' }}>
					<BoxWrapper sx={{ padding: 2 }}>
						<Typography variant='h5'>
							<Trans
								id='Total Rewards: {0}'
								values={{
									0: playerStats ? formatAmount(playerStats?.pricesReceived, chainId) : <Skeleton />,
								}}
							/>
						</Typography>
					</BoxWrapper>
				</Grid>
				<Grid item sm={12} md={4} sx={{ alignItems: 'center', justifyContent: 'center' }}>
					<BoxWrapper sx={{ padding: 2 }}>
						<Typography variant='h5'>
							<Trans
								id='Referrals Earnings: {0}'
								values={{
									0: playerStats ? formatAmount(playerStats?.totalAttributions, chainId) : <Skeleton />,
								}}
							/>
						</Typography>
					</BoxWrapper>
				</Grid>
			</Grid>

			{player && address && player.id.toLowerCase() === address.toLowerCase() && (
				<ProfileForm defaultName={player.name} />
			)}

			<BoxWrapper>
				<BoxRow style={{ justifyContent: 'center' }}>
					<div>
						<Button onClick={() => setSection('bets')} color={section === 'bets' ? 'secondary' : 'primary'}>
							<Trans id='Bets' />
						</Button>
					</div>
					<div>
						<Button onClick={() => setSection('referrals')} color={section === 'referrals' ? 'secondary' : 'primary'}>
							<Trans id='Referrals' />
						</Button>
					</div>
					<div>
						<Button onClick={() => setSection('markets')} color={section === 'markets' ? 'secondary' : 'primary'}>
							<Trans id='Markets' />
						</Button>
					</div>
				</BoxRow>
			</BoxWrapper>

			{section === 'bets' && <Bets playerId={playerId} chainId={chainId} />}

			{section === 'referrals' && <Referrals provider={playerId} chainId={chainId} />}

			{section === 'markets' && <Markets creatorId={playerId} chainId={chainId} />}
		</Container>
	)
}
