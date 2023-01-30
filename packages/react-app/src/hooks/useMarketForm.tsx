import {
  encodeQuestionText,
  getQuestionId,
  MarketFactoryRealityQuestionStruct,
  REALITY_TEMPLATE_SINGLE_SELECT
} from "../lib/reality";
import {parseUnits} from "@ethersproject/units";
import {BigNumber} from "@ethersproject/bignumber";
import {zonedTimeToUtc} from "date-fns-tz";
import {Address} from "@wagmi/core";
import {useContractReads} from "wagmi";
import {MarketFactoryAbi} from "../abi/MarketFactory";
import {useEffect, useState} from "react";
import {Interface} from "@ethersproject/abi";
import {useSendRecklessTx} from "./useSendTx";

export const PLACEHOLDER_REGEX = /\$\d/g

export const DIVISOR = 10000;

type Answers = {value: string}[];
type PrizeWeight = {value: number};

export type MarketFormStep1Values = {
  market: string
  category: string
  closingTime: Date
  events: {questionPlaceholder: string, openingTs: Date | null, answers: Answers}[]
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

export function getEventData(
  questionPlaceholder: string,
  answers: Answers,
  marketName: string
): EventData {
  return {
    question: questionPlaceholder.replace('[market]', marketName),
    answers: answers.map((answerPlaceholder, i) => answerPlaceholder.value),
  }
}

function orderByQuestionId(questionsData: MarketFactoryRealityQuestionStruct[], arbitrator: string, timeout: number, minBond: BigNumber, realitio: string, marketFactory: string): MarketFactoryRealityQuestionStruct[] {
  const questionsDataWithQuestionId = questionsData.map(questionData => {
    return {
      questionId: getQuestionId(questionData, arbitrator, timeout, minBond, realitio, marketFactory),
      questionData
    }
  })

  return questionsDataWithQuestionId
    .sort((a, b) => a.questionId > b.questionId ? 1 : -1)
    .map(qd => qd.questionData)
}

interface UseMarketFormReturn {
  isLoading: boolean
  isSuccess: boolean
  error: Error | null
  createMarket: (step1State: MarketFormStep1Values, step2State: MarketFormStep2Values) => Promise<void>
  marketId: string
}

export default function useMarketForm(): UseMarketFormReturn {
  const [marketId, setMarketId] = useState<Address | ''>('')

  const { isSuccess, error, write, receipt } = useSendRecklessTx({
    address: import.meta.env.VITE_MARKET_FACTORY as Address,
    abi: MarketFactoryAbi,
    functionName: 'createMarket',
  })

  useEffect(() => {
    if (receipt) {
      const ethersInterface = new Interface(MarketFactoryAbi);
      const events = receipt.logs.map(i => ethersInterface.parseLog(i))
      setMarketId(events?.[0].args?.market?.toLowerCase() || '')
    }
  }, [receipt])

  const {data} = useContractReads({
    contracts: [
      {
        address: import.meta.env.VITE_MARKET_FACTORY as Address,
        abi: MarketFactoryAbi,
        functionName: 'arbitrator',
      },
      {
        address: import.meta.env.VITE_MARKET_FACTORY as Address,
        abi: MarketFactoryAbi,
        functionName: 'realitio',
      },
      {
        address: import.meta.env.VITE_MARKET_FACTORY as Address,
        abi: MarketFactoryAbi,
        functionName: 'QUESTION_TIMEOUT',
      },
    ]
  })

  const [arbitrator, realitio, timeout] = [data?.[0] || '', data?.[1] || '', data?.[2] || 0]

  const createMarket = async (step1State: MarketFormStep1Values, step2State: MarketFormStep2Values) => {
    const utcClosingTime = zonedTimeToUtc(step1State.closingTime, 'UTC');
    const closingTime = Math.floor(utcClosingTime.getTime() / 1000);

    const questionsData = step1State.events.map((event, i) => {
      const eventData = getEventData(event.questionPlaceholder, event.answers, step1State.market);
      return {
        templateID: BigNumber.from(REALITY_TEMPLATE_SINGLE_SELECT),
        question: encodeQuestionText('single-select', eventData.question, eventData.answers, step1State.category, 'en_US'),
        openingTS: Math.floor(zonedTimeToUtc(event.openingTs!, 'UTC').getTime() / 1000),
      }
    })

    const minBond = parseUnits(import.meta.env.VITE_MIN_BOND || '0.5', 18);

    write!({
      recklesslySetUnpreparedArgs: [
        step1State.market,
        'PRODE',
        step2State.manager as Address,
        BigNumber.from(Math.round(step2State.managementFee * DIVISOR / 100)),
        BigNumber.from(closingTime - 1),
        parseUnits(String(step2State.price), 18),
        minBond,
        orderByQuestionId(questionsData, String(arbitrator), Number(timeout), minBond, String(realitio), import.meta.env.VITE_MARKET_FACTORY as Address),
        step2State.prizeWeights.map(pw => Math.round(pw.value * DIVISOR / 100))
      ]
    });
  }

  return {
    isLoading: !arbitrator || !realitio || !timeout,
    isSuccess,
    error,
    createMarket,
    marketId,
  }
}