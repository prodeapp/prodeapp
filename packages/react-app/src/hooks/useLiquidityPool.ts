import {useEthers} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {LiquidityFactory__factory, LiquidityPool__factory, LiquidityPool} from "../typechain";
import {useQuery} from "@tanstack/react-query";
import {BigNumber} from "ethers";
import {JsonRpcProvider} from "@ethersproject/providers";
import {Market} from "../graphql/subgraph";

interface MarketLiquidityInfo {
  creator: string
  creatorFee: BigNumber
  pointsToWin: Number
  totalDeposits: BigNumber
  betMultiplier: Number
  prizePool: BigNumber
}

const liquidityFactory = new Contract(process.env.REACT_APP_LIQUIDITY_FACTORY as string, LiquidityFactory__factory.createInterface());

const useMarketHasLiquidityPool = (creator: string) => {
  const {library} = useEthers();

  return useQuery<boolean, Error>(
    ["useMarketHasLiquidityPool", creator],
    async () => {
      return await liquidityFactory.connect(library as JsonRpcProvider).exists(creator)
    }, {
      enabled: typeof library !== "undefined"
    }
  );
};

export type UseLiquidityPool = MarketLiquidityInfo | false

export const useLiquidityPool = (market: Market) => {
  const {library} = useEthers();
  const {data: hasLiquidityPool} = useMarketHasLiquidityPool(market.manager.id);

  return useQuery<UseLiquidityPool, Error>(
    ["useLiquidityPool", market.id],
    async () => {

      if (!hasLiquidityPool) {
        return false
      }

      const liquidityPool = new Contract(market.manager.id, LiquidityPool__factory.createInterface()).connect(library as JsonRpcProvider) as LiquidityPool

      // TODO: use multicall
      const [creator, creatorFee, pointsToWin, totalDeposits, betMultiplier] = await Promise.all([
        liquidityPool.creator(),
        liquidityPool.creatorFee(),
        liquidityPool.pointsToWin(),
        liquidityPool.totalDeposits(),
        liquidityPool.betMultiplier(),
      ])

      const maxPayment = BigNumber.from(market.price).mul(market.numOfBets).mul(betMultiplier);

      return {
        creator,
        creatorFee,
        pointsToWin: pointsToWin.toNumber(),
        totalDeposits,
        betMultiplier: betMultiplier.toNumber(),
        prizePool: totalDeposits.lt(maxPayment) ? totalDeposits : maxPayment
      }
    },
    {
      enabled: typeof library !== "undefined" && typeof hasLiquidityPool !== 'undefined'
    }
  );
};