import {encodeQuestionText, getQuestionId} from "../lib/reality";
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
  closingTime: Date
  events: {questionPlaceholder: string, answers: Answers}[]
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
  const { state, send } = useContractFunction(marketFactoryContract, 'createMarket');

  const { value: arbitrator } = useCall({ contract: marketFactoryContract, method: 'arbitrator', args: [] }) || {}
  const { value: realitio } = useCall({ contract: marketFactoryContract, method: 'realitio', args: [] }) || {}
  const { value: timeout } = useCall({ contract: marketFactoryContract, method: 'QUESTION_TIMEOUT', args: [] }) || {}

  const createMarket = async (step1State: MarketFormStep1Values, step2State: MarketFormStep2Values) => {
    const utcClosingTime = zonedTimeToUtc(step1State.closingTime, 'UTC');
    const closingTime = Math.floor(utcClosingTime.getTime() / 1000);
    const openingTS = closingTime + 1;

    const questionsData = step1State.events.map(event => {
      const eventData = getEventData(event.questionPlaceholder, event.answers, step1State.market);
      return {
        templateID: 2,
        question: encodeQuestionText('single-select', eventData.question, eventData.answers, 'sports', 'en_US'),
        openingTS: openingTS,
      }
    })

    const minBond = parseUnits('0.5', 18); // TODO

    await send({
        marketName: step1State.market,
        marketSymbol: '', // TODO
      },
      closingTime,
      parseUnits(String(step2State.price), 18),
      Math.round(step2State.managementFee * DIVISOR / 100),
      step2State.manager,
      minBond,
      orderByQuestionId(questionsData, String(arbitrator), Number(timeout), minBond, String(realitio), process.env.REACT_APP_MARKET_FACTORY as string),
      step2State.prizeWeights.map(pw => Math.round(pw.value * DIVISOR / 100))
    );
  }

  return {
    isLoading: !arbitrator || !realitio || !timeout,
    state,
    createMarket,
  }
}