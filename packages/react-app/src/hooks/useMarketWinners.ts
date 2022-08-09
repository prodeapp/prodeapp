import {MarketPoint, useMarketPoints} from "./useMarketPoints";
import {useMarket} from "./useMarket";
import {useEffect, useMemo, useState} from "react";
import {indexObjectsByKey} from "../lib/helpers";

export interface RankedWinners extends MarketPoint {
  ranking: number
  prizes: number[]
}

export function getMarketWinners(marketPoints: MarketPoint[], totalPrizes: number) : RankedWinners[] {
  const winners: RankedWinners[] = [];

  let currentPointsLevel = '';
  let currentPrizeLevel = 1;
  let currentRanking = 1;
  let rankingPrizes: Array<number[]> = [[]]; // initialize ranking[0]

  for (let marketPoint of marketPoints) {

    if (currentPointsLevel === '') {
      currentPointsLevel = marketPoint.points
    }

    if (currentPointsLevel !== marketPoint.points) {
      if (winners.length >= totalPrizes) {
        break;
      }

      currentPointsLevel = marketPoint.points
      currentRanking++;
    }

    if (!rankingPrizes[currentRanking]) {
      rankingPrizes[currentRanking] = [];
    }

    const tmpPrizeLevel = Math.min(totalPrizes, currentPrizeLevel++);
    if (!rankingPrizes[currentRanking].includes(tmpPrizeLevel)) {
      rankingPrizes[currentRanking].push(tmpPrizeLevel);
    }

    winners.push(Object.assign({ranking: currentRanking, prizes: []}, marketPoint));
  }

  return winners.map(winner => {
    winner.prizes = rankingPrizes[winner.ranking]

    return winner;
  })
}

export const useMarketWinners = (marketId: string) => {
  const {data: marketPoints} = useMarketPoints(marketId);
  const {data: market} = useMarket(marketId);

  const [winners, setWinners] = useState<RankedWinners[]>([]);

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