import { Static, Type } from '@sinclair/typebox'
import { BigNumber } from 'ethers'

export const TIntegerString = Type.RegEx(/^([0-9])*$/)
export const TUrl = Type.String({ format: 'uri' })

export type Pool = {
	domainId: string
	name: string
	symbol: string // in the form of <TKN>-next<TKN>
	local: PoolAsset
	adopted: PoolAsset
	lpTokenAddress: string
	canonicalHash: string // hash of the domain and canonicalId, AKA "key"
	swapFee: string
	adminFee: string
	address?: string // address of the pool contract, no address if internal pool
}

export type PoolAsset = {
	address: string
	name: string
	symbol: string
	decimals: number
	index: number
	balance: BigNumber
}

export const SdkEstimateRelayerFeeParamsSchema = Type.Object({
	originDomain: TIntegerString,
	destinationDomain: TIntegerString,
	callDataGasAmount: Type.Optional(Type.Integer()),
	priceIn: Type.Optional(Type.Union([Type.Literal('native'), Type.Literal('usd')])),
	isHighPriority: Type.Optional(Type.Boolean()),
	originNativeTokenPrice: Type.Optional(Type.Number()),
	destinationNativeTokenPrice: Type.Optional(Type.Number()),
	destinationGasPrice: Type.Optional(Type.String()),
})

export type SdkEstimateRelayerFeeParams = Static<typeof SdkEstimateRelayerFeeParamsSchema>

export type ProviderCacheSchema<T> = {
	[K in keyof T]:
		| {
				btl: number
				ttl?: number
		  }
		| {
				btl?: number
				ttl: number
		  }
}

export type ProviderCacheData<T> = {
	[K in keyof T]?: {
		value: T[K]
		timestamp: number
		blockNumber: number
	}
}
