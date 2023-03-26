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
import { filterChainId, getConfigAddress, getConfigNumber } from '@/lib/config'
import { parseEvents } from '@/lib/helpers'
import {
	encodeOutcomes,
	encodeQuestionText,
	getQuestionId,
	MarketFactoryV2MetaDataStruct,
	MarketFactoryV2QuestionWithMetadata,
	REALITY_TEMPLATE_SINGLE_SELECT,
} from '@/lib/reality'

import { useSendTx } from './useSendTx'

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
	addLP: boolean
	lpCreatorFee: number
	lpBetMultiplier: number
	lpPointsToWin: number
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
	isPrepared: boolean
	isLoading: boolean
	isSuccess: boolean
	error: Error | null
	createMarket: (step1State: MarketFormStep1Values, step2State: MarketFormStep2Values) => Promise<void>
	marketId: string
}

export function getTxArgs(
	step1State: MarketFormStep1Values,
	step2State: MarketFormStep2Values,
	factoryAttrs: MarketFactoryAttributes,
	minBond: BigNumber
) {
	const utcClosingTime = zonedTimeToUtc(step1State.closingTime, 'UTC')
	const closingTime = BigNumber.from(Math.floor(utcClosingTime.getTime() / 1000) - 1)

	const creator = step2State.manager as Address
	const creatorFee = BigNumber.from(Math.round((step2State.managementFee * DIVISOR) / 100))
	const price = parseUnits(String(step2State.price), 18)

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

	const questionsMetadata = orderByQuestionId(
		questionsData,
		String(factoryAttrs?.arbitrator),
		Number(factoryAttrs?.timeout),
		minBond,
		String(factoryAttrs?.realitio),
		factoryAttrs.factory
	)

	const prizeWeights = step2State.prizeWeights.map(pw => Math.round((pw.value * DIVISOR) / 100))

	if (step2State.addLP) {
		return [
			step1State.market,
			'PRODE',
			creatorFee,
			closingTime,
			price,
			minBond,
			questionsMetadata,
			prizeWeights,
			[
				creator,
				BigNumber.from(Math.round((step2State.lpCreatorFee * DIVISOR) / 100)),
				BigNumber.from(1000000000000 /*step2State.lpBetMultiplier*/),
				BigNumber.from(step1State.events.length /*step2State.lpPointsToWin*/),
			],
		]
	}

	return [step1State.market, 'PRODE', creator, creatorFee, closingTime, price, minBond, questionsMetadata, prizeWeights]
}

export function getTxParams(
	factoryV2Address: Address,
	step1State: MarketFormStep1Values,
	step2State: MarketFormStep2Values,
	factoryAttrs: MarketFactoryAttributes | undefined,
	minBond: BigNumber,
	prepareTx: boolean
) {
	if (!prepareTx || !factoryAttrs) {
		return {}
	}

	const functionName: 'createMarketWithLiquidityPool' | 'createMarket' = step2State.addLP
		? 'createMarketWithLiquidityPool'
		: 'createMarket'

	return {
		address: factoryV2Address,
		abi: MarketFactoryV2Abi,
		functionName,
		args: getTxArgs(step1State, step2State, factoryAttrs, minBond),
	}
}

export default function useMarketForm(
	step1State: MarketFormStep1Values,
	step2State: MarketFormStep2Values,
	prepareTx: boolean
): UseMarketFormReturn {
	const { chain } = useNetwork()
	const chainId = filterChainId(chain?.id)
	const [marketId, setMarketId] = useState<Address | ''>('')
	const { data: factoryAttrs } = useMarketFactoryAttributes()

	const minBond = getConfigNumber('MIN_BOND', chainId)

	const { isPrepared, isSuccess, error, write, receipt } = useSendTx(
		// @ts-ignore
		getTxParams(
			getConfigAddress('MARKET_FACTORY_V2', chainId),
			step1State,
			step2State,
			factoryAttrs,
			minBond,
			prepareTx
		)
	)

	useEffect(() => {
		if (receipt) {
			const ethersInterface = new Interface(MarketFactoryAbi)
			const events = parseEvents(receipt, getConfigAddress('MARKET_FACTORY', chainId), ethersInterface)
			setMarketId(events?.[0].args?.market?.toLowerCase() || '')
		}
	}, [receipt])

	const createMarket = async () => {
		write!()
	}

	return {
		isPrepared,
		isLoading: !factoryAttrs?.arbitrator || !factoryAttrs?.realitio || !factoryAttrs?.timeout,
		isSuccess,
		error,
		createMarket,
		marketId,
	}
}
