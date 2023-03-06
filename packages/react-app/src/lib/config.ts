import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'
import { Address } from '@wagmi/core'

export enum NetworkId {
	GNOSIS = 100,
	POLYGON_TESTNET = 80001,
}

export const DEFAULT_CHAIN = NetworkId.GNOSIS

type AddressMap = Record<number, Address>
type BigNumberMap = Record<number, BigNumber>

export const LIQUIDITY_FACTORY_ADDRESSES: AddressMap = {
	[NetworkId.GNOSIS]: '0xB728a5DeBfDFa7eA33a26d392Fef216Fe7e3e460',
}

export const MARKET_FACTORY_ADDRESSES: AddressMap = {
	[NetworkId.GNOSIS]: '0x67d3673CF19a6b0Ad70D76b4e9C6f715177eb48b',
}

export const MARKET_FACTORY_V2_ADDRESSES: AddressMap = {
	[NetworkId.GNOSIS]: '0xa0eF856337304eC1c7F39F58795b11F83251d526',
}

export const MARKET_VIEW_ADDRESSES: AddressMap = {
	[NetworkId.GNOSIS]: '0xB66a6134C3164e2C797D835043006E452D6c8b7e',
}

export const REALITIO_ADDRESSES: AddressMap = {
	[NetworkId.GNOSIS]: '0xe78996a233895be74a66f451f1019ca9734205cc',
}

export const CURATE_REGISTRY_ADDRESSES: AddressMap = {
	[NetworkId.GNOSIS]: '0x86E72802D9AbBF7505a889721fD4D6947B02320E',
}

export const KEY_VALUE_ADDRESSES: AddressMap = {
	[NetworkId.GNOSIS]: '0x47C255D92F6e800312835f08f7906Bc9019a210C',
}

export const VOUCHER_MANAGER_ADDRESSES: AddressMap = {
	[NetworkId.GNOSIS]: '0x10Df43e85261df385B2b865705738233626a21Ad',
}

export const SVG_AD_FACTORY_ADDRESSES: AddressMap = {
	[NetworkId.GNOSIS]: '0x24C93b506768110A45Fd1a221eCd8Bd6B93Dc15c',
}

export const FIRST_PRICE_AUCTION_ADDRESSES: AddressMap = {
	[NetworkId.GNOSIS]: '0xDcdB82E595B3c80e569EbB52C08B05f053Ad7478',
}

export const MIN_BOND_VALUE: BigNumberMap = {
	[NetworkId.GNOSIS]: parseUnits('5', 18),
}
