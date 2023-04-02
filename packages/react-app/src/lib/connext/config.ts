import { Static, Type } from '@sinclair/typebox'
import { parseUnits } from 'ethers/lib/utils'

import { ajv } from '@/lib/connext/ajv'
import { ChainData, getChainData } from '@/lib/connext/chainData'
import { ConnextContractDeployments, ContractPostfix } from '@/lib/connext/contracts'
import { ConfigurationError } from '@/lib/connext/errors'
import { TIntegerString, TUrl } from '@/lib/connext/interfaces'

export const DEFAULT_CHAIN_CONFIG_VALUE_MINS = {
	gasPriceMaxIncreaseScalar: 100,
	gasPriceReplacementBumpPercent: 0,
	gasLimitInflation: 0,
}

export const TAddress = Type.RegEx(/^0x[a-fA-F0-9]{40}$/)

export const DEFAULT_CHAIN_CONFIG: CoreChainConfig = {
	syncProvidersInterval: 5 * 60_000,
	maxProviderCPS: 4,
	gasPriceInitialBoostPercent: 30,
	gasStations: [],
	// From ethers docs:
	// Generally, the new gas price should be about 50% + 1 wei more, so if a gas price
	// of 10 gwei was used, the replacement should be 15.000000001 gwei.
	gasPriceReplacementBumpPercent: 20,
	gasPriceMaximum: parseUnits('1500', 'gwei').toString(),
	gasPriceMinimum: parseUnits('5', 'gwei').toString(),
	gasPriceMaxIncreaseScalar: 200,
	confirmations: 10,
	// NOTE: This should be the amount of time we are willing to wait for a transaction
	// to get 1 confirmation.
	confirmationTimeout: 90_000,
	debug_logRpcCalls: false,
	quorum: 1,
}

export const TLogLevel = Type.Union([
	Type.Literal('fatal'),
	Type.Literal('error'),
	Type.Literal('warn'),
	Type.Literal('info'),
	Type.Literal('debug'),
	Type.Literal('trace'),
	Type.Literal('silent'),
])

export const TAssetDescription = Type.Object({
	name: Type.String(),
	address: TAddress,
	symbol: Type.String(),
	mainnetEquivalent: Type.Optional(TAddress),
})

export const TValidationChainConfig = Type.Object({
	providers: Type.Array(Type.String()),
	gasStations: Type.Array(Type.String()),
	confirmations: Type.Integer({ minimum: 1 }), // What we consider the "safe confirmations" number for this chain.
	deployments: Type.Object({
		connext: TAddress,
		multisend: Type.Optional(TAddress),
		stableSwap: Type.Optional(TAddress),
	}),
	assets: Type.Optional(Type.Array(TAssetDescription)), /// Not Being Used
})

export const NxtpValidationSdkConfigSchema = Type.Object({
	chains: Type.Record(Type.String(), TValidationChainConfig),
	signerAddress: Type.Optional(TAddress),
	logLevel: TLogLevel,
	cartographerUrl: Type.String(),
	network: Type.Union([Type.Literal('testnet'), Type.Literal('mainnet'), Type.Literal('local')]),
	environment: Type.Union([Type.Literal('staging'), Type.Literal('production')]),
})

export const TChainDeployments = Type.Object({
	connext: TAddress,
	multisend: Type.Optional(TAddress),
	unwrapper: Type.Optional(TAddress),
	stableSwap: Type.Optional(TAddress),
})

export const TChainConfig = Type.Object({
	providers: Type.Array(Type.String()),
	gasStations: Type.Optional(Type.Array(Type.String())),
	confirmations: Type.Optional(Type.Integer({ minimum: 1 })), // What we consider the "safe confirmations" number for this chain.
	chainId: Type.Optional(Type.Number()),
	deployments: Type.Optional(TChainDeployments),
	assets: Type.Optional(Type.Array(TAssetDescription)), /// Not Being Used
})

export const SdkConfigSchema = Type.Object({
	chains: Type.Record(Type.String(), TChainConfig),
	signerAddress: Type.Optional(TAddress),
	logLevel: Type.Optional(TLogLevel),
	cartographerUrl: Type.Optional(Type.String()),
	network: Type.Optional(Type.Union([Type.Literal('testnet'), Type.Literal('mainnet'), Type.Literal('local')])),
	environment: Type.Optional(Type.Union([Type.Literal('staging'), Type.Literal('production')])),
})

/// PROVIDER CONFIG
export const ProviderConfigSchema = Type.Object({
	// URL string.
	url: TUrl,

	// Auth header params, if needed.
	user: Type.Optional(Type.String()),
	password: Type.Optional(Type.String()),

	/* From ethers:
	 * The priority used for the provider. Lower-value priorities are favoured over higher-value priorities. If
	 * multiple providers share the same priority, they are chosen at random.
	 *
	 * Defaults to 1.
	 */
	priority: Type.Optional(Type.Number()),

	/* From ethers:
	 * The weight a response from this provider provides. This can be used if a given Provider is more trusted, for example.
	 *
	 * Defaults to 1.
	 */
	weight: Type.Optional(Type.Number()),

	/* From ethers:
	 * The timeout (in ms) after which another Provider will be attempted. This does not affect the current Provider;
	 * if it returns a result it is counted as part of the quorum.
	 * Lower values will result in more network traffic, but may reduce the response time of requests.
	 */
	stallTimeout: Type.Optional(Type.Number()),
})

export type ProviderConfig = Static<typeof ProviderConfigSchema>
export const validateProviderConfig = ajv.compile(ProviderConfigSchema)

export const getEnvConfig = (
	_nxtpConfig: SdkConfig,
	chainData: Map<string, ChainData>,
	deployments: ConnextContractDeployments
): SdkConfig => {
	const nxtpConfig: SdkConfig = {
		..._nxtpConfig,
		logLevel: _nxtpConfig.logLevel || 'info',
		network: _nxtpConfig.network || 'mainnet',
		environment: _nxtpConfig.environment || 'production',
		cartographerUrl: _nxtpConfig.cartographerUrl
			? _nxtpConfig.cartographerUrl
			: _nxtpConfig.network === 'testnet'
			? _nxtpConfig.environment === 'staging'
				? 'https://postgrest.testnet.staging.connext.ninja'
				: 'https://postgrest.testnet.connext.ninja'
			: 'https://postgrest.mainnet.connext.ninja',
	}

	const defaultConfirmations = chainData && (chainData.get('1')?.confirmations ?? 1 + 3)

	const contractPostfix: ContractPostfix =
		nxtpConfig.environment === 'production'
			? ''
			: (`${nxtpConfig.environment![0].toUpperCase()}${nxtpConfig.environment!.slice(1)}` as ContractPostfix)
	// add contract deployments if they exist
	Object.entries(nxtpConfig.chains).forEach(([domainId, chainConfig]) => {
		const chainDataForChain = chainData.get(domainId)
		const chainRecommendedConfirmations = chainDataForChain?.confirmations ?? defaultConfirmations
		const chainRecommendedGasStations = chainDataForChain?.gasStations ?? []

		// Make sure deployments is filled out correctly.
		// allow passed in address to override
		// format: { [domainId]: { { "deployments": { "connext": <address>, ... } }
		nxtpConfig.chains[domainId].deployments = {
			connext:
				chainConfig.deployments?.connext ??
				(() => {
					if (chainDataForChain) {
						const res = deployments.connext(chainDataForChain.chainId, contractPostfix)
						if (res) {
							return res.address
						}
					}
					throw new Error(`No Connext contract address for domain ${domainId}`)
				})(),
			multisend:
				chainConfig.deployments?.multisend ??
				(() => {
					if (chainDataForChain) {
						const res = deployments.multisend(chainDataForChain.chainId)
						return res?.address
					}
					return undefined
				})(),
			unwrapper:
				chainConfig.deployments?.unwrapper ??
				(() => {
					if (chainDataForChain) {
						const res = deployments.unwrapper(chainDataForChain.chainId)
						return res?.address
					}
					return undefined
				})(),
		}

		nxtpConfig.chains[domainId].confirmations = chainConfig.confirmations ?? chainRecommendedConfirmations

		nxtpConfig.chains[domainId].gasStations = (nxtpConfig.chains[domainId].gasStations ?? []).concat(
			chainRecommendedGasStations
		)
	})

	const validate = ajv.compile(NxtpValidationSdkConfigSchema)

	const valid = validate(nxtpConfig)

	if (!valid) {
		throw new Error(validate.errors?.map((err: unknown) => JSON.stringify(err, null, 2)).join(','))
	}

	return nxtpConfig
}

/// CHAIN CONFIG
const CoreChainConfigSchema = Type.Object({
	/// GAS STATIONS
	// Gas station URL, if any, to retrieve current gas price from. If gas station is down or otherwise fails,
	// we'll use the RPC provider's gas as a backup.
	// Gas station should return a "rapid" gas price within the response.data.
	gasStations: Type.Optional(Type.Array(Type.String())),

	/// GAS PRICE
	// % to bump gas by from provider or gas station initial quote.
	gasPriceInitialBoostPercent: Type.Integer(),
	// % to bump gas by when tx confirmation times out.
	gasPriceReplacementBumpPercent: Type.Integer(),
	// Gas shouldn't ever exceed this amount.
	gasPriceMaximum: TIntegerString,
	// Minimum gas price.
	gasPriceMinimum: TIntegerString,
	// Each time we submit a tx, this is the percentage scalar we use to set the maximum for the gas price we assign it.
	// The higher this number is, the more tolerant we are of gas price increases. The lower it is, the more we curb
	// increases in gas price from tx to tx.
	// NOTE: This value should ALWAYS be greater than 100, unless you want to disable it entirely (in which case, just set it to 0).
	gasPriceMaxIncreaseScalar: Type.Integer(),
	// Hardcoded initial value for gas. This shouldn't be used normally - only temporarily
	// in the event that a gas station is malfunctioning.
	hardcodedGasPrice: Type.Optional(TIntegerString),

	/// GAS LIMIT
	// An integer value by which we will inflate the gas LIMIT that is returned by the provider (flat increase).
	// Use this if your provider is returning low values and you're getting "out of gas" call exceptions.
	gasLimitInflation: Type.Optional(Type.Integer()),

	/// CONFIRMATIONS
	// The amount of time (ms) to wait before a confirmation polling period times out,
	// indicating we should resubmit tx with higher gas if the tx is not confirmed.
	confirmationTimeout: Type.Integer(),
	// Number of confirmations needed for each chain, specified by domain.
	confirmations: Type.Integer(),

	/// RPC PROVIDERS
	// Target maximum provider calls per second. Default is 4. Will NOT actually cap calls per second, but rather deprioritize
	// a provider if it reaches the maximum calls per second.
	maxProviderCPS: Type.Integer(),
	// How often (ms) we will check all RPC providers to measure how in-sync they are with the blockchain.
	// By default, every 5 mins (5 * 60_000).
	syncProvidersInterval: Type.Integer(),
	// Whether we want to maximize quorum/consensus from all available providers when we're doing read calls.
	// Set this value if it's critically important to maintain accurate responses from a number of providers that
	// vary in quality. This will increase the number of RPC calls we're making overall, but guarantees accuracy.
	quorum: Type.Optional(Type.Integer()),

	/// DEBUGGING / DEVELOPMENT
	// WARNING: Please do not alter these configuration values; they should be used for development and/or debugging
	// purposes only, and can greatly affect performance.
	// Whether to log rpc calls.
	debug_logRpcCalls: Type.Boolean(),
})

export type CoreChainConfig = Static<typeof CoreChainConfigSchema>

const ChainConfigSchema = Type.Intersect([
	Type.Object({
		/// PROVIDERS
		// List of configurations for providers for this chain.
		providers: Type.Array(ProviderConfigSchema),
	}),
	CoreChainConfigSchema,
])

/// TX SERVICE CONFIG
// Configuration for each chain that this txservice will be supporting.
const TransactionServiceConfigSchema = Type.Record(TIntegerString, ChainConfigSchema)
export type TransactionServiceConfig = Static<typeof TransactionServiceConfigSchema>

export const validateTransactionServiceConfig = (_config: any): TransactionServiceConfig => {
	// Get the default (aka "all") values to be used as defaults for all chain configs.
	const userDefaultChainConfig = _config['all'] ?? _config['default'] ?? {}
	const defaultChainConfig = {
		...DEFAULT_CHAIN_CONFIG,
		...userDefaultChainConfig,
	}
	// For each chain, validate the config and merge it with the main config.
	const config: { [domain: string]: ChainConfig } = {}
	Object.entries(_config as Record<string, any>).forEach(([domain, _chainConfig]) => {
		const chainConfig = {
			...defaultChainConfig,
			..._chainConfig,
		}
		// Ignore non-number domains.
		if (isNaN(parseInt(domain))) {
			return
		}

		// Ensure providers are specified AND number of providers >= quorum
		if (chainConfig.providers.length === 0) {
			throw new ConfigurationError([
				{
					parameter: 'providers',
					error: `Providers array was empty. Please specify providers for domain ${domain}.`,
					value: chainConfig.providers,
				},
			])
		} else if (chainConfig.quorum > chainConfig.providers.length) {
			throw new ConfigurationError([
				{
					parameter: 'providers',
					error:
						`Number of providers (${chainConfig.providers.length}) must be greater than ` +
						`configured quorum (${chainConfig.quorum}) for domain ${domain}.`,
					value: chainConfig.providers,
				},
			])
		}

		// Make sure config values that must be > X are so (if they are specified).
		const configValueMins = {
			...DEFAULT_CHAIN_CONFIG_VALUE_MINS,
			hardcodedGasPrice: chainConfig.gasPriceMinimum,
		}
		Object.entries(configValueMins).forEach(([key, min]) => {
			if (chainConfig[key] !== undefined && chainConfig[key] <= min) {
				const error = new ConfigurationError([
					{
						parameter: key,
						error: `${key} must be greater than 100.`,
						value: chainConfig[key],
					},
				])
				throw error
			}
		})

		// Backwards compatibility with specifying only a single provider under the key "provider".
		const _providers: string | string[] | { url: string; user?: string; password?: string }[] =
			chainConfig.providers ?? chainConfig.provider
		const providers = typeof _providers === 'string' ? [{ url: _providers }] : _providers

		// Remove unused from the mix (such as subgraphs, etc).
		// NOTE: We use CoreChainConfigSchema here because we will format them separately below.
		const sanitizedCoreConfig: any = {}
		Object.keys(CoreChainConfigSchema.properties).forEach(property => {
			sanitizedCoreConfig[property] = chainConfig[property]
		})

		// Merge the default values with the specified chain config.
		config[domain] = {
			...sanitizedCoreConfig,
			providers: providers.map(provider =>
				typeof provider === 'string'
					? {
							url: provider,
					  }
					: provider
			),
		} as ChainConfig
	})
	ajv.compile(TransactionServiceConfigSchema)(config)
	return config
}

export type ChainConfig = Static<typeof ChainConfigSchema>

export type SdkConfig = Static<typeof SdkConfigSchema>

let nxtpConfig: SdkConfig | undefined

export const getConfig = async (
	_nxtpConfig: SdkConfig,
	deployments: ConnextContractDeployments,
	_chainData?: Map<string, ChainData>
): Promise<{ nxtpConfig: SdkConfig; chainData: Map<string, ChainData> }> => {
	let chainData = _chainData
	if (!chainData) {
		chainData = await getChainData()
	}
	nxtpConfig = getEnvConfig(_nxtpConfig, chainData, deployments)
	return { nxtpConfig: nxtpConfig, chainData: chainData }
}
