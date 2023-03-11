import { BigNumber } from '@ethersproject/bignumber'
import { Address } from '@wagmi/core'
import { expect, test } from 'vitest'

import { Event, Outcome } from '@/graphql/subgraph'
import { getDoubleEliminationMatches } from '@/lib/brackets'

function getMockEvent(id: Address, title: string, outcomes: Outcome[]): Event {
	return {
		id: id,
		title: title,
		answer: null,
		outcomes: outcomes,
		openingTs: 0,
		answerFinalizedTimestamp: 0,
		isPendingArbitration: false,
		minBond: BigNumber.from('0'),
		lastBond: BigNumber.from('0'),
		bounty: BigNumber.from('0'),
		arbitrator: '0x0',
		category: '',
		timeout: 0,
		templateID: '2',
	}
}

test('builds a 4 team double elimination bracket', () => {
	const events: Event[] = [
		getMockEvent('0x1', 'Who will win the match between Argentina and Brazil?', ['Argentina', 'Brazil']),
		getMockEvent('0x2', 'Who will win the match between Italy and Spain?', ['Italy', 'Spain']),
		getMockEvent('0x3', 'Who will win the match between Argentina and Italy?', ['Argentina', 'Italy']),
		getMockEvent('0x4', 'Who will win the match between Argentina and Brazil?', ['Argentina', 'Brazil']),
		getMockEvent('0x5', 'Who will win the match between Brazil and Spain?', ['Brazil', 'Spain']),
		getMockEvent('0x6', 'Who will win the match between Italy and Brazil?', ['Brazil', 'Italy']),
	]

	const matches = {
		upper: [
			{
				eventTitle: 'Who will win the match between Argentina and Brazil?',
				id: '0x1',
				nextMatchId: '0x3',
				nextLooserMatchId: '0x5',
				startTime: '',
				tournamentRoundText: '',
				state: 'SCHEDULED',
				participants: [
					{
						id: 'Argentina',
						resultText: '',
						isWinner: false,
						status: 'PLAYED',
						name: 'Argentina',
					},
					{
						id: 'Brazil',
						resultText: '',
						isWinner: false,
						status: 'PLAYED',
						name: 'Brazil',
					},
				],
			},
			{
				eventTitle: 'Who will win the match between Italy and Spain?',
				id: '0x2',
				nextMatchId: '0x3',
				nextLooserMatchId: '0x5',
				startTime: '',
				tournamentRoundText: '',
				state: 'SCHEDULED',
				participants: [
					{
						id: 'Italy',
						resultText: '',
						isWinner: false,
						status: 'PLAYED',
						name: 'Italy',
					},
					{
						id: 'Spain',
						resultText: '',
						isWinner: false,
						status: 'PLAYED',
						name: 'Spain',
					},
				],
			},
			{
				eventTitle: 'Who will win the match between Argentina and Italy?',
				id: '0x3',
				nextMatchId: '0x4',
				nextLooserMatchId: '0x6',
				startTime: '',
				tournamentRoundText: '',
				state: 'SCHEDULED',
				participants: [
					{
						id: 'Argentina',
						resultText: '',
						isWinner: false,
						status: 'PLAYED',
						name: 'Argentina',
					},
					{
						id: 'Italy',
						resultText: '',
						isWinner: false,
						status: 'PLAYED',
						name: 'Italy',
					},
				],
			},
			{
				eventTitle: 'Who will win the match between Argentina and Brazil?',
				id: '0x4',
				nextMatchId: null,
				nextLooserMatchId: undefined,
				startTime: '',
				tournamentRoundText: '',
				state: 'SCHEDULED',
				participants: [
					{
						id: 'Argentina',
						resultText: '',
						isWinner: false,
						status: 'PLAYED',
						name: 'Argentina',
					},
					{
						id: 'Brazil',
						resultText: '',
						isWinner: false,
						status: 'PLAYED',
						name: 'Brazil',
					},
				],
			},
		],
		lower: [
			{
				eventTitle: 'Who will win the match between Brazil and Spain?',
				id: '0x5',
				nextMatchId: '0x6',
				nextLooserMatchId: undefined,
				startTime: '',
				tournamentRoundText: '',
				state: 'SCHEDULED',
				participants: [
					{
						id: 'Brazil',
						resultText: '',
						isWinner: false,
						status: 'PLAYED',
						name: 'Brazil',
					},
					{
						id: 'Spain',
						resultText: '',
						isWinner: false,
						status: 'PLAYED',
						name: 'Spain',
					},
				],
			},
			{
				eventTitle: 'Who will win the match between Italy and Brazil?',
				id: '0x6',
				nextMatchId: '0x4',
				nextLooserMatchId: undefined,
				startTime: '',
				tournamentRoundText: '',
				state: 'SCHEDULED',
				participants: [
					{
						id: 'Brazil',
						resultText: '',
						isWinner: false,
						status: 'PLAYED',
						name: 'Brazil',
					},
					{
						id: 'Italy',
						resultText: '',
						isWinner: false,
						status: 'PLAYED',
						name: 'Italy',
					},
				],
			},
		],
	}

	expect(getDoubleEliminationMatches(events)).toEqual(matches)
})
