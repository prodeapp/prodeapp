import { parseUnits } from '@ethersproject/units'
import { expect, test } from 'vitest'

import { MarketFactoryAttributes } from '@/hooks/useMarketFactory'
import { getTxArgs, MarketFormStep1Values, MarketFormStep2Values } from '@/hooks/useMarketForm'

test('questions are sent in correct order', () => {
	const step1State: MarketFormStep1Values = {
		market: 'Test Market',
		category: 'football',
		closingTime: new Date('2023-03-14T13:01:00.000Z'),
		events: [
			{
				questionPlaceholder: 'Who will win the match between A and B at [market]?',
				openingTs: new Date('2023-03-14T14:15:00.000Z'),
				answers: [
					{
						value: 'A',
					},
					{
						value: 'B',
					},
				],
			},
			{
				questionPlaceholder: 'Who will win the match between C and D at [market]?',
				openingTs: new Date('2023-03-14T14:15:00.000Z'),
				answers: [
					{
						value: 'C',
					},
					{
						value: 'D',
					},
				],
			},
			{
				questionPlaceholder: 'Who will win the match between E and F at [market]?',
				openingTs: new Date('2023-03-14T14:15:00.000Z'),
				answers: [
					{
						value: 'E',
					},
					{
						value: 'F',
					},
				],
			},
		],
	}

	const step2State: MarketFormStep2Values = {
		prizeWeights: [
			{
				value: 50,
			},
			{
				value: 30,
			},
			{
				value: 20,
			},
		],
		prizeDivisor: 100,
		manager: '0x0000000000000000000000000000000000000000',
		managementFee: 3,
		price: 0.01,
		addLP: false,
		lpCreatorFee: 0,
		lpBetMultiplier: 0,
		lpPointsToWin: 0,
	}

	const factoryAttrs: MarketFactoryAttributes = {
		arbitrator: '0x92115220c28e78312cce86f3d1de652cfbd0357a',
		timeout: 129600,
		realitio: '0x92115220c28e78312cce86f3d1de652cfbd0357a',
		factory: '0xFE6bd7451E92DeddD1096430e659e8af882D2eb7',
	}

	const params = getTxArgs(step1State, step2State, factoryAttrs, parseUnits('0.0001', 18))

	// @ts-ignore
	expect(params[7][0].title).toEqual('Who will win the match between A and B at Test Market?')
	// @ts-ignore
	expect(params[7][1].title).toEqual('Who will win the match between E and F at Test Market?')
	// @ts-ignore
	expect(params[7][2].title).toEqual('Who will win the match between C and D at Test Market?')
})
