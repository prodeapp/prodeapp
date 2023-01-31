import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/react'
import { Button } from '@mui/material'
import Grid from '@mui/material/Grid'
import React from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'

import BetDetails from '@/components/Bet/BetDetails'
import { useBet } from '@/hooks/useBet'
import { useBetToken } from '@/hooks/useBetToken'

function TokenView() {
	const { id, tokenId } = useParams()
	const { isLoading, data: bet } = useBet(String(id), String(tokenId))

	const { data: image = '' } = useBetToken(String(id), BigNumber.from(tokenId))

	if (isLoading) {
		return (
			<div>
				<Trans id='Loading...' />
			</div>
		)
	}

	if (!bet) {
		return <Trans id='Bet not found' />
	}

	return (
		<>
			<Grid container spacing={2}>
				<Grid item xs={12} md={12}>
					{image && (
						<div style={{ textAlign: 'center' }}>
							<img src={image} style={{ margin: '20px 0' }} alt='Bet NFT' />
						</div>
					)}

					<div style={{ textAlign: 'center', margin: '20px 0' }}>
						<Button component={RouterLink} to={`/markets/${id}`}>
							<Trans id='Go to market' />
						</Button>
					</div>

					<BetDetails bet={bet} />
				</Grid>
			</Grid>
		</>
	)
}

export default TokenView
