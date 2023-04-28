import { t } from '@lingui/macro'
import { Trans } from '@lingui/macro'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import React from 'react'
import { Controller } from 'react-hook-form'
import { FieldErrors } from 'react-hook-form/dist/types/errors'
import { Control, UseFormSetValue } from 'react-hook-form/dist/types/form'

import { Event } from '@/graphql/subgraph'
import { getInverseInterdependencies, MatchesInterdependencies } from '@/hooks/useMatchesInterdependencies'
import { transOutcome } from '@/lib/helpers'
import { INVALID_RESULT, REALITY_TEMPLATE_MULTIPLE_SELECT } from '@/lib/reality'

import { BetFormValues } from './BetForm'

type BetOutcomeValue = number | typeof INVALID_RESULT

type IndexedBetOutcome = { value: BetOutcomeValue; text: string }

function getOutcomes(
	event: Event,
	events: Event[],
	outcomesValues: BetFormValues['outcomes'],
	matchesInterdependencies: MatchesInterdependencies
): IndexedBetOutcome[] {
	// first map and then filter to keep the index of each outcome as value
	const outcomes: IndexedBetOutcome[] = event.outcomes.map((outcome, i) => ({
		value: i,
		text: outcome,
	}))

	return filterOutcomesInterdependencies(outcomes, event, events, outcomesValues, matchesInterdependencies)
}

function filterOutcomesInterdependencies(
	outcomes: IndexedBetOutcome[],
	event: Event,
	events: Event[],
	outcomesValues: BetFormValues['outcomes'],
	matchesInterdependencies: MatchesInterdependencies
): IndexedBetOutcome[] {
	return outcomes.filter(outcome => {
		if (matchesInterdependencies) {
			const relatedQuestions: string[] = matchesInterdependencies[event.id] ?? []
			const possibleOutcomes: string[] = []
			for (let k = 0; k < relatedQuestions.length; k++) {
				const questionId = relatedQuestions[k]
				const questionPos = events.findIndex(event => event.id === questionId)
				outcomesValues[questionPos].values.forEach(userSelectionIndex => {
					const outcomeSelected = events[questionPos].outcomes[Number(userSelectionIndex)]
					possibleOutcomes.push(outcomeSelected)
				})
			}
			if (possibleOutcomes.length >= 2 && !possibleOutcomes.includes(outcome.text)) {
				return false
			}
		}

		return true
	})
}

interface Props {
	matchesInterdependencies: MatchesInterdependencies
	events: Event[]
	i: number
	j: number
	outcomes: BetFormValues['outcomes']
	control: Control<BetFormValues>
	errors: FieldErrors<BetFormValues>
	setValue: UseFormSetValue<BetFormValues>
}

export function BetOutcomeSelect({
	matchesInterdependencies,
	events,
	i,
	j,
	outcomes,
	control,
	errors,
	setValue,
}: Props) {
	const inverseInterdependencies = getInverseInterdependencies(matchesInterdependencies)

	const event = events[i]

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
				name={`outcomes.${i}.values.${j}`}
				control={control}
				rules={{
					required: t`This field is required`,
				}}
				defaultValue={event.templateID === REALITY_TEMPLATE_MULTIPLE_SELECT ? [] : ''}
				render={({ field: { onChange, value } }) => (
					<Select
						id={`event-${i}-outcome-select`}
						multiple={event.templateID === REALITY_TEMPLATE_MULTIPLE_SELECT}
						error={!!errors.outcomes?.[i]?.values}
						value={value === '' && event.templateID === REALITY_TEMPLATE_MULTIPLE_SELECT ? [] : value}
						onChange={(...event: any[]) => {
							onChange(...event)
							onOutcomeChange()
						}}
					>
						{getOutcomes(event, events, outcomes, matchesInterdependencies).map(outcome => (
							<MenuItem value={outcome.value} key={outcome.value}>
								{transOutcome(outcome.text)}
							</MenuItem>
						))}
						<MenuItem value={INVALID_RESULT}>
							<Trans>Invalid result</Trans>
						</MenuItem>
					</Select>
				)}
			/>
		</>
	)
}
