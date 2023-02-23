// https://github.com/RealityETH/reality-eth-monorepo/blob/d95a9f4ee5c96f88b07651a63b3b6bf5f0e0074d/packages/reality-eth-lib/formatters/question.js#L221
import { BigNumber } from '@ethersproject/bignumber'
import { hexlify, hexZeroPad } from '@ethersproject/bytes'
import { keccak256 } from '@ethersproject/solidity'

import { Bytes } from '@/abi/types'
import { FormEventOutcomeValue } from '@/components/Answer/AnswerForm'

export const REALITY_TEMPLATE_SINGLE_SELECT = '2'
export const REALITY_TEMPLATE_MULTIPLE_SELECT = '3'

export const INVALID_RESULT = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
export const ANSWERED_TOO_SOON = '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe'

export type MarketFactoryV2MetaDataStruct = {
	templateID: BigNumber
	openingTS: number
	title: string
	outcomes: string
	category: string
	language: string
}

export type MarketFactoryV2QuestionWithMetadata = {
	question: string
	metadata: MarketFactoryV2MetaDataStruct
}

export function encodeOutcomes(outcomes: string[]) {
	return JSON.stringify(outcomes)
		.replace(/^\[/, '')
		.replace(/\]$/, '')
}
export function encodeQuestionText(
	qtype: 'bool' | 'single-select' | 'multiple-select' | 'uint' | 'datetime',
	txt: string,
	outcomes: string[],
	category: string,
	lang?: string
) {
	let qText = JSON.stringify(txt).replace(/^"|"$/g, '')
	const delim = '\u241f'
	//console.log('using template_id', template_id);
	if (qtype === 'single-select' || qtype === 'multiple-select') {
		qText = qText + delim + encodeOutcomes(outcomes)
	}
	if (typeof lang === 'undefined' || lang === '') {
		lang = 'en_US'
	}
	qText = qText + delim + category + delim + lang
	return qText
}

export function getQuestionId(
	rawQuestionData: MarketFactoryV2QuestionWithMetadata,
	arbitrator: string,
	timeout: number,
	minBond: BigNumber,
	realitio: string,
	msgSender: string
) {
	const contentHash = keccak256(
		['uint256', 'uint32', 'string'],
		[rawQuestionData.metadata.templateID, rawQuestionData.metadata.openingTS, rawQuestionData.question]
	)

	return keccak256(
		['bytes32', 'address', 'uint32', 'uint256', 'address', 'address', 'uint256'],
		[contentHash, arbitrator, timeout, minBond, realitio, msgSender, 0]
	)
}

export function getQuestionsHash(questionIDs: string[]) {
	return keccak256(
		questionIDs.map(_ => 'bytes32'),
		questionIDs.sort((a, b) => (a > b ? 1 : -1))
	)
}

export function formatOutcome(outcome: FormEventOutcomeValue | FormEventOutcomeValue[] | ''): Bytes {
	if (outcome === '') {
		// it should never happen because this function is called within a form so the form validation should prevent it
		// we add this check anyway to simplify the usage of this function
		throw Error(`Invalid outcome`)
	}

	if (typeof outcome === 'object') {
		// multi-select

		// INVALID_RESULT and ANSWERED_TOO_SOON are incompatible with multi-select
		if (outcome.includes(INVALID_RESULT)) {
			return INVALID_RESULT
		}

		if (outcome.includes(ANSWERED_TOO_SOON)) {
			return ANSWERED_TOO_SOON
		}

		const answerChoice = (outcome as number[]).reduce((partialSum: number, value: number) => partialSum + 2 ** value, 0)
		return hexZeroPad(hexlify(answerChoice), 32) as Bytes
	}

	// single-select
	return hexZeroPad(hexlify(outcome), 32) as Bytes
}
