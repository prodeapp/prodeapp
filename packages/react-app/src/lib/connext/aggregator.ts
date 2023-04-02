import { Signer } from '@ethersproject/abstract-signer'
import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { Block, BlockTag, FallbackProvider, TransactionReceipt, TransactionRequest } from '@ethersproject/providers'
import { parseUnits } from '@ethersproject/units'
import { Wallet } from '@ethersproject/wallet'

import { axiosGet, delay } from '@/lib/connext/axios'
import { ProviderCache } from '@/lib/connext/cache'
import { ChainConfig, validateProviderConfig } from '@/lib/connext/config'
import {
	ConfigurationError,
	GasEstimateInvalid,
	NxtpError,
	parseError,
	QuorumNotMet,
	RpcError,
	ServerError,
	StallTimeout,
} from '@/lib/connext/errors'
import { Logger } from '@/lib/connext/logger'
import { SyncProvider } from '@/lib/connext/providers'

// A provider must be within this many blocks of the "leading" provider (provider with the highest block) to be considered in-sync.
const PROVIDER_MAX_LAG = 30
const DEFAULT_BLOCK_PERIOD = 2_000

type ChainRpcProviderCache = { gasPrice: BigNumber; transactionCount: number }

export class RpcProviderAggregator {
	// The array of underlying SyncProviders.
	private readonly providers: SyncProvider[]
	// The provider that's most in sync with the chain, and has an active block listener.
	public leadProvider: SyncProvider | undefined

	// TODO: Remove fallback provider?
	public readonly fallbackProvider: FallbackProvider
	private readonly signer?: Signer

	private lastUsedGasPrice: BigNumber | undefined = undefined

	// Cached decimal values per asset. Saved separately from main cache as decimals obviously don't expire.
	private cachedDecimals: Record<string, number> = {}
	// Cached block length in time (ms), used for optimizing waiting periods.
	private blockPeriod: number = DEFAULT_BLOCK_PERIOD

	// Cache of transient data (i.e. data that can change per block).
	private cache: ProviderCache<ChainRpcProviderCache>

	/**
	 * A class for managing the usage of an ethers FallbackProvider, and for wrapping calls in
	 * retries. Will ensure provider(s) are ready before any use case.
	 *
	 * @param logger - Logger used for logging.
	 * @param signer - Signer instance or private key used for signing transactions.
	 * @param domain - The ID of the chain for which this class's providers will be servicing.
	 * @param chainConfig - Configuration for this specified chain, including the providers we'll
	 * be using for it.
	 * @param config - The shared TransactionServiceConfig with general configuration.
	 *
	 * @throws ChainError.reasons.ProviderNotFound if no valid providers are found in the
	 * configuration.
	 */
	constructor(
		protected readonly logger: Logger,
		public readonly domain: number,
		protected readonly config: ChainConfig,
		signer?: string | Signer
	) {
		// Register a provider for each url.
		// Make sure all providers are ready()
		const providerConfigs = this.config.providers
		// @ts-ignore
		const filteredConfigs = providerConfigs.filter(config => {
			const valid = validateProviderConfig(config)
			return valid
		})
		if (filteredConfigs.length > 0) {
			const hydratedConfigs = filteredConfigs.map(config => ({
				provider: new SyncProvider(
					{
						url: config.url,
						user: config.user,
						password: config.password,
					},
					this.domain,
					config.stallTimeout,
					this.config.debug_logRpcCalls
				),
				priority: config.priority ?? 1,
				weight: config.weight ?? 1,
				stallTimeout: config.stallTimeout,
			}))
			this.fallbackProvider = new FallbackProvider(hydratedConfigs, config.quorum)
			this.providers = hydratedConfigs.map(p => p.provider)
		} else {
			// Not enough valid providers were found in configuration.
			// We must throw here, as the router won't be able to support this chain without valid provider configs.
			throw new ConfigurationError(
				[
					{
						parameter: 'providers',
						error: 'No valid providers were supplied in configuration for this chain.',
						value: providerConfigs,
					},
				],
				{
					domain,
				}
			)
		}

		if (signer) {
			this.signer =
				typeof signer === 'string' ? new Wallet(signer, this.fallbackProvider) : signer.connect(this.fallbackProvider)
		} else {
			this.signer = undefined
		}

		// TODO: Make ttl/btl values below configurable ?
		this.cache = new ProviderCache<ChainRpcProviderCache>(this.logger, {
			gasPrice: {
				ttl: 30_000,
			},
			transactionCount: {
				ttl: 2_000,
			},
		})

		// This initial call of sync providers will start the first block listener (on the lead provider) and set up
		// the cache with correct initial values (as well as establish which providers are out-of-sync).
		this.syncProviders()

		// Set up the initial value for block period. Will run asyncronously, and update the value (from the default) when
		// it completes.
		this.setBlockPeriod()
	}

	/**
	 * Estimate gas cost for the specified transaction.
	 *
	 * @remarks
	 *
	 * Because estimateGas is almost always our "point of failure" - the point where its
	 * indicated by the provider that our tx would fail on chain - and ethers obscures the
	 * revert error code when it fails through its typical API, we had to implement our own
	 * estimateGas call through RPC directly.
	 *
	 * @param transaction - The ethers TransactionRequest data in question.
	 *
	 * @returns A BigNumber representing the estimated gas value.
	 */
	public async estimateGas(transaction: TransactionRequest): Promise<BigNumber> {
		const { gasLimitInflation } = this.config

		return this.execute(false, async (provider: SyncProvider) => {
			// This call will prepare the transaction params for us (hexlify tx, etc).
			const args = provider.prepareRequest('estimateGas', { transaction })
			const result = ((await provider.send(args[0], args[1])) as unknown) as BigNumberish
			try {
				return BigNumber.from(result).add(gasLimitInflation ? BigNumber.from(gasLimitInflation) : 0)
			} catch (error) {
				throw new GasEstimateInvalid(result.toString(), {
					error: (error as Error).message,
				})
			}
		})
	}

	/**
	 * Get the current gas price for the chain for which this instance is servicing.
	 *
	 * @param context - RequestContext instance in which we are executing this method.
	 * @param useInitialBoost (default: true) - boolean indicating whether to use the configured initial boost
	 * percentage value.
	 *
	 * @returns The BigNumber value for the current gas price.
	 */
	public async getGasPrice(useInitialBoost = true): Promise<BigNumber> {
		// Check if there is a hardcoded value specified for this chain. This should usually only be set
		// for testing/overriding purposes.
		const hardcoded = this.config.hardcodedGasPrice
		if (hardcoded) {
			return BigNumber.from(hardcoded)
		}

		// Check if there is a valid (non-expired) gas price available.
		if (this.cache.data.gasPrice) {
			return this.cache.data.gasPrice
		}

		const { gasPriceInitialBoostPercent, gasPriceMinimum, gasPriceMaximum, gasPriceMaxIncreaseScalar } = this.config
		let gasPrice: BigNumber | undefined = undefined

		// Use gas station APIs, if available.
		const gasStations = this.config.gasStations ?? []
		for (let i = 0; i < gasStations.length; i++) {
			const uri = gasStations[i]
			let response: any
			try {
				response = await axiosGet(uri)
				if (response && response.data) {
					const { fast } = (response.data as unknown) as { fast: BigNumberish }
					if (fast) {
						gasPrice = parseUnits(fast.toString(), 'gwei')
						break
					}
				}
			} catch (e) {
				// nothing
			}
		}

		if (!gasPrice) {
			// If we did not have a gas station API to use, or the gas station failed, use the provider's getGasPrice method.
			gasPrice = await this.execute<BigNumber>(false, async (provider: SyncProvider) => {
				return await provider.getGasPrice()
			})
			if (useInitialBoost) {
				gasPrice = gasPrice.add(gasPrice.mul(gasPriceInitialBoostPercent).div(100))
			}
		}

		// Apply a curbing function (if applicable) - this will curb the effect of dramatic network gas spikes.
		let hitMaximum = false
		if (
			gasPriceMaxIncreaseScalar !== undefined &&
			gasPriceMaxIncreaseScalar > 100 &&
			this.lastUsedGasPrice !== undefined
		) {
			// If we have a configured cap scalar, and the gas price is greater than that cap, set it to the cap.
			const curbedPrice = this.lastUsedGasPrice.mul(gasPriceMaxIncreaseScalar).div(100)
			if (gasPrice.gt(curbedPrice)) {
				gasPrice = curbedPrice
				hitMaximum = true
			}
		}

		// Final step to ensure we remain within reasonable, configured bounds for gas price.
		// If the gas price is less than absolute gas minimum, bump it up to minimum.
		// If it's greater than (or equal to) the absolute maximum, set it to that maximum (and log).
		const min = BigNumber.from(gasPriceMinimum)
		const max = BigNumber.from(gasPriceMaximum)
		// TODO: Could use a more sustainable method of separating out gas price abs min for certain
		// chains (such as arbitrum here) in particular:
		if (gasPrice.lt(min) && this.domain !== 1634886255) {
			gasPrice = min
		} else if (gasPrice.gte(max)) {
			gasPrice = max
			hitMaximum = true
		}

		// Update our last used gas price with this tx's gas price. This may be used to determine the cap of
		// subsuquent tx's gas price.
		this.lastUsedGasPrice = gasPrice

		// We only want to cache the gas price if we didn't hit the maximum.
		if (!hitMaximum) {
			this.cache.set({ gasPrice })
		}

		return gasPrice
	}

	/**
	 * Gets the current block number.
	 *
	 * @returns A number representing the current block number.
	 */
	public async getBlock(blockHashOrBlockTag: BlockTag | Promise<BlockTag>): Promise<Block> {
		return this.execute<Block>(false, async provider => {
			return await provider.getBlock(blockHashOrBlockTag)
		})
	}

	/**
	 * Retrieves a transaction's receipt by the transaction hash.
	 *
	 * @param hash - the transaction hash to get the receipt for.
	 *
	 * @returns A TransactionReceipt instance.
	 */
	public async getTransactionReceipt(hash: string): Promise<TransactionReceipt> {
		return this.execute<TransactionReceipt>(false, async (provider: SyncProvider) => {
			const receipt = await provider.getTransactionReceipt(hash)
			return receipt
		})
	}

	/// HELPERS
	/**
	 * A helper to throw a custom error if the method requires a signer but no signer has
	 * been injected into the provider.
	 *
	 * @throws NxtpError if signer is required and not provided.
	 */
	private checkSigner() {
		if (!this.signer) {
			throw new NxtpError('Method requires signer, and no signer was provided.')
		}
	}

	/**
	 * The RPC method execute wrapper is used for wrapping and parsing errors, as well as ensuring that
	 * providers are ready before any call is made. Also used for executing multiple retries for RPC
	 * requests to providers. This is to circumvent any issues related to unreliable internet/network
	 * issues, whether locally, or externally (for the provider's network).
	 *
	 * @param method - The method callback to execute and wrap in retries.
	 * @returns The object of the specified generic type.
	 * @throws NxtpError if the method fails to execute.
	 */
	private async execute<T>(needsSigner: boolean, method: (provider: SyncProvider) => Promise<T>): Promise<T> {
		// If we need a signer, check to ensure we have one.
		if (needsSigner) {
			this.checkSigner()
		}

		const errors: NxtpError[] = []
		const handleError = (e: unknown) => {
			// TODO: With the addition of SyncProvider, this parse call may be entirely redundant. Won't add any compute,
			// however, as it will return instantly if the error is already a NxtpError.
			const error = parseError(e)
			if (error.type === ServerError.type || error.type === RpcError.type || error.type === StallTimeout.type) {
				// If the method threw a StallTimeout, RpcError, or ServerError, that indicates a problem with the provider and not
				// the call - so we'll retry the call with a different provider (if available).
				errors.push(error)
			} else {
				// e.g. a TransactionReverted, TransactionReplaced, etc.
				throw error
			}
		}

		const quorum = this.config.quorum ?? 1
		if (quorum > 1) {
			// Consult ALL providers.
			const results: (T | undefined)[] = await Promise.all(
				this.providers.map(async provider => {
					try {
						return await method(provider)
					} catch (e) {
						handleError(e)
						return undefined
					}
				})
			)
			// Filter out undefined results.
			// NOTE: If there aren't any defined results, we'll proceed out of this code block and throw the
			// RpcError at the end of this method.
			const filteredResults: T[] = results.filter(item => item !== undefined) as T[]
			if (filteredResults.length > 0) {
				// Pick the most common answer.
				let counts: Map<string, number> = new Map()
				counts = filteredResults.reduce((counts, item) => {
					// Stringify the key. We'll convert it back before returning.
					const key = JSON.stringify(item)
					counts.set(key, (counts.get(key) ?? 0) + 1)
					return counts
				}, counts)
				const maxCount = Math.max(...Array.from(counts.values()))
				if (maxCount < quorum) {
					// Quorum is not met: we should toss this response as it could be unreliable.
					throw new QuorumNotMet(maxCount, quorum, {
						errors,
						providersCount: this.providers.length,
						responsesCount: filteredResults.length,
					})
				}
				// Technically it could be multiple top responses...
				const topResponses = Array.from(counts.keys()).filter(k => counts.get(k)! === maxCount)
				if (topResponses.length > 0) {
					// Did we get multiple conflicting top responses? Worth logging.
				}
				// We've been using string keys and need to convert back to the OG item type T.
				const stringifiedTopResponse = topResponses[0]
				for (const item of filteredResults) {
					if (JSON.stringify(item) === stringifiedTopResponse) {
						return item
					}
				}
			}
		} else {
			// Shuffle the providers (with weighting towards better ones) and pick from the top.
			const shuffledProviders = this.shuffleSyncedProviders()
			for (const provider of shuffledProviders) {
				try {
					return await method(provider)
				} catch (e) {
					handleError(e)
				}
			}
		}

		throw new RpcError(RpcError.reasons.FailedToSend, { errors })
	}

	/**
	 * Callback method used for handling a block update from synchronized providers.
	 *
	 * @remarks
	 * Since being "in-sync" is actually a relative matter, it's possible to have all providers
	 * be out of sync (e.g. 100 blocks behind the current block in reality), but also have them
	 * be considered in-sync here, since we only use the highest block among our providers to determine
	 * the "true" current block.
	 *
	 *
	 * @param provider - SyncProvider instance this block update applies to.
	 * @param blockNumber - Current block number (according to the provider).
	 * @param url - URL of the provider.
	 * @returns boolean indicating whether the provider is in sync.
	 */
	protected async syncProviders(): Promise<void> {
		// Reset the current lead provider.
		this.leadProvider = undefined

		// First, sync all providers simultaneously.
		await Promise.all(
			this.providers.map(async p => {
				try {
					await p.sync()
				} catch (e) {
					// nothing
				}
			})
		)

		// Find the provider with the highest block number and use that as source of truth.
		const highestBlockNumber = Math.max(...this.providers.map(p => p.syncedBlockNumber))
		for (const provider of this.providers) {
			const providerBlockNumber = provider.syncedBlockNumber
			provider.lag = highestBlockNumber - providerBlockNumber

			// Set synced property, log if the provider went out of sync.
			const synced = provider.lag < PROVIDER_MAX_LAG
			if (!synced && provider.synced) {
				// If the provider was previously synced but fell out of sync, debug log to notify.
				this.logger.debug('Provider fell out of sync.', undefined, undefined, {
					providerBlockNumber,
					provider: provider.name,
					lag: provider.lag,
				})
			}
			provider.synced = synced
		}

		// We want to pick the lead provider here at random from the list of 0-lag providers to ensure that we distribute
		// our block listener RPC calls as evenly as possible across all providers.
		const leadProviders = this.shuffleSyncedProviders()
		this.leadProvider = leadProviders[0]
	}

	/**
	 * Helper method to stall, possibly until we've surpassed a specified number of blocks. Only works
	 * with block number if we're running in synchronized mode.
	 *
	 * @param numBlocks (default: 1) - the number of blocks to wait.
	 */
	private async wait(numBlocks = 1): Promise<void> {
		const pollPeriod = numBlocks * (this.blockPeriod ?? 2_000)
		await delay(pollPeriod)
	}

	/**
	 * Helper method for getting tier-shuffled synced providers.
	 *
	 * @returns all in-sync providers in order of synchronicity with chain, with the lead provider
	 * in the first position and the rest shuffled by tier (lag).
	 */
	private shuffleSyncedProviders(): SyncProvider[] {
		// TODO: Should priority be a getter, and calculated internally?
		// Tiered shuffling: providers that have the same lag value (e.g. 0) will be shuffled so as to distribute RPC calls
		// as evenly as possible across all providers; at high load, this can translate to higher efficiency (each time we
		// execute an RPC call, we'll be hitting different providers).
		// Shuffle isn't applied to lead provider - instead, we just guarantee that it's in the first position.
		this.providers.forEach(p => {
			p.priority =
				p.lag -
				(this.leadProvider && p.name === this.leadProvider.name ? 1 : Math.random()) -
				p.cps / this.config.maxProviderCPS -
				// Reliability factor reflects how often RPC errors are encountered, as well as timeouts.
				p.reliability * 10 +
				p.latency
		})
		// Always start with the in-sync providers and then concat the out of sync subgraphs.
		return this.providers
			.filter(p => p.synced)
			.sort((a, b) => a.priority - b.priority)
			.concat(this.providers.filter(p => !p.synced).sort((a, b) => a.priority - b.priority))
	}

	private async setBlockPeriod(): Promise<void> {
		try {
			const currentBlock = await this.getBlock('latest')
			const previousBlock = await this.getBlock(currentBlock.parentHash)
			this.blockPeriod = currentBlock.timestamp - previousBlock.timestamp
		} catch (error) {
			// If we can't get the block period, we'll just use a default value.
			this.logger.warn('Could not get block period time, using default.', undefined, undefined, {
				domain: this.domain,
				error,
				default: DEFAULT_BLOCK_PERIOD,
			})
		}
	}
}
