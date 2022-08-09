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
    {tokenID: '1', points: '8', ranking: 1, prizes: [1, 2, 3]},
    {tokenID: '2', points: '8', ranking: 1, prizes: [1, 2, 3]},
    {tokenID: '3', points: '8', ranking: 1, prizes: [1, 2, 3]},
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
    {tokenID: '1', points: '8', ranking: 1, prizes: [1, 2, 3]},
    {tokenID: '2', points: '8', ranking: 1, prizes: [1, 2, 3]},
    {tokenID: '3', points: '8', ranking: 1, prizes: [1, 2, 3]},
    {tokenID: '4', points: '7', ranking: 2, prizes: [4]},
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
    {tokenID: '1', points: '8', ranking: 1, prizes: [1]},
    {tokenID: '2', points: '7', ranking: 2, prizes: [2]},
    {tokenID: '3', points: '6', ranking: 3, prizes: [3]},
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

  const rankedWinners: RankedWinners[] = [
    {tokenID: '1', points: '8', ranking: 1, prizes: [1, 2]},
    {tokenID: '2', points: '8', ranking: 1, prizes: [1, 2]},
  ];

  expect(getMarketWinners(marketPoints, 2)).toEqual(rankedWinners);
});

it('first place tie + second place tie', () => {
  const marketPoints: MarketPoint[] = [
    {tokenID: '1', points: '8'},
    {tokenID: '2', points: '8'},
    {tokenID: '3', points: '7'},
    {tokenID: '4', points: '7'},
    {tokenID: '5', points: '6'},
    {tokenID: '6', points: '5'},
  ];

  const rankedWinners: RankedWinners[] = [
    {tokenID: '1', points: '8', ranking: 1, prizes: [1, 2]},
    {tokenID: '2', points: '8', ranking: 1, prizes: [1, 2]},
    {tokenID: '3', points: '7', ranking: 2, prizes: [3]},
    {tokenID: '4', points: '7', ranking: 2, prizes: [3]},
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

  const rankedWinners: RankedWinners[] = [
    {tokenID: '1', points: '8', ranking: 1, prizes: [1, 2]},
    {tokenID: '2', points: '8', ranking: 1, prizes: [1, 2]},
    {tokenID: '3', points: '7', ranking: 2, prizes: [3, 4]},
    {tokenID: '4', points: '7', ranking: 2, prizes: [3, 4]},
  ];

  expect(getMarketWinners(marketPoints, 4)).toEqual(rankedWinners);
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

  const rankedWinners4: RankedWinners[] = [
    {tokenID: '1', points: '8', ranking: 1, prizes: [1, 2]},
    {tokenID: '2', points: '8', ranking: 1, prizes: [1, 2]},
    {tokenID: '3', points: '7', ranking: 2, prizes: [3, 4]},
    {tokenID: '4', points: '7', ranking: 2, prizes: [3, 4]},
    {tokenID: '5', points: '6', ranking: 3, prizes: [5]},
  ];

  expect(getMarketWinners(marketPoints, 5)).toEqual(rankedWinners4);
});