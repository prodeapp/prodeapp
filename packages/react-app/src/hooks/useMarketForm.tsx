import {useState, useEffect} from "react";
import {encodeQuestionText, getQuestionId, REALITY_TEMPLATE_SINGLE_SELECT} from "../lib/reality";
import {parseUnits} from "@ethersproject/units";
import {useCall, useContractFunction} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {MarketFactory, MarketFactory__factory} from "../typechain";
import {BigNumber} from "@ethersproject/bignumber";
import {zonedTimeToUtc} from "date-fns-tz";

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
  manager: string
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

function orderByQuestionId(questionsData: MarketFactory.RealitioQuestionStruct[], arbitrator: string, timeout: number, minBond: BigNumber, realitio: string, marketFactory: string): MarketFactory.RealitioQuestionStruct[] {
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

const marketFactoryContract = new Contract(process.env.REACT_APP_MARKET_FACTORY as string, MarketFactory__factory.createInterface())

export default function useMarketForm() {
  const { state, send, events } = useContractFunction(marketFactoryContract, 'createMarket');

  const { value: arbitrator } = useCall({ contract: marketFactoryContract, method: 'arbitrator', args: [] }) || {}
  const { value: realitio } = useCall({ contract: marketFactoryContract, method: 'realitio', args: [] }) || {}
  const { value: timeout } = useCall({ contract: marketFactoryContract, method: 'QUESTION_TIMEOUT', args: [] }) || {}

  const [marketId, setMarketId] = useState('');

  useEffect(()=> {
    if (events && events[0].args.market) {

      setMarketId(events?.[0].args.market.toLowerCase());
    }
  }, [events]);

  const createMarket = async (step1State: MarketFormStep1Values, step2State: MarketFormStep2Values) => {
    const utcClosingTime = zonedTimeToUtc(step1State.closingTime, 'UTC');
    const closingTime = Math.floor(utcClosingTime.getTime() / 1000);

    const questionsData = step1State.events.map((event, i) => {
      const eventData = getEventData(event.questionPlaceholder, event.answers, step1State.market);
      return {
        templateID: REALITY_TEMPLATE_SINGLE_SELECT,
        question: encodeQuestionText('single-select', eventData.question, eventData.answers, step1State.category, 'en_US'),
        openingTS: Math.floor(zonedTimeToUtc(event.openingTs!, 'UTC').getTime() / 1000),
      }
    })

    const minBond = parseUnits(process.env.REACT_APP_MIN_BOND || '0.5', 18);

    await send(
      step1State.market,
      'PRODE',
      step2State.manager,
      Math.round(step2State.managementFee * DIVISOR / 100),
      closingTime - 1,
      parseUnits(String(step2State.price), 18),
      minBond,
      orderByQuestionId(questionsData, String(arbitrator), Number(timeout), minBond, String(realitio), process.env.REACT_APP_MARKET_FACTORY as string),
      step2State.prizeWeights.map(pw => Math.round(pw.value * DIVISOR / 100))
    );
  }

  return {
    isLoading: !arbitrator || !realitio || !timeout,
    state,
    createMarket,
    marketId,
  }
}