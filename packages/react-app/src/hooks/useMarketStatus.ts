import { useQuery } from "react-query";
import compareAsc from "date-fns/compareAsc";
import fromUnixTime from "date-fns/fromUnixTime";
import {useMarket} from "./useMarket";
import {isFinalized} from "../lib/helpers";
import {useMatches} from "./useMatches";

type MarketStatus = 'ACCEPTING_BETS' | 'WAITING_ANSWERS' | 'WAITING_AVAILABITILY_OF_RESULTS' | 'WAITING_REGISTER_POINTS' | 'FINALIZED';

export const useMarketStatus = (marketId: string) => {
  const {data: market} = useMarket(marketId)
  const {data: matches} = useMatches(marketId)

  return useQuery<MarketStatus | '', Error>(
    ["useMarketStatus", marketId],
    async () => {
      if (!market || !matches) {
        return '';
      }

      if (compareAsc(fromUnixTime(Number(market.closingTime)), new Date()) === 1) {
        // closingTime > now
        return 'ACCEPTING_BETS';
      }

      const hasPendingAnswers = matches.filter(q => !isFinalized(q)).length > 0

      if (hasPendingAnswers) {
        return 'WAITING_ANSWERS'
      }

      if (
        /* now() > closingTime && */
        market.resultSubmissionPeriodStart === '0'
      ) {
        return 'WAITING_AVAILABITILY_OF_RESULTS';
      }

      if (
        /* market.resultSubmissionPeriodStart !== '0' && */
        compareAsc(fromUnixTime(Number(market.resultSubmissionPeriodStart) + Number(market.submissionTimeout)), new Date()) === 1
      ) {
        // resultSubmissionPeriodStart > now
        return 'WAITING_REGISTER_POINTS'
      }

      // available to claim rewards
      return 'FINALIZED';
    },
    {
      enabled: !!market && !!matches
    }
  );
};