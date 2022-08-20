import fromUnixTime from 'date-fns/fromUnixTime'
import format from 'date-fns/format'
import { intervalToDuration } from 'date-fns'
import formatDuration from 'date-fns/formatDuration'
import compareAsc from 'date-fns/compareAsc'
import { es, enGB } from 'date-fns/locale';
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { DecimalBigNumber } from "./DecimalBigNumber";
import { Event, Outcome } from "../graphql/subgraph";
import { ANSWERED_TOO_SOON, INVALID_RESULT } from "../components/Answer/AnswerForm";
import { t } from "@lingui/macro";
import { I18nContextProps } from "./types";

export const BRIDGE_URL = 'https://bridge.connext.network/?receivingChainId=100';

const dateLocales = {
  es,
  en: enGB
}

export function formatDate(timestamp: number) {
  const date = fromUnixTime(timestamp);
  return format(date, 'MMMM d yyyy, HH:mm')
}

export function getTimeLeft(endDate: Date | string | number, withSeconds = false, locale: I18nContextProps['locale']): string | false {
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

  return formatDuration(duration, { format, locale: dateLocales[locale] });
}

export function betsClosingSoon(timestamp: number): boolean {
  const now = Math.floor(Date.now() / 1000);

  const minDuration = 60 * 60 * 24 * 4; // 4 days

  return (timestamp - now) < minDuration;
}

export function formatAmount(amount: BigNumberish) {
  const number = new DecimalBigNumber(BigNumber.from(amount), 18)
  return `${number.toString()} xDAI`
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

  if (templateID === '3') {
    function getAnswers(value: number) {
      const answers = value.toString(2)
      var indexes = [], i;
      for(i = 0; i < answers.length; i++)
        if (answers[i] === '1')
            indexes.push(answers.length - i -1);
      return indexes
    }

    const answers = getAnswers(BigNumber.from(currentAnswer).toNumber());
    const textAnswers = answers.reduce((curAnswer, answer) => curAnswer.length === 0 ? curAnswer + transOutcome(outcomes[answer] || noAnswerText) : curAnswer + ', ' + transOutcome(outcomes[answer] || noAnswerText), '')
    return textAnswers
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

type MarketCategory = { id: string, text: string, children?: MarketCategory[] }

export const MARKET_CATEGORIES: MarketCategory[] = [
  {
    id: "sports",
    text: t`Sports`,
    children: [
      { id: "football", text: t`Football` },
      { id: "basketball", text: t`Basketball` },
      { id: "tenis", text: t`Tennis` },
      { id: "esports", text: t`eSports` },
    ]
  },
  { id: "misc", text: t`Miscellaneous` },
]

type FlattenedCategory = { id: string, text: string, isChild: boolean };

export function getFlattenedCategories(): FlattenedCategory[] {
  const data: FlattenedCategory[] = [];
  MARKET_CATEGORIES.forEach(category => {
    data.push({ id: category.id, text: category.text, isChild: false });

    category.children && category.children.forEach(subcategory => {
      data.push({ id: subcategory.id, text: subcategory.text, isChild: true });
    })
  })

  return data;
}

export function getSubcategories(category: string): MarketCategory[] {
  for (let cat of MARKET_CATEGORIES) {
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
    return { ...objs, [obj[key]]: obj }
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
    if (error?.message.startsWith('{')) {
      try {
        const _error = JSON.parse(error?.message);

        return _error?.message;
      } catch (e: any) {

      }
    } else {
      return error?.message;
    }
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