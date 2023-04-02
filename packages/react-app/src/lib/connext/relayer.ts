import { BigNumber, constants } from 'ethers'

import { ChainData } from '@/lib/connext/chainData'
import { getChainIdFromDomain } from '@/lib/connext/domain'
import { getHardcodedGasLimits } from '@/lib/connext/gas'
import { getConversionRate, getGelatoEstimatedFee } from '@/lib/connext/gelato'
import { Logger } from '@/lib/connext/logger'

const relayerBufferPercentage = 20 // 20% bump on total estimated relayer fee

export const calculateRelayerFee = async (
	params: {
		originDomain: string
		destinationDomain: string
		priceIn?: 'native' | 'usd'
		originChainId?: number
		destinationChainId?: number
		callDataGasAmount?: number
		isHighPriority?: boolean
		getGasPriceCallback?: (domain: number) => Promise<BigNumber>
		originNativeTokenPrice?: number
		destinationNativeTokenPrice?: number
		destinationGasPrice?: string
	},
	chainData: Map<string, ChainData>,
	logger?: Logger
): Promise<BigNumber> => {
	const {
		originDomain,
		destinationDomain,
		priceIn: _priceIn,
		originChainId: _originChainId,
		destinationChainId: _destinationChainId,
		callDataGasAmount,
		isHighPriority: _isHighPriority,
		getGasPriceCallback,
		originNativeTokenPrice,
		destinationNativeTokenPrice,
		destinationGasPrice,
	} = params

	const isHighPriority = _isHighPriority ?? false
	const priceIn = _priceIn ?? 'native'

	const [originChainId, destinationChainId] = await Promise.all([
		_originChainId ? Promise.resolve(_originChainId) : getChainIdFromDomain(originDomain, chainData),
		_destinationChainId ? Promise.resolve(_destinationChainId) : getChainIdFromDomain(destinationDomain, chainData),
	])

	// fetch executeGasAmount from chainData
	const { execute: executeGasAmount, executeL1: executeL1GasAmount } = await getHardcodedGasLimits(
		destinationDomain,
		chainData
	)

	const totalGasAmount = callDataGasAmount
		? Number(executeGasAmount) + Number(callDataGasAmount)
		: Number(executeGasAmount)
	const [estimatedRelayerFee, originTokenPrice, destinationTokenPrice] = await Promise.all([
		getGelatoEstimatedFee(
			destinationChainId,
			constants.AddressZero,
			Number(totalGasAmount),
			isHighPriority,
			destinationChainId == 10 ? Number(executeL1GasAmount) : undefined
		),
		originNativeTokenPrice
			? Promise.resolve(originNativeTokenPrice)
			: getConversionRate(originChainId, undefined, undefined),
		destinationNativeTokenPrice
			? Promise.resolve(destinationNativeTokenPrice)
			: getConversionRate(destinationChainId, undefined, undefined),
	])

	// fallback with passed-in gas price or with callback
	let relayerFee = estimatedRelayerFee
	if (estimatedRelayerFee.eq('0')) {
		let gasPrice = BigNumber.from(destinationGasPrice ?? 0)
		if (gasPrice.eq('0') && getGasPriceCallback) {
			try {
				gasPrice = await getGasPriceCallback(Number(params.destinationDomain))
			} catch (e) {
				if (logger) {
					return BigNumber.from(0)
				}
			}
		}
		relayerFee = estimatedRelayerFee.add(BigNumber.from(totalGasAmount).mul(gasPrice))
	}

	// add relayerFee bump to estimatedRelayerFee
	const bumpedFee = relayerFee.add(relayerFee.mul(BigNumber.from(relayerBufferPercentage)).div(100))

	if (originTokenPrice == 0 || destinationTokenPrice == 0) {
		return BigNumber.from(0)
	}

	// converstion rate is float-point number. we multiply by 1000 to be more precise
	const impactedOriginTokenPrice = Math.floor(originTokenPrice * 1000)
	const impactedDestinationTokenPrice = Math.floor(destinationTokenPrice * 1000)

	let relayerFeeFinal
	if (priceIn === 'native') {
		relayerFeeFinal = bumpedFee.mul(impactedDestinationTokenPrice).div(impactedOriginTokenPrice)
	} else {
		relayerFeeFinal = bumpedFee.mul(impactedDestinationTokenPrice).div(1000)
	}

	return relayerFeeFinal
}
