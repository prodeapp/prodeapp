import * as React from 'react';
import {encodeQuestionText} from "../../lib/reality";
import {parseUnits} from "@ethersproject/units";
import {useContractFunction, useEthers} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {TournamentFactory, TournamentFactory__factory} from "../../typechain";
import {useEffect} from "react";
import Alert from "@mui/material/Alert";
import {addresses} from "@prodeapp/contracts";
import {UseFormHandleSubmit} from "react-hook-form/dist/types/form";

export const PLACEHOLDER_REGEX = /\$\d/g

const DIVISOR = 10000;

type AnswersPlaceholder = {value: string}[];
type QuestionParams = {value: string}[];
type PrizeWeight = {value: number};

export type TournamentFormValues = {
  tournament: string
  questionPlaceholder: string
  matches: {questionParams: QuestionParams}[]
  answersPlaceholder: AnswersPlaceholder
  prizeWeights: PrizeWeight[]
  prizeDivisor: number
  price: number
  managementFee: number
  closingTime: Date
}

type MatchData = {
  question: string
  answers: string[]
}

interface FormProps {
  children?: React.ReactNode;
  handleSubmit: UseFormHandleSubmit<TournamentFormValues>;
}

function replacePlaceholders(text: string, questionParams: string[]) {
  return text.replace(
    PLACEHOLDER_REGEX,
    (match) => {
      return questionParams[Number(match.replace('$','')) -1] || match;
    }
  )
}

function getMatchData(questionParams: QuestionParams, questionPlaceholder: string, answersPlaceholder: AnswersPlaceholder): MatchData {
  return {
    question: replacePlaceholders(questionPlaceholder, questionParams.map(qp => qp.value)),
    answers: answersPlaceholder.map((answerPlaceholder, i) => {
      return replacePlaceholders(answerPlaceholder.value, questionParams.map(qp => qp.value));
    }),
  }
}

export default function TournamentForm({children, handleSubmit}: FormProps) {

  const { state, send } = useContractFunction(
    new Contract(addresses.TOURNAMENT_FACTORY_ADDRESS, TournamentFactory__factory.createInterface()) as TournamentFactory,
    'createTournament'
  );

  const { account } = useEthers();

  useEffect(() => {
    if (state.status === 'Success') {
      // TODO: redirect to tournament page
      alert('Tournament created!');
    }
  }, [state]);

  if (!account) {
    return <div>Connect your wallet to create a Tournament.</div>
  }

  const onSubmit = async (data: TournamentFormValues) => {
    const closingTime = Math.floor(data.closingTime.getTime() / 1000);
    const openingTS = closingTime + 1;

    const questionsData = data.matches.map(match => {
      const matchData = getMatchData(match.questionParams, data.questionPlaceholder, data.answersPlaceholder);
      return {
        templateID: 2,
        question: encodeQuestionText('single-select', matchData.question, matchData.answers, 'sports', 'en_US'),
        openingTS: openingTS,
      }
    })

    await send({
        tournamentName: data.tournament,
        tournamentSymbol: '', // TODO
        tournamentUri: '', // TODO
      },
      closingTime,
      parseUnits(String(data.price), 18),
      Math.round(data.managementFee * DIVISOR / 100),
      account,
      {
        arbitrator: '0x29f39de98d750eb77b5fafb31b2837f079fce222', // kleros
        timeout: 86400, // TODO
        minBond: parseUnits('7', 18),
      },
      questionsData,
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