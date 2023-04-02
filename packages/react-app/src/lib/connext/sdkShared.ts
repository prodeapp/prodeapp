import memoize from 'memoizee'

import { ChainData } from '@/lib/connext/chainData'
import { ChainReader } from '@/lib/connext/chainreader'
import { getChainIdFromDomain } from '@/lib/connext/domain'
import { getConversionRate as _getConversionRate } from '@/lib/connext/gelato'
import { Logger } from '@/lib/connext/logger'

import { SdkConfig } from './config'

/**
 * @classdesc SDK class encapsulating shared logic to be inherited.
 *
 */
export class SdkShared {
	readonly config: SdkConfig
	readonly chainData: Map<string, ChainData>
	protected readonly chainreader: ChainReader
	protected readonly logger: Logger

	constructor(config: SdkConfig, logger: Logger, chainData: Map<string, ChainData>) {
		this.config = config
		this.logger = logger
		this.chainData = chainData
		this.chainreader = new ChainReader(logger, config.chains)
	}

	getConversionRate = memoize(
		async (chainId: number) => {
			return await _getConversionRate(chainId, undefined, undefined)
		},
		{ promise: true, maxAge: 1 * 60 * 1000 } // maxAge: 1 min
	)

	/**
	 * Returns the chain ID for a specified domain.
	 *
	 * @param domainId - The domain ID.
	 * @returns The chain ID.
	 */
	getChainId = memoize(
		async (domainId: string): Promise<number> => {
			let chainId = this.config.chains[domainId]?.chainId
			if (!chainId) {
				chainId = await getChainIdFromDomain(domainId, this.chainData)
			}
			return chainId
		},
		{ promise: true }
	)
}
