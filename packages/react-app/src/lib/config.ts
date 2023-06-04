import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'
import { Address } from '@wagmi/core'

export enum NetworkId {
	OPTIMISM = 10,
	BSC = 56,
	POLYGON = 137,
	GNOSIS = 100,
	ARBITRUM = 42161,
	POLYGON_TESTNET = 80001,
	OPTIMISM_TESTNET = 420,
}

export const DEFAULT_CHAIN = NetworkId.GNOSIS

export const GNOSIS_CHAIN_RECEIVER_ADDRESS: Address = '0xFd5300fB615fD66A7C912d2fBCA5Df71f9d79901'

type AddressMap = Record<number, Address>
type BigNumberMap = Record<number, BigNumber>
type StringMap = Record<number, string>

type AddressConfigValues = {
	MARKET_FACTORY: AddressMap
	MARKET_FACTORY_V2: AddressMap
	MARKET_VIEW: AddressMap
	REALITIO: AddressMap
	CURATE_REGISTRY: AddressMap
	KEY_VALUE: AddressMap
	SVG_AD_FACTORY: AddressMap
	FIRST_PRICE_AUCTION: AddressMap
}

type StringConfigValues = {
	NETWORK_TOKEN: StringMap
}

type BigNumberConfigValues = {
	MIN_BOND: BigNumberMap
}

const ADDRESSES_CONFIG: AddressConfigValues = {
	MARKET_FACTORY: {
		[NetworkId.GNOSIS]: '0x67d3673CF19a6b0Ad70D76b4e9C6f715177eb48b',
		[NetworkId.POLYGON_TESTNET]: '0xFE6bd7451E92DeddD1096430e659e8af882D2eb7',
	},

	MARKET_FACTORY_V2: {
		[NetworkId.GNOSIS]: '0x364Bc6fCdF1D2Ce014010aB4f479a892a8736014',
		[NetworkId.POLYGON_TESTNET]: '0xF25455008BD7a750EBFeEC73d4E64114dA9449F5',
	},

	MARKET_VIEW: {
		[NetworkId.GNOSIS]: '0xc2a5Ee5041a3E99B284A8Ca2FFeC62B4611cC3B0',
		[NetworkId.POLYGON_TESTNET]: '0x288BC7c7C18Ba359A0Cc2b89A52c30262535C9a1',
	},

	REALITIO: {
		[NetworkId.GNOSIS]: '0xe78996a233895be74a66f451f1019ca9734205cc',
		[NetworkId.POLYGON_TESTNET]: '0x92115220C28e78312cCe86f3d1dE652CFBD0357A',
	},

	CURATE_REGISTRY: {
		[NetworkId.GNOSIS]: '0x86E72802D9AbBF7505a889721fD4D6947B02320E',
		[NetworkId.POLYGON_TESTNET]: '0xFe33e20Da3270323e66c031AB26967cCeE25B3a2',
	},

	KEY_VALUE: {
		[NetworkId.GNOSIS]: '0x47C255D92F6e800312835f08f7906Bc9019a210C',
		[NetworkId.POLYGON_TESTNET]: '0xE680Dc6A28674546361531BF4CaaE190E08D6Bad',
	},

	SVG_AD_FACTORY: {
		[NetworkId.GNOSIS]: '0x24C93b506768110A45Fd1a221eCd8Bd6B93Dc15c',
		[NetworkId.POLYGON_TESTNET]: '0x20755a7aAb26C571dC23B02Fe3C265ca79A80281',
	},

	FIRST_PRICE_AUCTION: {
		[NetworkId.GNOSIS]: '0xDcdB82E595B3c80e569EbB52C08B05f053Ad7478',
		[NetworkId.POLYGON_TESTNET]: '0x62eE718Fc940641166c921E1642c33B2e095bEf3',
	},
}

const STRINGS_CONFIG: StringConfigValues = {
	NETWORK_TOKEN: {
		[NetworkId.GNOSIS]: 'xDAI',
		[NetworkId.POLYGON_TESTNET]: 'MATIC',
	},
}

const BIG_NUMBERS_CONFIG: BigNumberConfigValues = {
	MIN_BOND: {
		[NetworkId.GNOSIS]: parseUnits('5', 18),
		[NetworkId.POLYGON_TESTNET]: parseUnits('0.0001', 18),
	},
}

export const getConfigAddress = <T extends keyof AddressConfigValues>(configKey: T, chainId?: number): Address => {
	return ADDRESSES_CONFIG[configKey][filterChainId(chainId)]
}

export const getConfigString = <T extends keyof StringConfigValues>(configKey: T, chainId?: number): string => {
	return STRINGS_CONFIG[configKey][filterChainId(chainId)]
}

export const getConfigNumber = <T extends keyof BigNumberConfigValues>(configKey: T, chainId?: number): BigNumber => {
	return BIG_NUMBERS_CONFIG[configKey][filterChainId(chainId)]
}

export const filterChainId = (chainId?: number) => {
	if (chainId === NetworkId.POLYGON_TESTNET) {
		return chainId
	}

	return DEFAULT_CHAIN
}

export const isMainChain = (chainId?: number) => {
	return chainId === NetworkId.POLYGON_TESTNET || chainId === DEFAULT_CHAIN
}
