import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/macro'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { Address } from '@wagmi/core'
import React from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'

import BetDetails from '@/components/Bet/BetDetails'
import { useBet } from '@/hooks/useBet'
import { useBetToken } from '@/hooks/useBetToken'
import { filterChainId } from '@/lib/config'
import { paths } from '@/lib/paths'

function TokenView() {
	const params = useParams()
	const id = params.id as Address
	const tokenId = Number(params.tokenId)
	const chainId = filterChainId(Number(params?.chainId || ''))

	const { isLoading, data: bet } = useBet(id, tokenId)

	const { data: image = '' } = useBetToken(id, BigNumber.from(tokenId), chainId)

	if (isLoading) {
		return (
			<div>
				<Trans>Loading...</Trans>
			</div>
		)
	}

	if (!bet) {
		return <Trans>Bet not found</Trans>
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
							<Trans>Go to market</Trans>
						</Button>
					</div>

					<BetDetails bet={bet} chainId={chainId} />
				</Grid>
			</Grid>
		</>
	)
}

export default TokenView
