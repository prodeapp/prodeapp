import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import { ExpandMoreOutlined } from '@mui/icons-material'
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Button,
	CircularProgress,
	Grid,
	Skeleton,
	Typography,
	useTheme,
} from '@mui/material'
import Alert from '@mui/material/Alert'
import { Address } from '@wagmi/core'
import React from 'react'
import { useNetwork } from 'wagmi'

import { ManagerAbi } from '@/abi/Manager'
import { MarketReferral } from '@/graphql/subgraph'
import { useMarketReferrals } from '@/hooks/useMarketReferrals'
import { useSendRecklessTx } from '@/hooks/useSendTx'
import { DEFAULT_CHAIN } from '@/lib/config'
import { formatAmount, shortenAddress } from '@/lib/helpers'

import { BoxRow } from '..'

function ClaimAction({ marketReferral }: { marketReferral: MarketReferral }) {
	const theme = useTheme()

	const { isLoading, isSuccess, isError, write } = useSendRecklessTx({
		address: marketReferral.manager,
		abi: ManagerAbi,
		functionName: 'claimReferralReward',
	})

	const handleClaimOnClick = async (manager: Address) => {
		write!({ recklesslySetUnpreparedArgs: [manager] })
	}

	if (marketReferral.claimed || isSuccess) {
		return <>{i18n._('Already Claimed') + '!'}</>
	}

	if (marketReferral.market.resultSubmissionPeriodStart === '0') {
		return (
			<div>
				<Trans id='Waiting for prize distribution' />
			</div>
		)
	}

	if (isLoading) {
		return <CircularProgress />
	}

	return (
		<div style={{ display: 'flex' }}>
			<Button onClick={() => handleClaimOnClick(marketReferral.manager)}>
				<Trans id='Claim' />
			</Button>
			{isError ? (
				<Typography sx={{ color: theme.palette.error.main, marginLeft: '10px' }}>
					<Trans id='Error' />
				</Typography>
			) : null}
		</div>
	)
}

function ReferralDetail({ marketReferral }: { marketReferral: MarketReferral }) {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()
	return (
		<Accordion>
			<AccordionSummary expandIcon={<ExpandMoreOutlined />} aria-controls='panel1a-content'>
				<div style={{ width: '60%' }}>
					<a href={'/#/marketsReferrals/' + marketReferral.market.id}>{marketReferral.market.name}</a>
				</div>
				<div style={{ width: '15%' }}>{formatAmount(marketReferral.totalAmount, chain.id)}</div>
				<div style={{ width: '25%' }}>
					<ClaimAction marketReferral={marketReferral} />
				</div>
			</AccordionSummary>
			<AccordionDetails>
				{marketReferral.attributions.map(attribution => {
					return (
						<BoxRow key={attribution.id}>
							<div style={{ width: '80%' }}>{shortenAddress(attribution.attributor.id)}</div>
							<div style={{ width: '20%' }}>{formatAmount(attribution.amount, chain.id)}</div>
						</BoxRow>
					)
				})}
			</AccordionDetails>
		</Accordion>
	)
}

export function Referrals({ provider }: { provider: string }) {
	const { data: marketsReferrals, error, isLoading } = useMarketReferrals({
		provider,
	})

	if (error) {
		return <Alert severity='error'>{error.message}</Alert>
	}

	if (isLoading) {
		return <Skeleton animation='wave' height={150} />
	}

	if (!marketsReferrals || marketsReferrals.length === 0) {
		return (
			<Alert severity='info'>
				<Trans id='Start referring into markets and earn part of the fees that your referred pays.' />
			</Alert>
		)
	}
	return (
		<Grid container columnSpacing={2} rowSpacing={1} sx={{ marginTop: '30px', marginBottom: '30px' }}>
			<Grid item sm={12} md={12}>
				<BoxRow key='header'>
					<div style={{ width: '60%' }}>
						<Trans id='Market' />
					</div>
					<div style={{ width: '15%' }}>
						<Trans id='Earn' />
					</div>
					<div style={{ width: '20%' }}>
						<Trans id='Claim' />
					</div>
					<div style={{ width: '5%' }}></div>
				</BoxRow>

				{marketsReferrals &&
					marketsReferrals.map(mr => {
						return <ReferralDetail marketReferral={mr} key={mr.id} />
					})}
			</Grid>
		</Grid>
	)
}
