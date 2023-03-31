import { BigNumber, Signer } from 'ethers'

import { RpcProviderAggregator } from '@/lib/connext/aggregator'
import { ChainConfig, TransactionServiceConfig, validateTransactionServiceConfig } from '@/lib/connext/config'
import { ConfigurationError, ProviderNotConfigured } from '@/lib/connext/errors'
import { Logger } from '@/lib/connext/logger'

export class ChainReader {
	protected providers: Map<number, RpcProviderAggregator> = new Map()
	protected readonly config: TransactionServiceConfig

	/**
	 * A singleton-like interface for handling all logic related to conducting on-chain transactions.
	 *
	 * @remarks
	 * Using the Signer instance passed into this constructor outside of the context of this
	 * class is not recommended, and may cause issues with nonce being tracked improperly
	 * due to the caching mechanisms used here.
	 *
	 * @param logger The Logger used for logging.
	 * @param signer The Signer or Wallet instance, or private key, for signing transactions.
	 * @param config At least a partial configuration used by TransactionService for chains,
	 * providers, etc.
	 */
	constructor(protected readonly logger: Logger, config: any, signer?: string | Signer) {
		// Set up the config.
		this.config = validateTransactionServiceConfig(config)
		this.setupProviders(signer)
	}

	/// CHAIN READING METHODS

	/**
	 * Get the current gas price for the chain for which this instance is servicing.
	 *
	 * @param domain - The ID of the chain for which this call is related.
	 * @param requestContext - The request context.
	 * @returns BigNumber representing the current gas price.
	 */
	public async getGasPrice(domain: number): Promise<BigNumber> {
		return await this.getProvider(domain).getGasPrice()
	}

	/// HELPERS
	/**
	 * Helper to wrap getting provider for specified domain.
	 * @param domain The ID of the chain for which we want a provider.
	 * @returns The ChainRpcProvider for that chain.
	 * @throws TransactionError.reasons.ProviderNotFound if provider is not configured for
	 * that ID.
	 */
	protected getProvider(domain: number): RpcProviderAggregator {
		// Ensure that a signer, provider, etc are present to execute on this domain.
		if (!this.providers.has(domain)) {
			throw new ProviderNotConfigured(domain.toString())
		}
		return this.providers.get(domain)!
	}

	/**
	 * Populate the provider mapping using chain configurations.
	 * @param context - The request context object used for logging.
	 * @param signer - The signer that will be used for onchain operations.
	 */
	protected setupProviders(signer?: string | Signer) {
		// For each domain / provider, map out all the utils needed for each chain.
		Object.keys(this.config).forEach(domain => {
			// Get this chain's config.
			const chain: ChainConfig = this.config[domain]
			// Ensure at least one provider is configured.
			if (chain.providers.length === 0) {
				const error = new ConfigurationError(
					[
						{
							parameter: 'providers',
							error: 'No valid providers were supplied in configuration for this chain.',
							value: '',
						},
					],
					{
						domain,
					}
				)
				throw error
			}
			const domainNumber = parseInt(domain)
			const provider = new RpcProviderAggregator(this.logger, domainNumber, chain, signer)
			this.providers.set(domainNumber, provider)
		})
	}
}
