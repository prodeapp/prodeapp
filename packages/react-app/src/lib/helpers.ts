import fromUnixTime from 'date-fns/fromUnixTime'
import format from 'date-fns/format'
import { intervalToDuration } from 'date-fns'
import formatDuration from 'date-fns/formatDuration'
import compareAsc from 'date-fns/compareAsc'
import { es, enGB } from 'date-fns/locale';
import {BigNumber, BigNumberish} from "@ethersproject/bignumber";
import {DecimalBigNumber} from "./DecimalBigNumber";
import {Event, Outcome} from "../graphql/subgraph";
import {t} from "@lingui/macro";
import {I18nContextProps} from "./types";
import {REALITY_TEMPLATE_MULTIPLE_SELECT, ANSWERED_TOO_SOON, INVALID_RESULT} from "./reality";
import { shortenAddress } from '@usedapp/core'

export const BRIDGE_URL = 'https://bridge.connext.network/?receivingChainId=100';

const dateLocales = {
  es,
  en: enGB
}

export function formatDate(timestamp: number) {
  const date = fromUnixTime(timestamp);
  return format(date, 'MMMM d yyyy, HH:mm')
}

// https://stackoverflow.com/a/72190364
export function localTimeToUtc(utcTime: Date | string | number) {
  if (typeof utcTime === 'string' || typeof utcTime === 'number') {
    utcTime = new Date(utcTime);
  }

  const tzOffset = utcTime.getTimezoneOffset() * 60000
  return new Date(utcTime.getTime() + tzOffset)
}

export function getTimeLeft(endDate: Date|string|number, withSeconds = false, locale: I18nContextProps['locale']): string | false {
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

  return formatDuration(duration, {format, locale: dateLocales[locale]});
}

export function betsClosingSoon(timestamp: number): boolean {
  const now = Math.floor(Date.now()/1000);

  const minDuration = 60 * 60 * 24 * 4; // 4 days

  return (timestamp - now) < minDuration;
}

export function formatAmount(amount: BigNumberish) {
  const number = new DecimalBigNumber(BigNumber.from(amount),18)
  return `${number.toString()} xDAI`
}

export function formatAmountDecimalPlaces(amount: BigNumberish) {
  const number = new DecimalBigNumber(BigNumber.from(amount),18)
  return `${parseFloat(number.toString()).toFixed(2)} xDAI`
}

function getMultiSelectAnswers(value: number): number[] {
  const answers = value.toString(2);
  const indexes = [];

  for(let i = 0; i < answers.length; i++) {
    if (answers[i] === '1') {
      indexes.push(answers.length - i - 1);
    }
  }

  return indexes;
}

export function getAnswerText(currentAnswer: string | null, outcomes: Outcome[], templateID: BigNumberish, noAnswerText = t`Not answered yet`): string {

  if (currentAnswer === null) {
    return noAnswerText;
  }
  if (currentAnswer === INVALID_RESULT) {
    return t`Invalid result`;
  }

  if (currentAnswer === ANSWERED_TOO_SOON) {
    return t`Answered too soon`;
  }

  if (templateID === REALITY_TEMPLATE_MULTIPLE_SELECT) {
    return getMultiSelectAnswers(BigNumber.from(currentAnswer).toNumber())
            .map(answer => transOutcome(outcomes[answer] || noAnswerText)).join(', ');
  }

  const value = BigNumber.from(currentAnswer);
  return transOutcome(outcomes[value.toNumber()] || noAnswerText);
}

export function transOutcome(outcome: string) {
  return outcome === 'Draw' ? t`Draw` : outcome;
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

type MarketCategory = {id: string, text: string, children?: MarketCategory[]}

export const MARKET_CATEGORIES: MarketCategory[] = [
  {
    id: "sports",
    text: t`Sports`,
    children: [
      {id: "football", text: t`Football`},
      {id: "basketball", text: t`Basketball`},
      {id: "tenis", text: t`Tennis`},
      {id: "esports", text: t`eSports`},
      {id: "F1", text: t`F1`},
    ]
  },
  {id: "misc", text: t`Miscellaneous`},
]

type FlattenedCategory = {id: string, text: string, isChild: boolean};

export function getFlattenedCategories(): FlattenedCategory[] {
  const data: FlattenedCategory[] = [];
  MARKET_CATEGORIES.forEach(category => {
    data.push({id: category.id, text: category.text, isChild: false});

    category.children && category.children.forEach(subcategory => {
      data.push({id: subcategory.id, text: subcategory.text, isChild: true});
    })
  })

  return data;
}

export function getSubcategories(category: string): MarketCategory[] {
  for(let cat of MARKET_CATEGORIES){
    if (cat.id === category) {
      return cat.children || [];
    }
  }

  return [];
}


export function getCategoryText(id: string): string {
  return getFlattenedCategories().filter(c => c.id === id)[0]?.text || '';
}

export function getMarketUrl(marketId: string) {
  return `${window.location.protocol}//${window.location.hostname}/#/markets/${marketId}`
}

export function getReferralKey(marketId: string) {
  return `referral_${marketId}`
}

export type IndexedObjects<T> = Record<string, T>;

export function indexObjectsByKey<T extends Record<string, any>>(objects: T[], key: string): IndexedObjects<T> {
  return objects.reduce((objs, obj) => {
    return {...objs, [obj[key]]: obj}
  }, {})
}

const documentationUrls = {
  en: 'https://prode-eth.gitbook.io/prode.eth-en',
  es: 'https://prode-eth.gitbook.io/prode.eth-es',
}

export function getDocsUrl(locale: I18nContextProps['locale']) {
  return documentationUrls[locale];
}

export function showWalletError(error: any) {
  if (error?.message) {

    if (error?.message.includes("Unsupported chain id")) {
      return t`Unsupported chain, please switch to Gnosis Chain.`;
    }

    // we use this function to return early when connected to a unsupported chain,
    // but we don't want to return early for every error that can occur (random RPC errors, etc)
    /*if (error?.message.startsWith('{')) {
      try {
        const _error = JSON.parse(error?.message);

        return _error?.message;
      } catch (e: any) {

      }
    } else {
      return error?.message;
    }*/
  }
}

export function getTwitterShareUrl(message: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
}

export function getMedalColor(position: number) {
  const medalColors = [
    '#E0BC02',
    '#FF8788',
    '#B0B0B0',
  ];

  return medalColors[position - 1] || medalColors[2]
}


export function formatPlayerName(name:string, address:string){
  if (name === address){
    return shortenAddress(address);
  }
  return name;
}