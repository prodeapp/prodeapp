import { BigNumber } from 'ethers'
import interval from 'interval-promise'

import { axiosGet } from '@/lib/connext/axios'
import { jsonifyError } from '@/lib/connext/errors'
import { Logger } from '@/lib/connext/logger'

export const GELATO_SERVER = 'https://relay.gelato.digital'

const EquivalentChainsForGelato: Record<number, number> = {
	4: 1, // rinkeby
	5: 1, // goerli
	1337: 1, // local chain
	1338: 1, // local chain
	13337: 1, // local chain
	13338: 1, // local chain
	420: 1, //  optimism-goerli
	80001: 137, // mumbai (polygon testnet)
	421613: 1, // arbitrum-goerli
	10200: 100, // chiado (gnosis testnet)
	97: 56, // chapel (bnb testnet)
}

export const getGelatoEstimatedFee = async (
	_chainId: number,
	paymentToken: string,
	gasLimit: number,
	isHighPriority: boolean,
	gasLimitL1?: number,
	logger?: Logger
): Promise<BigNumber> => {
	let result = BigNumber.from('0')
	const params = gasLimitL1
		? { paymentToken, gasLimit, isHighPriority, gasLimitL1 }
		: { paymentToken, gasLimit, isHighPriority }
	const chainId = EquivalentChainsForGelato[_chainId] ?? _chainId
	try {
		const res = await axiosGet(`${GELATO_SERVER}/oracles/${chainId}/estimate`, { params })
		result = BigNumber.from(res.data.estimatedFee)
	} catch (error) {
		if (logger) logger.error('Error in getGelatoEstimatedFee', undefined, undefined, jsonifyError(error as Error))
	}
	return result
}

export const getConversionRate = async (_chainId: number, to?: string, logger?: Logger): Promise<number> => {
	let result = 0
	const chainId = EquivalentChainsForGelato[_chainId] ?? _chainId
	let apiEndpoint = `${GELATO_SERVER}/oracles/${chainId}/conversionRate`
	if (to) {
		apiEndpoint = apiEndpoint.concat(`/to=${to}`)
	}

	let totalRetries = 5
	const retryInterval = 2_000
	await new Promise(res => {
		interval(async (_, stop) => {
			if (totalRetries === 0) {
				stop()
				res(undefined)
			}

			try {
				totalRetries--
				const axiosRes = await axiosGet(apiEndpoint)
				result = axiosRes.data.conversionRate as number
				if (result > 0) {
					stop()
					res(undefined)
				}
			} catch (error) {
				if (logger)
					logger.error(
						`Error in getConversionRate. Retrying in ${retryInterval} ms`,
						undefined,
						undefined,
						jsonifyError(error as Error)
					)
			}
		}, retryInterval)
	})
	try {
		const res = await axiosGet(apiEndpoint)
		result = res.data.conversionRate as number
	} catch (error) {
		if (logger) logger.error('Error in getConversionRate', undefined, undefined, jsonifyError(error as Error))
	}
	return result
}
