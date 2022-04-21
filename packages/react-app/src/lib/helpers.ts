import fromUnixTime from 'date-fns/fromUnixTime'
import format from 'date-fns/format'
import { intervalToDuration } from 'date-fns'
import formatDuration from 'date-fns/formatDuration'
import compareAsc from 'date-fns/compareAsc'
import {BigNumber, BigNumberish} from "@ethersproject/bignumber";
import {DecimalBigNumber} from "./DecimalBigNumber";
import {Outcome, Question} from "../graphql/subgraph";

export function formatDate(timestamp: number) {
  const date = fromUnixTime(timestamp);
  return format(date, 'MMMM d yyyy, HH:mm')
}

export function getTimeLeft(endDate: Date|string|number): string | false {
  const startDate = new Date()

  if (typeof endDate === 'number' || typeof endDate === 'string') {
    endDate = fromUnixTime(Number(endDate))
  }

  if (compareAsc(startDate, endDate) === 1) {
    return false;
  }

  const duration = intervalToDuration({ start: startDate, end: endDate })
  return formatDuration(duration, {format: ['years', 'months', 'weeks', 'days', 'hours', 'minutes']});
}

export function formatAmount(amount: BigNumberish) {
  const number = new DecimalBigNumber(BigNumber.from(amount),18)
  return `${number.toString()} xDAI`
}

export function getAnswerText(currentAnswer: string | null, outcomes: Outcome[], noAnswerText = 'Not answered yet') {
  if (currentAnswer === null) {
    return noAnswerText;
  }

  const value = BigNumber.from(currentAnswer);
  return outcomes[value.toNumber()].answer;
}

// https://github.com/RealityETH/reality-eth-monorepo/blob/34fd0601d5d6f9be0aed41278bdf0b8a1211b5fa/packages/contracts/development/contracts/RealityETH-3.0.sol#L490
export function isFinalized(question: Question) {
  const finalizeTs = Number(question.answerFinalizedTimestamp);
  return (
    !question.isPendingArbitration
    && (finalizeTs > 0)
    && (compareAsc(new Date(), fromUnixTime(finalizeTs)) === 1)
  );
}