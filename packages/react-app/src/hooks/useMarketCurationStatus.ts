import { useQuery } from "react-query";
import compareAsc from "date-fns/compareAsc";
import fromUnixTime from "date-fns/fromUnixTime";
import {useMarket} from "./useMarket";
import {isFinalized} from "../lib/helpers";
import {useEvents} from "./useEvents";
import { useCurateItem } from "./useCurateItem";

type MarketCurationStatus = 'UNVALIDATED' | 'CHALLENGE_PERIOD' | 'VALIDATED';

export const useMarketStatus = (marketId: string) => {
  const {data: market} = useMarket(marketId)
  const {data: curateItem} = useCurateItem(market? market.hash : undefined)
  return useQuery<MarketCurationStatus | '', Error>(
    ["useMarketStatus", market],
    async () => {
      
      if (!market || !curateItem) {
        return '';
      }

      
    },
    {
      enabled: !!market
    }
  );
};