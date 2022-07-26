import {MarketPoint} from "../useMarketPoints";
import {getMarketWinners} from "../useMarketWinners";

it('first place tie', () => {
  const marketPoints: MarketPoint[] = [
    {tokenID: '1', points: '8'},
    {tokenID: '2', points: '8'},
    {tokenID: '3', points: '8'},
    {tokenID: '4', points: '7'},
    {tokenID: '5', points: '6'},
    {tokenID: '6', points: '5'},
  ];

  expect(getMarketWinners(marketPoints, 3)).toEqual(marketPoints.slice(0, 3));
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

  expect(getMarketWinners(marketPoints, 4)).toEqual(marketPoints.slice(0, 4));
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

  expect(getMarketWinners(marketPoints, 3)).toEqual(marketPoints.slice(0, 3));
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

  expect(getMarketWinners(marketPoints, 2)).toEqual(marketPoints.slice(0, 2));
  expect(getMarketWinners(marketPoints, 3)).toEqual(marketPoints.slice(0, 4));
  expect(getMarketWinners(marketPoints, 4)).toEqual(marketPoints.slice(0, 4));
  expect(getMarketWinners(marketPoints, 5)).toEqual(marketPoints.slice(0, 5));
});