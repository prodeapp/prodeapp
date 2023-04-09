import { isAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { AddressZero } from '@ethersproject/constants'
import { ErrorMessage } from '@hookform/error-message'
import { t } from '@lingui/macro'
import { Trans } from '@lingui/macro'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import React, { useEffect } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { erc20ABI, useAccount, useNetwork } from 'wagmi'

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
import { CROSS_CHAIN_TOKEN_ID, usePlaceBet, UsePlaceBetReturn } from '@/hooks/usePlaceBet'
import { useSendTx } from '@/hooks/useSendTx'
import { DEFAULT_CHAIN } from '@/lib/config'
import { getReferralKey } from '@/lib/helpers'
import { queryClient } from '@/lib/react-query'

import { BetOutcomeSelect } from './BetOutcomeSelect'

export type BetFormOutcomeValue = FormEventOutcomeValue | FormEventOutcomeValue[] | ''

export type BetFormValues = {
	outcomes: { value: BetFormOutcomeValue; questionId: string }[]
}

type BetFormProps = {
	market: Market
	chainId: number
	cancelHandler: () => void
}

function BetNFT({ marketId, tokenId, chainId }: { marketId: string; tokenId: BigNumber; chainId: number }) {
	const { data: image = '' } = useBetToken(marketId, tokenId, chainId)

	if (!image) {
		return null
	}

	return (
		<div style={{ textAlign: 'center', margin: '10px 0' }}>
			<div>
				<p>
					<Trans>Your betting position is represented by the following NFT.</Trans>
				</p>
			</div>
			<img src={image} style={{ margin: '20px 0' }} alt='Bet NFT' />
			<div>
				<p>
					<Trans>
						You can transfer or sell it in a marketplace, but remember that the owner of this NFT may claim a prize if
						this bet wins.
					</Trans>
				</p>
			</div>
		</div>
	)
}

function getApproveTxParams(approve: UsePlaceBetReturn['approve']) {
	if (!approve) {
		return {}
	}

	return {
		address: approve.token,
		abi: erc20ABI,
		functionName: 'approve',
		args: [approve.spender, approve.amount],
		onTxSuccess: () => {
			queryClient.invalidateQueries(['useTokenAllowance'])
		},
	}
}

export default function BetForm({ market, chainId, cancelHandler }: BetFormProps) {
	const { address } = useAccount()
	const { chain } = useNetwork()
	const { isLoading: isLoadingEvents, error: eventsError, data: events } = useEvents(market.id, chainId)

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
		events && events.forEach((event) => append({ value: '', questionId: event.id }))
	}, [events, append, remove])

	const referral = window.localStorage.getItem(getReferralKey(market.id)) || ''
	const attribution = isAddress(referral) ? referral : AddressZero

	const { isLoading, error, placeBet, tokenId, hasVoucher, isCrossChainBet, approve } = usePlaceBet(
		market.id,
		// chainId can be gnosis and chain.id arbitrum, here we need to use the chain the user is connected to
		chain?.id || DEFAULT_CHAIN,
		market.price,
		attribution,
		outcomes
	)

	const {
		isLoading: isLoadingApprove,
		error: approveError,
		write: approveTokens,
	} = useSendTx(
		// @ts-ignore
		getApproveTxParams(approve)
	)

	useEffect(() => {
		if (tokenId !== false) {
			queryClient.invalidateQueries(['useMarket', market.id])
			queryClient.invalidateQueries(['useBets', { marketId: market.id }])
		}
	}, [tokenId, market.id])

	useEffect(() => {
		window.scrollTo(0, 0)
	}, [])

	const itemJson = useCurateItemJson(market.hash)
	const matchesInterdependencies = useMatchesInterdependencies(events, itemJson)

	if (isLoading || isLoadingApprove || isLoadingEvents) {
		return (
			<div style={{ textAlign: 'center', marginBottom: 15 }}>
				<CircularProgress />
			</div>
		)
	}

	if (tokenId !== false) {
		if (tokenId === CROSS_CHAIN_TOKEN_ID) {
			return (
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
									<Trans>Congratulations!</Trans>
								</AlertTitle>
							</div>
							<div>
								<Trans>Your bet is travelling to the destination chain, it will arrive in a few minutes!</Trans>
							</div>
						</div>
					</Box>
				</BigAlert>
			)
		}

		return (
			<>
				<Alert severity='success' sx={{ mb: 3 }}>
					<Trans>Bet placed!</Trans>
				</Alert>

				<BetNFT marketId={market.id} tokenId={tokenId} chainId={chainId} />
			</>
		)
	}

	if (!address) {
		return (
			<Alert severity='error'>
				<Trans>Connect your wallet to place a bet.</Trans>
			</Alert>
		)
	}

	if (!chain || chain.unsupported) {
		return (
			<Alert severity='error'>
				<Trans>UNSUPPORTED_CHAIN</Trans>
			</Alert>
		)
	}

	if (eventsError) {
		return (
			<Alert severity='error'>
				<Trans>Error loading events</Trans>.
			</Alert>
		)
	}

	const onSubmit = async (_: BetFormValues) => {
		placeBet!()
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<h2 style={{ margin: '35px 0', fontSize: '33.18px' }}>
				<Trans>Place your bet</Trans>
			</h2>
			<h4
				style={{
					margin: '35px 0',
					borderBottom: '1px solid #303030',
					paddingBottom: '20px',
				}}
			>
				<Trans>
					Answer all questions. You will get 1 point for each correct prediction. The top ranked bets win the market’s
					prize!
				</Trans>
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
									<Trans>Congratulations!</Trans>
								</AlertTitle>
							</div>
							<div>
								<Trans>You have a voucher available to place a bet for free!</Trans>
							</div>
						</div>
					</Box>
				</BigAlert>
			)}

			{isCrossChainBet && (
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
								<AlertTitle sx={{ '&.MuiAlertTitle-root': { fontSize: 21 } }}>
									<Trans>This market was created in Gnosis Chain.</Trans>
								</AlertTitle>
							</div>
							<div>
								<Trans
									id='You can bet from {chain} with USDC. We will take care of bridging the funds for you.'
									values={{ chain: chain.name }}
								/>
							</div>
						</div>
					</Box>
				</BigAlert>
			)}

			{(error || approveError) && (
				<Alert severity='error' sx={{ mb: 2 }}>
					{error?.message || approveError?.message}
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
										required: t`This field is required`,
									})}
								/>
							</Grid>
						</React.Fragment>
					)
				})}
				<Grid item xs={6}>
					<Button type='button' color='primary' size='large' variant='outlined' fullWidth onClick={cancelHandler}>
						<Trans>Cancel</Trans> <CrossIcon style={{ marginLeft: 10 }} width={10} height={10} />
					</Button>
				</Grid>
				<Grid item xs={6}>
					{approve && approveTokens && (
						<Button type='button' color='primary' size='large' fullWidth onClick={() => approveTokens()}>
							<Trans>Approve USDC</Trans>{' '}
							<TriangleIcon style={{ marginLeft: 10, fill: 'currentColor', color: 'white' }} />
						</Button>
					)}
					{!approve && (
						<Button type='submit' disabled={!placeBet} color='primary' size='large' fullWidth>
							<Trans>Place Bet</Trans> <TriangleIcon style={{ marginLeft: 10, fill: 'currentColor', color: 'white' }} />
						</Button>
					)}
				</Grid>
			</Grid>
		</form>
	)
}
