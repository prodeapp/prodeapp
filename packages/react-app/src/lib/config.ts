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
type StringMap = Record<number, string>

export const NETWORK_TOKEN: StringMap = {
	[NetworkId.GNOSIS]: 'xDAI',
	[NetworkId.POLYGON_TESTNET]: 'MATIC',
}

export const MARKET_FACTORY_ADDRESSES: AddressMap = {
	[NetworkId.GNOSIS]: '0x67d3673CF19a6b0Ad70D76b4e9C6f715177eb48b',
	[NetworkId.POLYGON_TESTNET]: '0xFE6bd7451E92DeddD1096430e659e8af882D2eb7',
}

export const MARKET_FACTORY_V2_ADDRESSES: AddressMap = {
	[NetworkId.GNOSIS]: '0xa0eF856337304eC1c7F39F58795b11F83251d526',
	[NetworkId.POLYGON_TESTNET]: '0xF25455008BD7a750EBFeEC73d4E64114dA9449F5',
}

export const LIQUIDITY_FACTORY_ADDRESSES: AddressMap = {
	[NetworkId.GNOSIS]: '0x0', // TODO: deploy
	[NetworkId.POLYGON_TESTNET]: '0x7E0a4B5514A47e0810Ae230BE7909e898Ffe99Ac',
}

export const MARKET_VIEW_ADDRESSES: AddressMap = {
	[NetworkId.GNOSIS]: '0xB66a6134C3164e2C797D835043006E452D6c8b7e',
	[NetworkId.POLYGON_TESTNET]: '0xeEcb9FD3fDEe596A6eeAf7037Dd1a1B3074019F7',
}

export const REALITIO_ADDRESSES: AddressMap = {
	[NetworkId.GNOSIS]: '0xe78996a233895be74a66f451f1019ca9734205cc',
	[NetworkId.POLYGON_TESTNET]: '0x92115220C28e78312cCe86f3d1dE652CFBD0357A',
}

export const CURATE_REGISTRY_ADDRESSES: AddressMap = {
	[NetworkId.GNOSIS]: '0x86E72802D9AbBF7505a889721fD4D6947B02320E',
	[NetworkId.POLYGON_TESTNET]: '0xFe33e20Da3270323e66c031AB26967cCeE25B3a2',
}

export const KEY_VALUE_ADDRESSES: AddressMap = {
	[NetworkId.GNOSIS]: '0x47C255D92F6e800312835f08f7906Bc9019a210C',
	[NetworkId.POLYGON_TESTNET]: '0xE680Dc6A28674546361531BF4CaaE190E08D6Bad',
}

export const VOUCHER_MANAGER_ADDRESSES: AddressMap = {
	[NetworkId.GNOSIS]: '0x10Df43e85261df385B2b865705738233626a21Ad',
	[NetworkId.POLYGON_TESTNET]: '0x6F00370D5CC9e50Fb47c05E0f5b4C27c58918BB6',
}

export const SVG_AD_FACTORY_ADDRESSES: AddressMap = {
	[NetworkId.GNOSIS]: '0x24C93b506768110A45Fd1a221eCd8Bd6B93Dc15c',
	[NetworkId.POLYGON_TESTNET]: '0x20755a7aAb26C571dC23B02Fe3C265ca79A80281',
}

export const FIRST_PRICE_AUCTION_ADDRESSES: AddressMap = {
	[NetworkId.GNOSIS]: '0xDcdB82E595B3c80e569EbB52C08B05f053Ad7478',
	[NetworkId.POLYGON_TESTNET]: '0x62eE718Fc940641166c921E1642c33B2e095bEf3',
}

export const MIN_BOND_VALUE: BigNumberMap = {
	[NetworkId.GNOSIS]: parseUnits('5', 18),
	[NetworkId.POLYGON_TESTNET]: parseUnits('0.0001', 18),
}
