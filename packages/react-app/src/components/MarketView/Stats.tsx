import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import { Skeleton, useTheme } from '@mui/material'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import { Address } from '@wagmi/core'
import React from 'react'
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import { BoxRow, BoxWrapper } from '@/components'
import { FormatEvent } from '@/components/FormatEvent'
import { Bet, Event } from '@/graphql/subgraph'
import { useBets } from '@/hooks/useBets'
import { useEvents } from '@/hooks/useEvents'
import { getAnswerText, transOutcome } from '@/lib/helpers'

interface Stat {
	outcome: string
	amountBets: number
	percentage: number
	index: number
	title: string
}

function bets2Stats(bets: Bet[], events: Event[]): Stat[][] {
	if (events.length === 0) {
		return []
	}

	// Initialize events stats
	let stats = events.map(event => [
		...event.outcomes.map((outcome, index) => {
			return {
				outcome: transOutcome(outcome),
				amountBets: 0,
				percentage: 0,
				index: index,
				title: event.title,
				openingTs: event.openingTs,
			}
		}),
		{
			outcome: i18n._('Invalid result'),
			amountBets: 0,
			percentage: 0,
			index: -1,
			title: event.title,
			openingTs: event.openingTs,
		},
	])

	// Add stats
	bets.forEach(bet => {
		events.forEach((event, i) => {
			const betText = getAnswerText(bet.results[i], event.outcomes, event.templateID, 'Invalid value')

			let betStatIndex = stats[i].findIndex(event => event.outcome === betText)
			if (betStatIndex === -1) {
				// this bet is a combination of outcomes, so needs to be initialized
				betStatIndex = stats[i].length
				stats[i][betStatIndex] = {
					outcome: getAnswerText(bet.results[i], event.outcomes, event.templateID, 'Invalid value'),
					amountBets: 0,
					percentage: 0,
					index: stats[i].length,
					title: event.title,
					openingTs: event.openingTs,
				}
			}
			stats[i][betStatIndex].amountBets = stats[i][betStatIndex].amountBets + 1
		})
	})

	// Normalize data
	const nBets = bets.length
	stats.forEach((eventStat, i) => {
		eventStat.forEach((outcomeStat, o) => {
			stats[i][o].percentage = (stats[i][o].amountBets / nBets) * 100
		})
	})

	// sort events by openingTs
	stats.sort((a, b) => (a[0].openingTs > b[0].openingTs ? 1 : b[0].openingTs > a[0].openingTs ? -1 : 0))

	// sort stats in each event by amount of bets
	stats.map(eventStat =>
		eventStat.sort((a, b) => (a.amountBets > b.amountBets ? -1 : b.amountBets > a.amountBets ? 1 : 0))
	)

	// return stats
	if (events[0].outcomes.length > 4) {
		// filter zero values for clarity in the graphs
		stats = stats.map(eventStat =>
			eventStat.filter(stat => stat.amountBets !== 0 || stat.outcome.toLowerCase() === i18n._('draw'))
		)
	}

	// filter invalid if it has 0 bets
	return stats.map(eventStat =>
		eventStat.filter(stat => (stat.outcome === i18n._('Invalid result') ? stat.amountBets !== 0 : true))
	)
}

export function Stats({ marketId }: { marketId: Address }) {
	const { isLoading: isLoadingBets, error, data: bets = [] } = useBets({ marketId })
	const { isLoading: isLoadingEvents, data: events = [] } = useEvents(marketId, 'id')
	const theme = useTheme()

	if (isLoadingBets || isLoadingEvents) {
		return <Skeleton animation='wave' height={150} />
	}

	if (error) {
		return <Alert severity='error'>{error.message}</Alert>
	}

	const stats = bets.length > 0 && events.length > 0 ? bets2Stats(bets, events) : []

	return (
		<>
			<BoxWrapper>
				{stats.length === 0 && (
					<Alert severity='info'>
						<Trans id='No bets found.' />
					</Alert>
				)}
				{stats.length > 0 &&
					stats.map((event, i) => {
						return (
							<Box key={i} sx={{ padding: '20px', borderBottom: '1px' }}>
								<BoxRow style={{ width: '90%', justifyContent: 'center' }}>
									<FormatEvent title={event[0].title} />
								</BoxRow>
								<BoxRow style={{ width: '90%', justifyContent: 'center' }}>
									<ResponsiveContainer width='100%' minHeight={event.length * 40}>
										<BarChart data={event} layout='vertical'>
											<XAxis hide type='number' domain={[0, 110]} />
											<YAxis type='category' dataKey='outcome' width={150} />
											<Bar dataKey='percentage' stackId='single-stack' fill={theme.palette.primary.main}>
												<LabelList
													dataKey='percentage'
													position='right'
													formatter={(value: number) => {
														return value.toPrecision(3) + '%'
													}}
												/>
											</Bar>
										</BarChart>
									</ResponsiveContainer>
								</BoxRow>
							</Box>
						)
					})}
			</BoxWrapper>
		</>
	)
}
