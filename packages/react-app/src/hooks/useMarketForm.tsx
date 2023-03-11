import { Interface } from '@ethersproject/abi'
import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'
import { Address } from '@wagmi/core'
import { zonedTimeToUtc } from 'date-fns-tz'
import { useEffect, useState } from 'react'
import { useNetwork } from 'wagmi'

import { MarketFactoryAbi } from '@/abi/MarketFactory'
import { MarketFactoryV2Abi } from '@/abi/MarketFactoryV2'
import { MarketFactoryAttributes, useMarketFactoryAttributes } from '@/hooks/useMarketFactory'
import { DEFAULT_CHAIN, MARKET_FACTORY_ADDRESSES, MARKET_FACTORY_V2_ADDRESSES, MIN_BOND_VALUE } from '@/lib/config'
import { parseEvents } from '@/lib/helpers'
import {
	encodeOutcomes,
	encodeQuestionText,
	getQuestionId,
	MarketFactoryV2MetaDataStruct,
	MarketFactoryV2QuestionWithMetadata,
	REALITY_TEMPLATE_SINGLE_SELECT,
} from '@/lib/reality'

import { useSendRecklessTx } from './useSendTx'

export const PLACEHOLDER_REGEX = /\$\d/g

export const DIVISOR = 10000

type Answers = { value: string }[]
type PrizeWeight = { value: number }

export type MarketFormStep1Values = {
	market: string
	category: string
	closingTime: Date
	events: {
		questionPlaceholder: string
		openingTs: Date | null
		answers: Answers
	}[]
}

export type MarketFormStep2Values = {
	prizeWeights: PrizeWeight[]
	prizeDivisor: number
	price: number
	manager: Address | ''
	managementFee: number
}

type EventData = {
	question: string
	answers: string[]
}

export function getEventData(questionPlaceholder: string, answers: Answers, marketName: string): EventData {
	return {
		question: questionPlaceholder.replace('[market]', marketName),
		answers: answers.map(answerPlaceholder => answerPlaceholder.value),
	}
}

function orderByQuestionId(
	rawQuestionsData: MarketFactoryV2QuestionWithMetadata[],
	arbitrator: string,
	timeout: number,
	minBond: BigNumber,
	realitio: string,
	marketFactory: string
): MarketFactoryV2MetaDataStruct[] {
	const questionsDataWithQuestionId = rawQuestionsData.map(rawQuestionData => {
		return {
			questionId: getQuestionId(rawQuestionData, arbitrator, timeout, minBond, realitio, marketFactory),
			metadata: rawQuestionData.metadata,
		}
	})

	return questionsDataWithQuestionId.sort((a, b) => (a.questionId > b.questionId ? 1 : -1)).map(qd => qd.metadata)
}

interface UseMarketFormReturn {
	isLoading: boolean
	isSuccess: boolean
	error: Error | null
	createMarket: (step1State: MarketFormStep1Values, step2State: MarketFormStep2Values) => Promise<void>
	marketId: string
}

export function getTxParams(
	step1State: MarketFormStep1Values,
	step2State: MarketFormStep2Values,
	factoryAttrs: MarketFactoryAttributes,
	minBond: BigNumber
) {
	const utcClosingTime = zonedTimeToUtc(step1State.closingTime, 'UTC')
	const closingTime = Math.floor(utcClosingTime.getTime() / 1000)

	const questionsData: MarketFactoryV2QuestionWithMetadata[] = step1State.events.map(event => {
		const eventData = getEventData(event.questionPlaceholder, event.answers, step1State.market)
		return {
			question: encodeQuestionText(
				'single-select',
				eventData.question,
				eventData.answers,
				step1State.category,
				'en_US'
			),
			metadata: {
				templateID: BigNumber.from(REALITY_TEMPLATE_SINGLE_SELECT),
				openingTS: Math.floor(zonedTimeToUtc(event.openingTs!, 'UTC').getTime() / 1000),
				title: eventData.question,
				outcomes: encodeOutcomes(eventData.answers),
				category: step1State.category,
				language: 'en_US',
			},
		}
	})

	return [
		step1State.market,
		'PRODE',
		step2State.manager as Address,
		BigNumber.from(Math.round((step2State.managementFee * DIVISOR) / 100)),
		BigNumber.from(closingTime - 1),
		parseUnits(String(step2State.price), 18),
		minBond,
		orderByQuestionId(
			questionsData,
			String(factoryAttrs?.arbitrator),
			Number(factoryAttrs?.timeout),
			minBond,
			String(factoryAttrs?.realitio),
			factoryAttrs.factory
		),
		step2State.prizeWeights.map(pw => Math.round((pw.value * DIVISOR) / 100)),
	]
}

export default function useMarketForm(): UseMarketFormReturn {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()
	const [marketId, setMarketId] = useState<Address | ''>('')
	const { data: factoryAttrs } = useMarketFactoryAttributes()

	const { isSuccess, error, write, receipt } = useSendRecklessTx({
		address: MARKET_FACTORY_V2_ADDRESSES[chain.id as keyof typeof MARKET_FACTORY_V2_ADDRESSES],
		abi: MarketFactoryV2Abi,
		functionName: 'createMarket',
	})

	useEffect(() => {
		if (receipt) {
			const ethersInterface = new Interface(MarketFactoryAbi)
			const events = parseEvents(
				receipt,
				MARKET_FACTORY_ADDRESSES[chain.id as keyof typeof MARKET_FACTORY_ADDRESSES],
				ethersInterface
			)
			setMarketId(events?.[0].args?.market?.toLowerCase() || '')
		}
	}, [receipt])

	const createMarket = async (step1State: MarketFormStep1Values, step2State: MarketFormStep2Values) => {
		const minBond = MIN_BOND_VALUE[chain.id as keyof typeof MIN_BOND_VALUE]

		write!({
			recklesslySetUnpreparedArgs: getTxParams(step1State, step2State, factoryAttrs!, minBond),
		})
	}

	return {
		isLoading: !factoryAttrs?.arbitrator || !factoryAttrs?.realitio || !factoryAttrs?.timeout,
		isSuccess,
		error,
		createMarket,
		marketId,
	}
}
