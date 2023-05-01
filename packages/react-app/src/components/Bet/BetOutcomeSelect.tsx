import { ErrorMessage } from '@hookform/error-message'
import { t } from '@lingui/macro'
import { Trans } from '@lingui/macro'
import HelpIcon from '@mui/icons-material/Help'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Tooltip from '@mui/material/Tooltip'
import React from 'react'
import { Controller } from 'react-hook-form'
import { FieldErrors } from 'react-hook-form/dist/types/errors'
import { Control, UseFormSetValue } from 'react-hook-form/dist/types/form'

import { FormError } from '@/components'
import { Event } from '@/graphql/subgraph'
import { getInverseInterdependencies, MatchesInterdependencies } from '@/hooks/useMatchesInterdependencies'
import { transOutcome } from '@/lib/helpers'
import { INVALID_RESULT, REALITY_TEMPLATE_MULTIPLE_SELECT } from '@/lib/reality'

import { BetFormValues } from './BetForm'

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

	eventOutcomes.push({ value: INVALID_RESULT, text: t`Invalid result` })

	if (!isMultiple && outcomesValues[outcomeIndex]) {
		// exclude the values already selected...
		const outcomeValues = [...outcomesValues[outcomeIndex].values]
		// ... except the current value
		outcomeValues.splice(valueIndex, 1)

		eventOutcomes = eventOutcomes.filter(outcome => {
			return !outcomeValues.includes(outcome.value)
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
	return eventOutcomes.filter(outcome => {
		if (matchesInterdependencies) {
			const relatedQuestions: string[] = matchesInterdependencies[event.id] ?? []
			const possibleOutcomes: string[] = []
			for (let k = 0; k < relatedQuestions.length; k++) {
				const questionId = relatedQuestions[k]
				const questionPos = events.findIndex(event => event.id === questionId)
				outcomesValues[questionPos].values.forEach(userSelectionIndex => {
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

interface BetOutcomeSelectProps {
	matchesInterdependencies: MatchesInterdependencies
	event: Event
	selectOutcomes: IndexedBetOutcome[]
	isMultiple: boolean
	outcomeIndex: number
	valueIndex: number
	outcomes: BetFormValues['outcomes']
	control: Control<BetFormValues>
	errors: FieldErrors<BetFormValues>
	setValue: UseFormSetValue<BetFormValues>
}

function BetOutcomeSelect({
	matchesInterdependencies,
	event,
	selectOutcomes,
	isMultiple,
	outcomeIndex,
	valueIndex,
	outcomes,
	control,
	errors,
	setValue,
}: BetOutcomeSelectProps) {
	const inverseInterdependencies = getInverseInterdependencies(matchesInterdependencies)

	const onOutcomeChange = () => {
		if (!inverseInterdependencies[event.id]) {
			return
		}

		inverseInterdependencies[event.id].forEach(matchDependencyId => {
			const matchDependencyIndex = outcomes.findIndex(outcome => outcome.questionId === matchDependencyId)
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
				render={({ field: { onChange, value } }) => (
					<Select
						id={`event-${outcomeIndex}-outcome-select`}
						multiple={isMultiple}
						error={!!errors.outcomes?.[outcomeIndex]?.values}
						value={value === '' && isMultiple ? [] : value}
						onChange={(...event: any[]) => {
							onChange(...event)
							onOutcomeChange()
						}}
					>
						{selectOutcomes.map(outcome => (
							<MenuItem value={outcome.value} key={outcome.value}>
								{transOutcome(outcome.text)}
							</MenuItem>
						))}
					</Select>
				)}
			/>
		</>
	)
}

interface BetOutcomeRowProps {
	matchesInterdependencies: MatchesInterdependencies
	events: Event[]
	outcomeIndex: number
	valueIndex: number
	outcomes: BetFormValues['outcomes']
	control: Control<BetFormValues>
	errors: FieldErrors<BetFormValues>
	setValue: UseFormSetValue<BetFormValues>
	addAlternative: false | (() => void)
	removeAlternative: () => void
}

export function BetOutcomeRow({
	matchesInterdependencies,
	events,
	outcomeIndex,
	valueIndex,
	outcomes,
	control,
	errors,
	setValue,
	addAlternative,
	removeAlternative,
}: BetOutcomeRowProps) {
	const event = events[outcomeIndex]
	const isMultiple = event.templateID === REALITY_TEMPLATE_MULTIPLE_SELECT

	const selectOutcomes = getOutcomes(
		outcomeIndex,
		valueIndex,
		event,
		events,
		outcomes,
		matchesInterdependencies,
		isMultiple
	)

	if (selectOutcomes.length === 0) {
		return null
	}

	return (
		<div>
			<FormControl fullWidth>
				<BetOutcomeSelect
					matchesInterdependencies={matchesInterdependencies}
					event={event}
					selectOutcomes={selectOutcomes}
					isMultiple={isMultiple}
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

			{valueIndex > 0 && (
				<span
					className='js-link'
					onClick={removeAlternative}
					style={{
						fontSize: 12,
						textAlign: 'right',
						color: 'red',
						display: 'block',
						marginBottom: '5px',
					}}
				>
					<Trans>Remove prediction</Trans>
				</span>
			)}

			{addAlternative !== false && selectOutcomes.length > 1 && (
				<div style={{ display: 'flex', alignItems: 'center', fontSize: 16 }}>
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
