import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/react'
import { Button } from '@mui/material'
import Grid from '@mui/material/Grid'
import { Address } from '@wagmi/core'
import React from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'

import BetDetails from '@/components/Bet/BetDetails'
import { useBet } from '@/hooks/useBet'
import { useBetToken } from '@/hooks/useBetToken'
import { DEFAULT_CHAIN } from '@/lib/config'
import { paths } from '@/lib/paths'

function TokenView() {
	const params = useParams()
	const id = params.id as Address
	const tokenId = Number(params.tokenId)
	const chainId = Number(params?.chainId || '') || DEFAULT_CHAIN

	const { isLoading, data: bet } = useBet(id, tokenId)

	const { data: image = '' } = useBetToken(id, BigNumber.from(tokenId))

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
						<Button component={RouterLink} to={paths.market(String(id), Number(chainId))}>
							<Trans id='Go to market' />
						</Button>
					</div>

					<BetDetails bet={bet} chainId={chainId} />
				</Grid>
			</Grid>
		</>
	)
}

export default TokenView
