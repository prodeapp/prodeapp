import fromUnixTime from 'date-fns/fromUnixTime'
import format from 'date-fns/format'
import { intervalToDuration } from 'date-fns'
import formatDuration from 'date-fns/formatDuration'
import compareAsc from 'date-fns/compareAsc'
import {BigNumber, BigNumberish} from "@ethersproject/bignumber";
import {DecimalBigNumber} from "./DecimalBigNumber";
import {Event, Outcome} from "../graphql/subgraph";
import {INVALID_RESULT} from "../components/Questions/QuestionsForm";
import {t} from "@lingui/macro";
export function formatDate(timestamp: number) {
  const date = fromUnixTime(timestamp);
  return format(date, 'MMMM d yyyy, HH:mm')
}

export function getTimeLeft(endDate: Date|string|number, withSeconds = false): string | false {
  const startDate = new Date()

  if (typeof endDate === 'number' || typeof endDate === 'string') {
    endDate = fromUnixTime(Number(endDate))
  }

  if (compareAsc(startDate, endDate) === 1) {
    return false;
  }

  const duration = intervalToDuration({ start: startDate, end: endDate })

  const format = ['years', 'months', 'weeks', 'days', 'hours']

  if (withSeconds) {
    format.push('minutes', 'seconds');
  } else if (Number(duration.days) < 1) {
    format.push('minutes');
  }

  return formatDuration(duration, {format});
}

export function formatAmount(amount: BigNumberish) {
  const number = new DecimalBigNumber(BigNumber.from(amount),18)
  return `${number.toString()} xDAI`
}

export function getAnswerText(currentAnswer: string | null, outcomes: Outcome[], noAnswerText = t`Not answered yet`) {
  if (currentAnswer === null) {
    return noAnswerText;
  }

  if (currentAnswer === INVALID_RESULT) {
    return t`Invalid result`;
  }

  const value = BigNumber.from(currentAnswer);
  return outcomes[value.toNumber()] || noAnswerText;
}

// https://github.com/RealityETH/reality-eth-monorepo/blob/34fd0601d5d6f9be0aed41278bdf0b8a1211b5fa/packages/contracts/development/contracts/RealityETH-3.0.sol#L490
export function isFinalized(event: Event) {
  const finalizeTs = Number(event.answerFinalizedTimestamp);
  return (
    !event.isPendingArbitration
    && (finalizeTs > 0)
    && (compareAsc(new Date(), fromUnixTime(finalizeTs)) === 1)
  );
}

export const MARKET_CATEGORIES: {id: string, text: string}[] = [
  {id: "arts", text: "Arts"},
  {id: "business-finance", text: "Business & Finance"},
  {id: "cryptocurrency", text: "Cryptocurrency"},
  {id: "news-politics", text: "News & Politics"},
  {id: "science-tech", text: "Science & Tech"},
  {id: "sports", text: "Sports"},
  {id: "weather", text: "Weather"},
  {id: "misc", text: "Miscellaneous"},
]

export function getCategoryText(id: string): string {
  return MARKET_CATEGORIES.filter(c => c.id === id)[0].text;
}

export function getMarketUrl(marketId: string) {
  return `${window.location.protocol}//${window.location.hostname}/#/markets/${marketId}`
}

export function getReferralKey(marketId: string) {
  return `referral_${marketId}`
}