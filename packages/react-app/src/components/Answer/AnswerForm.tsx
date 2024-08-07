import { BigNumber } from '@ethersproject/bignumber'
import { ErrorMessage } from '@hookform/error-message'
import { t } from '@lingui/macro'
import { Trans } from '@lingui/macro'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import React, { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useAccount, useNetwork, UsePrepareContractWriteConfig } from 'wagmi'

import { RealityAbi } from '@/abi/RealityETH_v3_0'
import { Bytes } from '@/abi/types'
import { BoxRow, BoxWrapper, FormError } from '@/components'
import { Event } from '@/graphql/subgraph'
import { useSendTx } from '@/hooks/useSendTx'
import { filterChainId, getConfigAddress, isMainChain } from '@/lib/config'
import { formatAmount, getAnswerText, getTimeLeft, isFinalized } from '@/lib/helpers'
import { useI18nContext } from '@/lib/I18nContext'
import {
	ANSWERED_TOO_SOON,
	formatOutcome,
	INVALID_RESULT,
	REALITY_TEMPLATE_MULTIPLE_SELECT,
	REALITY_TEMPLATE_SINGLE_SELECT,
} from '@/lib/reality'

// `string` is a stringified number (value returned by the radio buttons)
export type FormEventOutcomeValue = number | string | typeof INVALID_RESULT | typeof ANSWERED_TOO_SOON

type AnswerFormValues = {
	outcome: FormEventOutcomeValue | [FormEventOutcomeValue] | ''
}

type AnswerFormProps = {
	event: Event
	setShowActions: (showActions: boolean) => void
}

function getOutcomes(event: Event) {
	// outcomes
	let outcomes: { value: FormEventOutcomeValue; text: string }[] = []

	outcomes = event.outcomes
		// first map and then filter to keep the index of each outcome as value
		.map((outcome, i) => ({ value: i, text: outcome }))

	if (event.templateID === REALITY_TEMPLATE_SINGLE_SELECT) {
		outcomes = outcomes.filter((_, i) => event.answer === null || String(i) !== BigNumber.from(event.answer).toString())
	}

	if (event.answer !== INVALID_RESULT) {
		outcomes.push({ value: INVALID_RESULT, text: 'Invalid result' })
	}

	if (event.answer && event.answer !== ANSWERED_TOO_SOON) {
		outcomes.push({ value: ANSWERED_TOO_SOON, text: 'Answered too soon' })
	}

	return outcomes
}

function getTxParams(
	chainId: number,
	eventId: Bytes,
	outcome: FormEventOutcomeValue | FormEventOutcomeValue[] | '',
	currentBond: BigNumber
): UsePrepareContractWriteConfig<typeof RealityAbi, 'submitAnswer'> {
	if (outcome === '') {
		return {}
	}

	return {
		address: getConfigAddress('REALITIO', chainId),
		abi: RealityAbi,
		functionName: 'submitAnswer',
		args: [eventId, formatOutcome(outcome), currentBond],
		overrides: {
			value: currentBond,
		},
	}
}

export default function AnswerForm({ event, setShowActions }: AnswerFormProps) {
	const { address } = useAccount()
	const { chain } = useNetwork()
	const { locale } = useI18nContext()

	const {
		register,
		formState: { errors },
		handleSubmit,
		control,
	} = useForm<AnswerFormValues>({
		defaultValues: {
			outcome: '',
		},
	})

	const outcome = useWatch({ control, name: 'outcome' })

	const currentBond = event.lastBond.gt(0) ? event.lastBond.mul(2) : event.minBond

	const { isLoading, isSuccess, error, write } = useSendTx(
		getTxParams(filterChainId(chain?.id), event.id, outcome, currentBond)
	)

	const outcomes = getOutcomes(event)

	useEffect(() => {
		if (!address || !chain || chain.unsupported || !isMainChain(chain?.id)) {
			setShowActions(false)
			return
		}

		setShowActions(!isSuccess)
	}, [isSuccess, address, chain, setShowActions])

	useEffect(() => {
		setShowActions(typeof write !== 'undefined')
	}, [write])

	if (!address) {
		return (
			<Alert severity='error'>
				<Trans>Connect your wallet to answer</Trans>
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

	if (!isMainChain(chain?.id)) {
		return (
			<Alert severity='error'>
				<Trans>ONLY_MAIN_CHAIN</Trans>
			</Alert>
		)
	}

	if (isSuccess) {
		return (
			<Alert severity='success'>
				<Trans>Answer sent</Trans>!
			</Alert>
		)
	}

	const onSubmit = async (/*data: AnswerFormValues*/) => {
		write!()
	}

	const finalized = isFinalized(event)
	const openingTimeLeft = getTimeLeft(event.openingTs, false, locale)

	if (openingTimeLeft !== false) {
		return (
			<div>
				<Trans>Open to answers in {openingTimeLeft}</Trans>
			</div>
		)
	}

	if (event.isPendingArbitration) {
		return (
			<div>
				<Trans>Event result is pending arbitration.</Trans>
			</div>
		)
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} id='answer-form'>
			{isLoading && (
				<div style={{ textAlign: 'center', marginBottom: 15 }}>
					<CircularProgress />
				</div>
			)}
			{error && (
				<Alert severity='error' sx={{ mb: 2 }}>
					{error.message}
				</Alert>
			)}
			<BoxWrapper>
				<BoxRow>
					<div style={{ width: '40%' }}>
						<Trans>Current result</Trans>
					</div>
					<div style={{ width: '60%' }}>{getAnswerText(event.answer, event.outcomes || [], event.templateID)}</div>
				</BoxRow>
				{event.bounty.gt(0) && (
					<BoxRow>
						<div style={{ width: '40%' }}>
							<Trans>Reward</Trans>
						</div>
						<div style={{ width: '60%' }}>{formatAmount(event.bounty, chain.id)}</div>
					</BoxRow>
				)}
				{!finalized && (
					<>
						<BoxRow>
							<div style={{ width: '40%' }}>
								<Trans>New result</Trans>
							</div>
							<div style={{ width: '60%' }}>
								<FormControl fullWidth>
									<Select
										defaultValue={event.templateID === REALITY_TEMPLATE_MULTIPLE_SELECT ? [] : ''}
										multiple={event.templateID === REALITY_TEMPLATE_MULTIPLE_SELECT}
										id={`question-outcome-select`}
										{...register(`outcome`, {
											required: t`This field is required.`,
										})}
										error={!!errors.outcome}
									>
										{outcomes.map((outcome, i) => (
											<MenuItem value={outcome.value} key={i}>
												<Trans>{outcome.text}</Trans>
											</MenuItem>
										))}
									</Select>
									<FormError>
										<ErrorMessage errors={errors} name={`outcome`} />
									</FormError>
								</FormControl>
							</div>
						</BoxRow>
						<BoxRow>
							<FormHelperText>
								<Trans
									id='To submit the answer you need to deposit a bond of {0} that will be returned if the answer is correct.'
									values={{ 0: formatAmount(currentBond, chain.id) }}
								/>
							</FormHelperText>
						</BoxRow>
					</>
				)}
			</BoxWrapper>
		</form>
	)
}
