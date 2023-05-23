import { isAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { AddressZero } from '@ethersproject/constants'
import { t } from '@lingui/macro'
import { Trans } from '@lingui/macro'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import React, { useEffect } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { Address, erc20ABI, useAccount, useNetwork } from 'wagmi'

import { ReactComponent as CrossIcon } from '@/assets/icons/cross.svg'
import { ReactComponent as TriangleIcon } from '@/assets/icons/triangle-right.svg'
import { BigAlert } from '@/components'
import { FormEventOutcomeValue } from '@/components/Answer/AnswerForm'
import { SimpleBetDetails } from '@/components/Bet/BetDetails'
import { InPageConnectButton } from '@/components/ConnectButton'
import { FormatEvent } from '@/components/FormatEvent'
import { Market } from '@/graphql/subgraph'
import { useBets } from '@/hooks/useBets'
import { useBetToken } from '@/hooks/useBetToken'
import { useCheckMarketWhitelist, WHITELIST_STATUS } from '@/hooks/useCheckMarketWhitelist'
import { useCurateItemJson } from '@/hooks/useCurateItems'
import { useEvents } from '@/hooks/useEvents'
import { useMatchesInterdependencies } from '@/hooks/useMatchesInterdependencies'
import { CROSS_CHAIN_TOKEN_ID, isOldMarket, usePlaceBet, UsePlaceBetReturn } from '@/hooks/usePlaceBet'
import { useSendTx } from '@/hooks/useSendTx'
import { DEFAULT_CHAIN, isMainChain } from '@/lib/config'
import { formatAmount, getReferralKey } from '@/lib/helpers'
import { queryClient } from '@/lib/react-query'

import { BetOutcomeRow } from './BetOutcomeSelect'

export type BetFormOutcome = FormEventOutcomeValue | FormEventOutcomeValue[] | ''

export type MultiOutcomeValues = { values: BetFormOutcome[]; questionId: string }
export type SingleOutcomeValue = { value: BetFormOutcome; questionId: string }

export type BetFormValues = {
	outcomes: MultiOutcomeValues[]
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

function getGeneralError(address: Address | undefined, hasFundsToBet: boolean, hasVoucher: boolean): string {
	if (!address) {
		return t`Connect your wallet to place a bet.`
	}

	if (!hasFundsToBet) {
		return hasVoucher
			? t`You have a free voucher but still need to have some funds to pay the gas fees.`
			: t`You don&apos;t have enough funds to place a bet.`
	}

	return ''
}

function WhitelistBetDetail({ marketId, chainId }: { marketId: Address; chainId: number }) {
	const { address } = useAccount()
	const { data: bets } = useBets({ marketId, chainId })
	const bet = (bets || []).find((b) => b.player.id.toLocaleLowerCase() === address?.toLocaleLowerCase())

	if (!bet) {
		return null
	}

	return (
		<>
			<Alert severity='info'>
				<Trans>You have already placed a bet.</Trans>
			</Alert>
			<SimpleBetDetails bet={bet} chainId={chainId} />
		</>
	)
}

export default function BetForm({ market, chainId, cancelHandler }: BetFormProps) {
	const { address } = useAccount()
	const { chain } = useNetwork()
	const { isLoading: isLoadingEvents, error: eventsError, data: events } = useEvents(market.id, chainId)

	const { data: betWhitelistStatus = '', isLoading: isLoadingCheckWhitelist } = useCheckMarketWhitelist(market, chainId)

	const {
		register,
		control,
		formState: { errors },
		handleSubmit,
		setValue,
		getValues,
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
		events && events.forEach((event) => append({ values: [''], questionId: event.id }))
	}, [events, append, remove])

	const addAlternative = (outcomeIndex: number) => {
		return () => {
			setValue(`outcomes.${outcomeIndex}.values`, [...getValues(`outcomes.${outcomeIndex}.values`), ''])
		}
	}

	const removeAlternative = (outcomeIndex: number, valueIndex: number) => {
		return () => {
			const values = getValues(`outcomes.${outcomeIndex}.values`)
			values.splice(valueIndex, 1)
			setValue(`outcomes.${outcomeIndex}.values`, values)
		}
	}

	const referral = window.localStorage.getItem(getReferralKey(market.id)) || ''
	const attribution = isAddress(referral) ? referral : AddressZero

	const {
		isLoading,
		error,
		hasFundsToBet,
		betPrice,
		betsCount,
		placeBet,
		tokenId,
		hasVoucher,
		isCrossChainBet,
		approve,
	} = usePlaceBet(
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
			queryClient.invalidateQueries(['useHasVoucher'])
		}
	}, [tokenId, market.id])

	useEffect(() => {
		window.scrollTo(0, 0)
	}, [])

	const itemJson = useCurateItemJson(market.hash)
	const matchesInterdependencies = useMatchesInterdependencies(events, itemJson)

	if (isLoading || isLoadingApprove || isLoadingEvents || isLoadingCheckWhitelist) {
		return (
			<div style={{ textAlign: 'center', marginBottom: 15 }}>
				<CircularProgress />
			</div>
		)
	}

	if (betWhitelistStatus !== WHITELIST_STATUS.OK) {
		if (betWhitelistStatus === WHITELIST_STATUS.ALREADY_BET) {
			return <WhitelistBetDetail marketId={market.id} chainId={chainId} />
		}

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
							<Trans>To bet in this market you need to connect using your email.</Trans>
						</div>
					</div>
				</Box>
			</BigAlert>
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

	if (eventsError) {
		return (
			<Alert severity='error'>
				<Trans>Error loading events</Trans>.
			</Alert>
		)
	}

	if (chain?.unsupported) {
		return (
			<Alert severity='error'>
				<Trans>UNSUPPORTED_CHAIN</Trans>
			</Alert>
		)
	}

	const onSubmit = async (_: BetFormValues) => {
		placeBet!()
	}

	const generalError = getGeneralError(address, hasFundsToBet, hasVoucher)

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
					Answer all the questions. You will get 1 point for each correct prediction. The top ranked bets win the
					market’s prize!
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

			{!hasVoucher && chain && isCrossChainBet && (
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
									id='You can bet from {chain} with DAI. We will take care of bridging the funds for you.'
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
				{fields.map((field, outcomeIndex) => {
					if (!events || !events[outcomeIndex]) {
						return null
					}
					// set default to be able to loop
					const tmpOutcomeValues = outcomes?.[outcomeIndex]?.values || ['']
					const valuesLength = tmpOutcomeValues.length
					return (
						<React.Fragment key={events[outcomeIndex].id}>
							<Grid item xs={12} md={6}>
								<FormatEvent title={events[outcomeIndex].title} />
							</Grid>
							<Grid item xs={12} md={6}>
								{tmpOutcomeValues.map((value, valueIndex) => (
									<BetOutcomeRow
										key={`${valueIndex}-${events[outcomeIndex].id}`}
										matchesInterdependencies={matchesInterdependencies}
										events={events}
										outcomeIndex={outcomeIndex}
										valueIndex={valueIndex}
										outcomes={outcomes}
										control={control}
										errors={errors}
										setValue={setValue}
										addAlternative={
											betPrice.gt(0) &&
											!isOldMarket(market.id) &&
											isMainChain(chainId) &&
											!hasVoucher &&
											valueIndex === valuesLength - 1 &&
											value !== ''
												? addAlternative(outcomeIndex)
												: false
										}
										removeAlternative={removeAlternative(outcomeIndex, valueIndex)}
									/>
								))}
								<input
									type='hidden'
									{...register(`outcomes.${outcomeIndex}.questionId`, {
										required: t`This field is required`,
									})}
								/>
							</Grid>
						</React.Fragment>
					)
				})}
				{hasFundsToBet && betsCount > 1 && (
					<Grid item xs={12}>
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
											<Trans>You are about to place {betsCount} bets.</Trans>
										</AlertTitle>
									</div>
									<div>
										<Trans>
											We will calculate all the possible combinations of results and send a bet for each one of them.
										</Trans>
									</div>
								</div>
							</Box>
						</BigAlert>
					</Grid>
				)}
				{generalError !== '' && (
					<Grid item xs={12}>
						<Alert severity='error'>
							<span dangerouslySetInnerHTML={{ __html: generalError }}></span>
						</Alert>
					</Grid>
				)}
				<Grid item xs={6}>
					<Button type='button' color='primary' size='large' variant='outlined' fullWidth onClick={cancelHandler}>
						<Trans>Cancel</Trans> <CrossIcon style={{ marginLeft: 10 }} width={10} height={10} />
					</Button>
				</Grid>
				<Grid item xs={6}>
					{!address && <InPageConnectButton fullWidth={true} />}

					{address && (
						<>
							{approve && approveTokens && (
								<Button type='button' color='primary' size='large' fullWidth onClick={() => approveTokens()}>
									<Trans>Approve DAI</Trans>{' '}
									<TriangleIcon style={{ marginLeft: 10, fill: 'currentColor', color: 'white' }} />
								</Button>
							)}
							{chain && !approve && (
								<Button type='submit' disabled={!placeBet} color='primary' size='large' fullWidth>
									{betPrice.gt(0) ? (
										<>
											<Trans>Place Bet</Trans> - {formatAmount(betPrice, chain.id)}
										</>
									) : (
										<Trans>Place a Free Bet</Trans>
									)}{' '}
									<TriangleIcon style={{ marginLeft: 10, fill: 'currentColor', color: 'white' }} />
								</Button>
							)}
						</>
					)}
				</Grid>
			</Grid>
		</form>
	)
}
