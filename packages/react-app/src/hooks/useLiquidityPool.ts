import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { Address, readContract, readContracts } from '@wagmi/core'
import { BigNumber } from 'ethers'
import { useNetwork } from 'wagmi'

import { LiquidityFactoryAbi } from '@/abi/LiquidityFactory'
import { LiquidityPoolAbi } from '@/abi/LiquidityPool'
import { Market } from '@/graphql/subgraph'
import { DEFAULT_CHAIN, LIQUIDITY_FACTORY_ADDRESSES } from '@/lib/config'

export type LiquidityPool =
	| {
			creator: string
			creatorFee: number
			pointsToWin: number
			totalDeposits: BigNumber
			betMultiplier: number
			prizePool: BigNumber
	  }
	| false

const useMarketHasLiquidityPool = (creator: Address) => {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()
	return useQuery<boolean, Error>(['useMarketHasLiquidityPool', creator, chain.id], async () => {
		return await readContract({
			abi: LiquidityFactoryAbi,
			address: LIQUIDITY_FACTORY_ADDRESSES[chain.id],
			functionName: 'exists',
			args: [creator],
		})
	})
}

type UseLiquidityPool = (market: Market) => UseQueryResult<LiquidityPool, Error>
export const useLiquidityPool: UseLiquidityPool = (market: Market) => {
	const { data: hasLiquidityPool } = useMarketHasLiquidityPool(market.manager.id as Address)

	return useQuery<LiquidityPool, Error>(
		['useLiquidityPool', market.id],
		async () => {
			if (!hasLiquidityPool) {
				return false
			}

			const [creator, creatorFee, pointsToWin, totalDeposits, betMultiplier] = await readContracts({
				contracts: [
					{
						abi: LiquidityPoolAbi,
						address: market.manager.id as Address,
						functionName: 'creator',
					},
					{
						abi: LiquidityPoolAbi,
						address: market.manager.id as Address,
						functionName: 'creatorFee',
					},
					{
						abi: LiquidityPoolAbi,
						address: market.manager.id as Address,
						functionName: 'pointsToWin',
					},
					{
						abi: LiquidityPoolAbi,
						address: market.manager.id as Address,
						functionName: 'totalDeposits',
					},
					{
						abi: LiquidityPoolAbi,
						address: market.manager.id as Address,
						functionName: 'betMultiplier',
					},
				],
			})

			const maxPayment = BigNumber.from(market.price)
				.mul(market.numOfBets)
				.mul(betMultiplier)

			return {
				creator,
				creatorFee: creatorFee.toNumber(),
				pointsToWin: pointsToWin.toNumber(),
				totalDeposits,
				betMultiplier: betMultiplier.toNumber(),
				prizePool: totalDeposits.lt(maxPayment) ? totalDeposits : maxPayment,
			}
		},
		{
			enabled: typeof hasLiquidityPool !== 'undefined',
		}
	)
}
