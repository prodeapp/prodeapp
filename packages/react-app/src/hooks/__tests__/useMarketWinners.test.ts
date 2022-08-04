import {MarketPoint} from "../useMarketPoints";
import {getMarketWinners, RankedWinners} from "../useMarketWinners";

it('first place tie', () => {
  const marketPoints: MarketPoint[] = [
    {tokenID: '1', points: '8'},
    {tokenID: '2', points: '8'},
    {tokenID: '3', points: '8'},
    {tokenID: '4', points: '7'},
    {tokenID: '5', points: '6'},
    {tokenID: '6', points: '5'},
  ];

  const rankedWinners: RankedWinners[] = [
    {tokenID: '1', points: '8', ranking: 1},
    {tokenID: '2', points: '8', ranking: 1},
    {tokenID: '3', points: '8', ranking: 1},
  ];

  expect(getMarketWinners(marketPoints, 3)).toEqual(rankedWinners);
});

it('first place tie + second place', () => {
  const marketPoints: MarketPoint[] = [
    {tokenID: '1', points: '8'},
    {tokenID: '2', points: '8'},
    {tokenID: '3', points: '8'},
    {tokenID: '4', points: '7'},
    {tokenID: '5', points: '6'},
    {tokenID: '6', points: '5'},
  ];

  const rankedWinners: RankedWinners[] = [
    {tokenID: '1', points: '8', ranking: 1},
    {tokenID: '2', points: '8', ranking: 1},
    {tokenID: '3', points: '8', ranking: 1},
    {tokenID: '4', points: '7', ranking: 2},
  ];

  expect(getMarketWinners(marketPoints, 4)).toEqual(rankedWinners);
});

it('first place + second place + third place', () => {
  const marketPoints: MarketPoint[] = [
    {tokenID: '1', points: '8'},
    {tokenID: '2', points: '7'},
    {tokenID: '3', points: '6'},
    {tokenID: '4', points: '5'},
    {tokenID: '5', points: '4'},
    {tokenID: '6', points: '3'},
  ];

  const rankedWinners: RankedWinners[] = [
    {tokenID: '1', points: '8', ranking: 1},
    {tokenID: '2', points: '7', ranking: 2},
    {tokenID: '3', points: '6', ranking: 3},
  ];

  expect(getMarketWinners(marketPoints, 3)).toEqual(rankedWinners);
});

it('first place tie + second place tie + third place', () => {
  const marketPoints: MarketPoint[] = [
    {tokenID: '1', points: '8'},
    {tokenID: '2', points: '8'},
    {tokenID: '3', points: '7'},
    {tokenID: '4', points: '7'},
    {tokenID: '5', points: '6'},
    {tokenID: '6', points: '5'},
  ];

  const rankedWinners1: RankedWinners[] = [
    {tokenID: '1', points: '8', ranking: 1},
    {tokenID: '2', points: '8', ranking: 1},
  ];

  expect(getMarketWinners(marketPoints, 2)).toEqual(rankedWinners1);

  const rankedWinners2: RankedWinners[] = [
    {tokenID: '1', points: '8', ranking: 1},
    {tokenID: '2', points: '8', ranking: 1},
    {tokenID: '3', points: '7', ranking: 2},
    {tokenID: '4', points: '7', ranking: 2},
  ];

  expect(getMarketWinners(marketPoints, 3)).toEqual(rankedWinners2);

  expect(getMarketWinners(marketPoints, 4)).toEqual(rankedWinners2);

  const rankedWinners3: RankedWinners[] = [
    {tokenID: '1', points: '8', ranking: 1},
    {tokenID: '2', points: '8', ranking: 1},
    {tokenID: '3', points: '7', ranking: 2},
    {tokenID: '4', points: '7', ranking: 2},
    {tokenID: '5', points: '6', ranking: 3},
  ];

  expect(getMarketWinners(marketPoints, 5)).toEqual(rankedWinners3);
});