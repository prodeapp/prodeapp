import { BigNumber } from '@ethersproject/bignumber'
import { ErrorMessage } from '@hookform/error-message'
import { t } from '@lingui/macro'
import { Trans } from '@lingui/macro'
import ClearIcon from '@mui/icons-material/Clear'
import HelpIcon from '@mui/icons-material/Help'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Select from '@mui/material/Select'
import Tooltip from '@mui/material/Tooltip'
import React from 'react'
import { Controller } from 'react-hook-form'
import { FieldErrors } from 'react-hook-form/dist/types/errors'
import { Control, UseFormRegister, UseFormSetValue } from 'react-hook-form/dist/types/form'
import { Address } from 'wagmi'

import { FormError } from '@/components'
import { FormatEvent, FormatOutcome } from '@/components/FormatEvent'
import { Event } from '@/graphql/subgraph'
import { getInverseInterdependencies, MatchesInterdependencies } from '@/hooks/useMatchesInterdependencies'
import { transOutcome } from '@/lib/helpers'
import { INVALID_RESULT, REALITY_TEMPLATE_MULTIPLE_SELECT } from '@/lib/reality'

import { BetFormOutcome, BetFormValues } from './BetForm'

type BetOutcomeValue = number | typeof INVALID_RESULT

type IndexedBetOutcome = { value: BetOutcomeValue; text: string }

function getOutcomes(
	outcomeIndex: number,
	valueIndex: number,
	event: Event,
	events: Event[],
	outcomesValues: BetFormValues['outcomes'],
	matchesInterdependencies: MatchesInterdependencies,
	isMultiple: boolean
): IndexedBetOutcome[] {
	// first map and then filter to keep the index of each outcome as value
	let eventOutcomes: IndexedBetOutcome[] = event.outcomes.map((outcome, i) => ({
		value: i,
		text: outcome,
	}))

	// don't show INVALID_RESULT as a valid outcome
	//eventOutcomes.push({ value: INVALID_RESULT, text: t`Invalid result` })

	if (!isMultiple && outcomesValues[outcomeIndex]) {
		// exclude the values already selected...
		const outcomeValues = [...outcomesValues[outcomeIndex].values]
		// ... except the current value
		outcomeValues.splice(valueIndex, 1)
		eventOutcomes = eventOutcomes.filter((outcome) => {
			return !outcomeValues.map((v) => String(v)).includes(String(outcome.value))
		})
	}

	return filterOutcomesInterdependencies(eventOutcomes, event, events, outcomesValues, matchesInterdependencies)
}

function filterOutcomesInterdependencies(
	eventOutcomes: IndexedBetOutcome[],
	event: Event,
	events: Event[],
	outcomesValues: BetFormValues['outcomes'],
	matchesInterdependencies: MatchesInterdependencies
): IndexedBetOutcome[] {
	return eventOutcomes.filter((outcome) => {
		if (matchesInterdependencies) {
			const relatedQuestions: string[] = matchesInterdependencies[event.id] ?? []
			const possibleOutcomes: string[] = []
			for (let k = 0; k < relatedQuestions.length; k++) {
				const questionId = relatedQuestions[k]
				const questionPos = events.findIndex((event) => event.id === questionId)
				outcomesValues[questionPos].values.forEach((userSelectionIndex) => {
					if (userSelectionIndex !== '') {
						const outcomeSelected = events[questionPos].outcomes[Number(userSelectionIndex)]
						possibleOutcomes.push(outcomeSelected)
					}
				})
			}
			if (possibleOutcomes.length >= 2 && !possibleOutcomes.includes(outcome.text)) {
				return false
			}
		}

		return true
	})
}

interface BetOutcomeFieldProps {
	matchesInterdependencies: MatchesInterdependencies
	event: Event
	fieldOutcomes: IndexedBetOutcome[]
	isMultiple: boolean
	showRadios: boolean
	outcomeIndex: number
	valueIndex: number
	outcomes: BetFormValues['outcomes']
	control: Control<BetFormValues>
	errors: FieldErrors<BetFormValues>
	setValue: UseFormSetValue<BetFormValues>
}

function BetOutcomeField({
	matchesInterdependencies,
	event,
	fieldOutcomes,
	isMultiple,
	showRadios,
	outcomeIndex,
	valueIndex,
	outcomes,
	control,
	errors,
	setValue,
}: BetOutcomeFieldProps) {
	const inverseInterdependencies = getInverseInterdependencies(matchesInterdependencies)

	const onOutcomeChange = () => {
		if (!inverseInterdependencies[event.id]) {
			return
		}

		inverseInterdependencies[event.id].forEach((matchDependencyId) => {
			const matchDependencyIndex = outcomes.findIndex((outcome) => outcome.questionId === matchDependencyId)
			outcomes[matchDependencyIndex].values.forEach((value, index) => {
				if (value !== '') {
					setValue(`outcomes.${matchDependencyIndex}.values.${index}`, '', {
						shouldValidate: true,
					})
				}
			})
		})
	}

	return (
		<>
			<Controller
				name={`outcomes.${outcomeIndex}.values.${valueIndex}`}
				control={control}
				rules={{
					required: t`This field is required`,
				}}
				defaultValue={isMultiple ? [] : ''}
				render={({ field: { onChange, value } }) => {
					const onChangeHandler = (...event: any[]) => {
						onChange(...event)
						onOutcomeChange()
					}

					if (showRadios) {
						return (
							<RadioGroup
								row
								id={`event-${outcomeIndex}-outcome-field`}
								value={value}
								onChange={onChangeHandler}
								sx={{ justifyContent: 'center' }}
							>
								{fieldOutcomes.map((outcome) => (
									<FormControlLabel
										value={outcome.value}
										key={outcome.value}
										control={<Radio />}
										sx={{ flexDirection: 'column', width: '33%', margin: 0 }}
										label={<FormatOutcome name={transOutcome(outcome.text)} title={event.title} />}
									/>
								))}
							</RadioGroup>
						)
					}

					return (
						<Select
							id={`event-${outcomeIndex}-outcome-field`}
							multiple={isMultiple}
							error={!!errors.outcomes?.[outcomeIndex]?.values}
							value={value === '' && isMultiple ? [] : value}
							onChange={onChangeHandler}
						>
							{fieldOutcomes.map((outcome) => (
								<MenuItem value={outcome.value} key={outcome.value}>
									{transOutcome(outcome.text)}
								</MenuItem>
							))}
						</Select>
					)
				}}
			/>
		</>
	)
}

interface BetOutcomeFieldWraperProps {
	showRadios: boolean
	matchesInterdependencies: MatchesInterdependencies
	event: Event
	isMultiple: boolean
	fieldOutcomes: IndexedBetOutcome[]
	outcomeIndex: number
	valueIndex: number
	outcomes: BetFormValues['outcomes']
	control: Control<BetFormValues>
	errors: FieldErrors<BetFormValues>
	setValue: UseFormSetValue<BetFormValues>
	addAlternative: false | (() => void)
	removeAlternative: () => void
}

function BetOutcomeFieldWrapper({
	showRadios,
	matchesInterdependencies,
	event,
	isMultiple,
	fieldOutcomes,
	outcomeIndex,
	valueIndex,
	outcomes,
	control,
	errors,
	setValue,
	addAlternative,
	removeAlternative,
}: BetOutcomeFieldWraperProps) {
	if (fieldOutcomes.length === 0) {
		return null
	}

	return (
		<div>
			<div style={{ display: 'flex', alignItems: 'center' }}>
				<FormControl fullWidth>
					<BetOutcomeField
						matchesInterdependencies={matchesInterdependencies}
						event={event}
						fieldOutcomes={fieldOutcomes}
						isMultiple={isMultiple}
						showRadios={showRadios}
						outcomeIndex={outcomeIndex}
						valueIndex={valueIndex}
						outcomes={outcomes}
						control={control}
						errors={errors}
						setValue={setValue}
					/>
					<FormError>
						<ErrorMessage errors={errors} name={`outcomes.${outcomeIndex}.value`} />
					</FormError>
				</FormControl>

				<div style={{ width: 25 }}>
					{valueIndex > 0 && (
						<span
							onClick={removeAlternative}
							style={{
								cursor: 'pointer',
								color: 'red',
								marginBottom: '5px',
							}}
						>
							<ClearIcon fontSize='small' />
						</span>
					)}
				</div>
			</div>

			{addAlternative !== false && fieldOutcomes.length > 1 && (
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						fontSize: 16,
						justifyContent: showRadios ? 'center' : 'left',
						marginTop: showRadios ? 10 : 0,
					}}
				>
					<span className='js-link' style={{ fontSize: 12, marginRight: 5 }} onClick={addAlternative}>
						+<Trans>Add another prediction</Trans>
					</span>
					<Tooltip
						title={t`You can add multiple predictions for each match to create multiple bets with different combinations of outcomes.`}
					>
						<HelpIcon fontSize='inherit' color='primary' />
					</Tooltip>
				</div>
			)}
		</div>
	)
}

interface BetOutcomeRowProps {
	marketId: Address
	chainId: number
	betPrice: BigNumber
	hasVoucher: boolean
	matchesInterdependencies: MatchesInterdependencies
	events: Event[]
	values: BetFormOutcome[]
	outcomeIndex: number
	outcomes: BetFormValues['outcomes']
	control: Control<BetFormValues>
	errors: FieldErrors<BetFormValues>
	register: UseFormRegister<BetFormValues>
	setValue: UseFormSetValue<BetFormValues>
	addAlternative: (outcomeIndex: number) => () => void
	removeAlternative: (outcomeIndex: number, valueIndex: number) => () => void
}

export function BetOutcomeRow({
	marketId,
	chainId,
	betPrice,
	hasVoucher,
	matchesInterdependencies,
	events,
	values,
	outcomeIndex,
	outcomes,
	control,
	errors,
	register,
	setValue,
	addAlternative,
	removeAlternative,
}: BetOutcomeRowProps) {
	const valuesLength = values.length

	const event = events[outcomeIndex]
	const isMultiple = event.templateID === REALITY_TEMPLATE_MULTIPLE_SELECT

	const showRadios = !isMultiple && event.outcomes.length <= 3

	return (
		<>
			{!showRadios && (
				<Grid item xs={12} md={6}>
					<FormatEvent title={events[outcomeIndex].title} />
				</Grid>
			)}
			<Grid item xs={12} md={showRadios ? 12 : 6}>
				{values.map((value, valueIndex) => (
					<BetOutcomeFieldWrapper
						key={`${valueIndex}-${events[outcomeIndex].id}`}
						showRadios={showRadios}
						matchesInterdependencies={matchesInterdependencies}
						event={event}
						isMultiple={isMultiple}
						fieldOutcomes={getOutcomes(
							outcomeIndex,
							valueIndex,
							event,
							events,
							outcomes,
							matchesInterdependencies,
							isMultiple
						)}
						outcomeIndex={outcomeIndex}
						valueIndex={valueIndex}
						outcomes={outcomes}
						control={control}
						errors={errors}
						setValue={setValue}
						addAlternative={
							betPrice.gt(0) &&
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
			{showRadios && <div style={{ borderBottom: '1px solid #CCC', width: '100%', paddingBottom: 24 }}></div>}
		</>
	)
}
