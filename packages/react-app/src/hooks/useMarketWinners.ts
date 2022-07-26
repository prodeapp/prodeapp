import {MarketPoint, useMarketPoints} from "./useMarketPoints";
import {useMarket} from "./useMarket";
import {useEffect, useMemo, useState} from "react";
import {indexObjectsByKey} from "../lib/helpers";

export function getMarketWinners(marketPoints: MarketPoint[], totalPrizes: number) {
  const winners: MarketPoint[] = [];

  let currentPointsLevel = '';

  for (let marketPoint of marketPoints) {

    if (currentPointsLevel === '') {
      currentPointsLevel = marketPoint.points
    }

    if (currentPointsLevel !== marketPoint.points) {
      if (winners.length >= totalPrizes) {
        break;
      }

      currentPointsLevel = marketPoint.points
    }

    winners.push(marketPoint);
  }

  return winners
}

export const useMarketWinners = (marketId: string) => {
  const {data: marketPoints} = useMarketPoints(marketId);
  const {data: market} = useMarket(marketId);

  const [winners, setWinners] = useState<MarketPoint[]>([]);

  useEffect(() => {
    if (!market || !marketPoints) {
      return;
    }

    setWinners(getMarketWinners(marketPoints, market.prizes.length));
  }, [market, marketPoints])

  return winners;
};

export function useIndexedMarketWinners(marketId: string) {
  const marketWinners = useMarketWinners(marketId);
  return useMemo(() => indexObjectsByKey(marketWinners || [], 'tokenID'), [marketWinners])
}