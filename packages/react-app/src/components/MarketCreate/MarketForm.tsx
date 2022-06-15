import * as React from 'react';
import {encodeQuestionText, getQuestionId} from "../../lib/reality";
import {parseUnits} from "@ethersproject/units";
import {useCall, useContractFunction, useEthers} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {MarketFactory, MarketFactory__factory} from "../../typechain";
import {useEffect} from "react";
import Alert from "@mui/material/Alert";
import {UseFormHandleSubmit} from "react-hook-form/dist/types/form";
import {useNavigate} from "react-router-dom";
import {queryClient} from "../../lib/react-query";
import {BigNumber} from "@ethersproject/bignumber";
import {zonedTimeToUtc} from "date-fns-tz";

export const PLACEHOLDER_REGEX = /\$\d/g

export const DIVISOR = 10000;

type Answers = {value: string}[];
type PrizeWeight = {value: number};

export type MarketFormValues = {
  market: string
  events: {questionPlaceholder: string, answers: Answers}[]
  prizeWeights: PrizeWeight[]
  prizeDivisor: number
  price: number
  manager: string
  managementFee: number
  closingTime: Date
}

type EventData = {
  question: string
  answers: string[]
}

interface FormProps {
  children?: React.ReactNode;
  handleSubmit: UseFormHandleSubmit<MarketFormValues>;
}

function getEventData(
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

export default function MarketForm({children, handleSubmit}: FormProps) {

  const marketFactoryContract = new Contract(process.env.REACT_APP_MARKET_FACTORY as string, MarketFactory__factory.createInterface())

  const { state, send, events } = useContractFunction(marketFactoryContract, 'createMarket');

  const { value: arbitrator } = useCall({ contract: marketFactoryContract, method: 'arbitrator', args: [] }) || {}
  const { value: realitio } = useCall({ contract: marketFactoryContract, method: 'realitio', args: [] }) || {}
  const { value: timeout } = useCall({ contract: marketFactoryContract, method: 'QUESTION_TIMEOUT', args: [] }) || {}


  const { account, error: walletError } = useEthers();
  const navigate = useNavigate();

  useEffect(()=> {
    if (events && events[0].args.market) {
      queryClient.invalidateQueries('useMarkets');
      navigate(`/markets/${events?.[0].args.market.toLowerCase()}?new=1`);
    }
  }, [events, navigate]);

  if (!account || walletError) {
    return <Alert severity="error">{walletError?.message || 'Connect your wallet to create a market.'}</Alert>
  }

  if (!arbitrator || !realitio || !timeout) {
    return <div>Loading...</div>
  }

  const onSubmit = async (data: MarketFormValues) => {
    const utcClosingTime = zonedTimeToUtc(data.closingTime, 'UTC');
    const closingTime = Math.floor(utcClosingTime.getTime() / 1000);
    const openingTS = closingTime + 1;

    const questionsData = data.events.map(event => {
      const eventData = getEventData(event.questionPlaceholder, event.answers, data.market);
      return {
        templateID: 2,
        question: encodeQuestionText('single-select', eventData.question, eventData.answers, 'sports', 'en_US'),
        openingTS: openingTS,
      }
    })

    const minBond = parseUnits('0.5', 18); // TODO

    await send({
        marketName: data.market,
        marketSymbol: '', // TODO
      },
      closingTime,
      parseUnits(String(data.price), 18),
      Math.round(data.managementFee * DIVISOR / 100),
      data.manager,
      minBond,
      orderByQuestionId(questionsData, String(arbitrator), Number(timeout), minBond, String(realitio), process.env.REACT_APP_MARKET_FACTORY as string),
      data.prizeWeights.map(pw => Math.round(pw.value * DIVISOR / 100))
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {state.errorMessage && <Alert severity="error" sx={{mb: 2}}>{state.errorMessage}</Alert>}
      {children}
    </form>
  );
}