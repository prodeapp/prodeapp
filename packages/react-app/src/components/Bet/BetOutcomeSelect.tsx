import { BigNumber } from '@ethersproject/bignumber'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import { MenuItem, Select } from '@mui/material'
import { Typography } from '@mui/material'
import React from 'react'
import { Controller } from 'react-hook-form'
import { FieldErrors } from 'react-hook-form/dist/types/errors'
import { Control, UseFormSetValue } from 'react-hook-form/dist/types/form'

import { Event } from '@/graphql/subgraph'
import { getInverseInterdependencies, MatchesInterdependencies } from '@/hooks/useMatchesInterdependencies'
import { formatAmount, transOutcome } from '@/lib/helpers'
import { INVALID_RESULT } from '@/lib/reality'

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
	return outcomes.filter((outcome) => {
		if (matchesInterdependencies) {
			const relatedQuestions: string[] = matchesInterdependencies[event.id] ?? []
			const possibleOutcomes: string[] = []
			for (let k = 0; k < relatedQuestions.length; k++) {
				const questionId = relatedQuestions[k]
				const questionPos = events.findIndex((event) => event.id === questionId)
				const userSelectionIndex = outcomesValues[questionPos].value
				if (userSelectionIndex !== '') {
					const outcomeSelected = events[questionPos].outcomes[Number(userSelectionIndex)]
					possibleOutcomes.push(outcomeSelected)
				}
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
	outcomes: BetFormValues['outcomes']
	control: Control<BetFormValues>
	errors: FieldErrors<BetFormValues>
	setValue: UseFormSetValue<BetFormValues>
	currentPrice: BigNumber
}

export function BetOutcomeSelect({
	matchesInterdependencies,
	events,
	i,
	outcomes,
	control,
	errors,
	setValue,
	currentPrice,
}: Props) {
	const inverseInterdependencies = getInverseInterdependencies(matchesInterdependencies)

	const event = events[i]

	const onOutcomeChange = () => {
		if (!inverseInterdependencies[event.id]) {
			return
		}

		inverseInterdependencies[event.id].forEach((matchDependencyId) => {
			const matchDependencyIndex = outcomes.findIndex((outcome) => outcome.questionId === matchDependencyId)
			if (outcomes[matchDependencyIndex].value !== '') {
				setValue(`outcomes.${matchDependencyIndex}.value`, '', {
					shouldValidate: true,
				})
			}
		})
	}

	let totalBets = 1
	for (let k = 0; k < outcomes.length; k++) {
		const outcome = outcomes[k].value
		if (Array.isArray(outcome) && outcome.length > 0) {
			totalBets = totalBets * outcome.length
		}
	}

	return (
		<>
			<Controller
				name={`outcomes.${i}.value`}
				control={control}
				rules={{
					required: i18n._('This field is required'),
				}}
				defaultValue={[]}
				render={({ field: { onChange, value } }) => (
					<Select
						id={`event-${i}-outcome-select`}
						multiple={true}
						error={!!errors.outcomes?.[i]?.value}
						value={value === '' ? [] : value}
						onChange={(...event: any[]) => {
							onChange(...event)
							onOutcomeChange()
						}}
					>
						{getOutcomes(event, events, outcomes, matchesInterdependencies).map((outcome) => {
							return (
								<MenuItem value={outcome.value} key={outcome.value}>
									{transOutcome(outcome.text)}
									{Array.isArray(value) && value.length > 0 && !value.includes(outcome.value) && (
										<Typography variant='body2' color='green' align='right'>
											+{formatAmount(currentPrice.mul(totalBets / value.length), 100)}
										</Typography>
									)}
								</MenuItem>
							)
						})}
						<MenuItem value={INVALID_RESULT}>
							<Trans id='Invalid result' />
							{Array.isArray(value) && value.length > 0 && !value.includes(INVALID_RESULT) && (
								<Typography variant='body2' color='green' align='right'>
									+{formatAmount(currentPrice.mul(totalBets / value.length), 100)}
								</Typography>
							)}
						</MenuItem>
					</Select>
				)}
			/>
		</>
	)
}
