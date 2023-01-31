import { expect, test } from 'vitest'

import validate from '@/components/Curate/schema'

const buildQuestions = (length: number) => [...Array(length).keys()].map(k => `question ${k + 1} ID`)

const SINGLE_ELIMINATION_1 = {
	description: 'Age of Empires II tournament hosted in 2022 by the German player JorDan_AoE. Playoffs predictions.',
	formats: [
		{
			type: 'single-elimination',
			questions: [
				'question 1 ID',
				'question 2 ID',
				'question 3 ID',
				'question 4 ID',
				'question 5 ID',
				'question 6 ID',
				'question 7 ID',
			],
			'extra data': {},
		},
	],
}

const GSL_1 = {
	description: 'Age of Empires II tournament hosted in 2022 by the German player JorDan_AoE. Group B predictions.',
	formats: [
		{
			type: 'gsl',
			questions: ['question 1 ID', 'question 2 ID', 'question 3 ID', 'question 4 ID', 'question 5 ID'],
			'extra data': {},
		},
	],
}

const DOUBLE_ELIMINATION_1 = {
	description: 'Age of Empires II tournament hosted in 2022 by the German player JorDan_AoE. Group B predictions.',
	formats: [
		{
			type: 'double-elimination',
			questions: [
				'question 1 ID',
				'question 2 ID',
				'question 3 ID',
				'question 4 ID',
				'question 5 ID',
				'question 6 ID',
				'question 7 ID',
			],
			'extra data': {},
		},
	],
}

const DOUBLE_ELIMINATION_2 = {
	description: 'Age of Empires II tournament hosted in 2022 by the German player JorDan_AoE. Group B predictions.',
	formats: [
		{
			type: 'double-elimination',
			questions: ['question 1 ID', 'question 2 ID', 'question 3 ID', 'question 4 ID', 'question 5 ID', 'question 6 ID'],
			'extra data': {},
		},
	],
}

const ROUND_ROBIN_1 = {
	description:
		"International men's football championship contested by the national teams of the member associations of FIFA. Includes only the group phase matches.",
	formats: [
		{
			type: 'groups',
			questions: buildQuestions(48),
			'extra data': {
				sizes: [6, 6, 6, 6, 6, 6, 6, 6],
				rounds: 3,
				names: ['Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F', 'Group G', 'Group H'],
			},
		},
	],
}

const GROUPS_1 = {
	description:
		'After the Ukraine invasion, many Russian athletes have been barred from competing in sporting events and Russia has been banned as a host to some of them. This is a mix of questions regarding said bans.',
	formats: [
		{
			type: 'groups',
			questions: ['question 1 ID', 'question 2 ID', 'question 3 ID', 'question 4 ID'],
			'extra data': {
				sizes: [4],
			},
		},
	],
}

const GROUPS_2 = {
	description: '',
	formats: [
		{
			type: 'groups',
			questions: buildQuestions(65),
			'extra data': {
				sizes: [32, 32, 1],
				names: ['First Yellow Card Holders', 'First Goal Scorers', 'Top Scorer'],
			},
		},
	],
}

const COMPLEX_1 = {
	description:
		"International men's football championship contested by the national teams of the member associations of FIFA.",
	formats: [
		// The same as the round robin example
		ROUND_ROBIN_1.formats[0],
		{
			type: 'single-elimination',
			questions: buildQuestions(64),
			'extra data': {},
		},
	],
}

const COMPLEX_2 = {
	description: '',
	formats: [
		{
			type: 'single-elimination',
			questions: ['question 1 ID', 'question 2 ID', 'question 3 ID'],
			'extra data': {},
		},
		{
			type: 'single-elimination',
			questions: ['question 4 ID', 'question 5 ID', 'question 6 ID'],
			'extra data': {},
		},
		{
			type: 'single-elimination',
			questions: ['question 7 ID', 'question 8 ID', 'question 9 ID'],
			'extra data': {},
		},
		{
			type: 'single-elimination',
			questions: ['question 10 ID', 'question 11 ID', 'question 12 ID'],
			'extra data': {},
		},
	],
}

test('test example schemas', () => {
	const tests = [
		SINGLE_ELIMINATION_1,
		GSL_1,
		DOUBLE_ELIMINATION_1,
		DOUBLE_ELIMINATION_2,
		ROUND_ROBIN_1,
		GROUPS_1,
		GROUPS_2,
		COMPLEX_1,
		COMPLEX_2,
	]

	for (const test in tests) {
		expect(validate(tests[test])).toBe(true)
	}
})
