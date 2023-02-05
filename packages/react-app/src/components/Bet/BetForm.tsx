import { isAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { AddressZero } from '@ethersproject/constants'
import { ErrorMessage } from '@hookform/error-message'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import { FormControl } from '@mui/material'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import { getAccount } from '@wagmi/core'
import React, { useEffect } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useNetwork } from 'wagmi'

import { ReactComponent as CrossIcon } from '@/assets/icons/cross.svg'
import { ReactComponent as TriangleIcon } from '@/assets/icons/triangle-right.svg'
import { BigAlert, FormError } from '@/components'
import { FormEventOutcomeValue } from '@/components/Answer/AnswerForm'
import { FormatEvent } from '@/components/FormatEvent'
import { Market } from '@/graphql/subgraph'
import { useBetToken } from '@/hooks/useBetToken'
import { useCurateItemJson } from '@/hooks/useCurateItems'
import { useEvents } from '@/hooks/useEvents'
import { useMatchesInterdependencies } from '@/hooks/useMatchesInterdependencies'
import { usePlaceBet } from '@/hooks/usePlaceBet'
import { getReferralKey } from '@/lib/helpers'
import { queryClient } from '@/lib/react-query'

import { BetOutcomeSelect } from './BetOutcomeSelect'

export type BetFormOutcomeValue = FormEventOutcomeValue | FormEventOutcomeValue[] | ''

export type BetFormValues = {
	outcomes: { value: BetFormOutcomeValue; questionId: string }[]
}

type BetFormProps = {
	market: Market
	cancelHandler: () => void
}

function BetNFT({ marketId, tokenId }: { marketId: string; tokenId: BigNumber }) {
	const { data: image = '' } = useBetToken(marketId, tokenId)

	if (!image) {
		return null
	}

	return (
		<div style={{ textAlign: 'center', margin: '10px 0' }}>
			<div>
				<p>
					<Trans id='Your betting position is represented by the following NFT.' />
				</p>
			</div>
			<img src={image} style={{ margin: '20px 0' }} alt='Bet NFT' />
			<div>
				<p>
					<Trans id='You can transfer or sell it in a marketplace, but remember that the owner of this NFT may claim a prize if this bet wins.' />
				</p>
			</div>
			<div>
				<Button
					component={Link}
					size='large'
					href={`https://epor.io/tokens/${marketId}/${tokenId}?network=xDai`}
					target='_blank'
					rel='noopener'
				>
					<Trans id='Trade NFT in Eporio' />
				</Button>
			</div>
		</div>
	)
}

export default function BetForm({ market, cancelHandler }: BetFormProps) {
	const { address } = getAccount()
	const { chain } = useNetwork()
	const { isLoading: isLoadingEvents, error: eventsError, data: events } = useEvents(market.id)

	const {
		register,
		control,
		formState: { errors },
		handleSubmit,
		setValue,
	} = useForm<BetFormValues>({
		mode: 'all',
		defaultValues: {
			outcomes: [],
		},
	})

	const outcomes = useWatch({ control, name: 'outcomes' })

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'outcomes',
	})

	useEffect(() => {
		remove()
		events && events.forEach(event => append({ value: '', questionId: event.id }))
	}, [events, append, remove])

	const referral = window.localStorage.getItem(getReferralKey(market.id)) || ''
	const attribution = isAddress(referral) ? referral : AddressZero

	const { isLoading, error, placeBet, tokenId, hasVoucher } = usePlaceBet(
		market.id,
		market.price,
		attribution,
		outcomes
	)

	useEffect(() => {
		if (tokenId !== false) {
			queryClient.invalidateQueries(['useMarket', market.id])
			queryClient.invalidateQueries(['useBets', market.id])
		}
	}, [tokenId, market.id])

	useEffect(() => {
		window.scrollTo(0, 0)
	}, [])

	const itemJson = useCurateItemJson(market.hash)
	const matchesInterdependencies = useMatchesInterdependencies(events, itemJson)

	if (isLoadingEvents) {
		return (
			<div>
				<Trans id='Loading...' />
			</div>
		)
	}

	if (tokenId !== false) {
		return (
			<>
				<Alert severity='success' sx={{ mb: 3 }}>
					<Trans id='Bet placed!' />
				</Alert>

				<BetNFT marketId={market.id} tokenId={tokenId} />
			</>
		)
	}

	if (!address) {
		return (
			<Alert severity='error'>
				<Trans id='Connect your wallet to place a bet.' />
			</Alert>
		)
	}

	if (!chain || chain.unsupported) {
		return (
			<Alert severity='error'>
				<Trans id='UNSUPPORTED_CHAIN' />
			</Alert>
		)
	}

	if (eventsError) {
		return (
			<Alert severity='error'>
				<Trans id='Error loading events' />.
			</Alert>
		)
	}

	if (isLoading) {
		return (
			<div style={{ textAlign: 'center', marginBottom: 15 }}>
				<CircularProgress />
			</div>
		)
	}

	const onSubmit = async (_: BetFormValues) => {
		placeBet!()
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<h2 style={{ margin: '35px 0', fontSize: '33.18px' }}>
				<Trans id='Place your bet' />
			</h2>
			<h4
				style={{
					margin: '35px 0',
					borderBottom: '1px solid #303030',
					paddingBottom: '20px',
				}}
			>
				<Trans id='Answer all questions. You will get 1 point for each correct prediction. The top ranked bets win the market’s prize!' />
			</h4>

			{hasVoucher && (
				<BigAlert severity='info' sx={{ mb: 4 }}>
					<Box
						sx={{
							display: { md: 'flex' },
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<div>
							<div>
								<AlertTitle>
									<Trans id='Congratulations!' />
								</AlertTitle>
							</div>
							<div>
								<Trans id='You have a voucher available to place a bet for free!' />
							</div>
						</div>
					</Box>
				</BigAlert>
			)}

			{error && (
				<Alert severity='error' sx={{ mb: 2 }}>
					{error.message}
				</Alert>
			)}
			<Grid container spacing={3}>
				{fields.map((field, i) => {
					if (!events || !events[i]) {
						return null
					}
					return (
						<React.Fragment key={events[i].id}>
							<Grid item xs={12} md={6}>
								<FormatEvent title={events[i].title} />
							</Grid>
							<Grid item xs={12} md={6}>
								<FormControl fullWidth>
									<BetOutcomeSelect
										key={events[i].id}
										matchesInterdependencies={matchesInterdependencies}
										events={events}
										i={i}
										outcomes={outcomes}
										control={control}
										errors={errors}
										setValue={setValue}
									/>
									<FormError>
										<ErrorMessage errors={errors} name={`outcomes.${i}.value`} />
									</FormError>
								</FormControl>
								<input
									type='hidden'
									{...register(`outcomes.${i}.questionId`, {
										required: i18n._('This field is required'),
									})}
								/>
							</Grid>
						</React.Fragment>
					)
				})}
				<Grid item xs={6}>
					<Button type='button' color='primary' size='large' variant='outlined' fullWidth onClick={cancelHandler}>
						<Trans id='Cancel' /> <CrossIcon style={{ marginLeft: 10 }} width={10} height={10} />
					</Button>
				</Grid>
				<Grid item xs={6}>
					<Button type='submit' disabled={!placeBet} color='primary' size='large' fullWidth>
						<Trans id='Place Bet' /> <TriangleIcon style={{ marginLeft: 10, fill: 'currentColor', color: 'white' }} />
					</Button>
				</Grid>
			</Grid>
		</form>
	)
}
