import { BigNumber } from 'ethers'

export type logger = Logger

import { ajv } from '@/lib/connext/ajv'
import { ChainData } from '@/lib/connext/chainData'
import { contractDeployments } from '@/lib/connext/contracts'
import { Logger } from '@/lib/connext/logger'

import { getConfig, SdkConfig } from './config'
import { ParamsInvalid } from './errors'
import { calculateRelayerFee } from './helpers'
import { SdkEstimateRelayerFeeParams, SdkEstimateRelayerFeeParamsSchema } from './interfaces'
import { SdkShared } from './sdkShared'

/**
 * @classdesc SDK class encapsulating bridge functions.
 *
 */
export class SdkBase extends SdkShared {
	private static _instance: SdkBase

	constructor(config: SdkConfig, logger: Logger, chainData: Map<string, ChainData>) {
		super(config, logger, chainData)
	}

	/**
	 * Create a singleton instance of the SdkBase class.
	 *
	 * @param _config - SdkConfig object.
	 * @param _config.chains - Chain config, at minimum with providers for each chain.
	 * @param _config.signerAddress - Signer address for transactions.
	 * @param _config.logLevel - (optional) Logging severity level.
	 * @param _config.network - (optional) Blockchain environment to interact with.
	 * @returns providers.TransactionRequest object.
	 *
	 * @example:
	 * ```ts
	 *
	 * const config = {
	 *   "chains": {
	 *     "6648936": {
	 *       "providers": ["https://rpc.ankr.com/eth"]
	 *     },
	 *     "1869640809": {
	 *       "providers": ["https://mainnet.optimism.io"]
	 *     },
	 *     "1886350457": {
	 *       "providers": ["https://polygon-rpc.com"]
	 *     },
	 *   },
	 *   "signerAddress": "<wallet_address>",
	 * }
	 *
	 * const sdkBase = await SdkBase.create(config);
	 * ```
	 */

	static async create(_config: SdkConfig, _logger?: Logger, _chainData?: Map<string, ChainData>): Promise<SdkBase> {
		const { nxtpConfig, chainData } = await getConfig(_config, contractDeployments, _chainData)
		const logger = new Logger()

		return this._instance || (this._instance = new SdkBase(nxtpConfig, logger, chainData))
	}

	/**
	 * Calculates an estimated relayer fee in either the native asset of the origin domain or the USD price to be used in xcall.
	 *
	 * @param params - SdkEstimateRelayerFeeParams object.
	 * @param params.originDomain - The origin domain ID of the transfer.
	 * @param params.destinationDomain - The destination domain ID of the transfer.
	 * @param params.priceIn - `native` or `usd`, the currency to return the relayer fee in.`
	 * @param params.callDataGasAmount - (optional) The gas amount needed for calldata.
	 * @param params.originNativeTokenPrice - (optional) The USD price of the origin native token.
	 * @param params.destinationNativetokenPrice - (optional) The USD price of the destination native token.
	 * @param params.destinationGasPrice - (optional) The gas price of the destination chain, in gwei units.
	 * @returns The relayer fee in either native asset of the origin domain or USD (18 decimal fidelity).
	 *
	 * @example
	 * ```ts
	 * // call SdkBase.create(), instantiate a signer
	 *
	 * const params = {
	 *   originDomain: "6648936",
	 *   destinationDomain: "1869640809",
	 * };
	 *
	 * const txRequest = sdkBase.estimateRelayerFee(params);
	 * signer.sendTransaction(txRequest);
	 * ```
	 */
	async estimateRelayerFee(params: SdkEstimateRelayerFeeParams): Promise<BigNumber> {
		// Input validation
		const validateInput = ajv.compile(SdkEstimateRelayerFeeParamsSchema)
		const validInput = validateInput(params)
		if (!validInput) {
			const msg = validateInput.errors?.map((err: any) => `${err.instancePath} - ${err.message}`).join(',')
			throw new ParamsInvalid({
				paramsError: msg,
				params,
			})
		}

		const [originChainId, destinationChainId] = await Promise.all([
			this.getChainId(params.originDomain),
			this.getChainId(params.destinationDomain),
		])

		const [originNativeTokenPrice, destinationNativeTokenPrice] = await Promise.all([
			params.originNativeTokenPrice
				? Promise.resolve(params.originNativeTokenPrice)
				: this.getConversionRate(originChainId),
			params.destinationNativeTokenPrice
				? Promise.resolve(params.destinationNativeTokenPrice)
				: this.getConversionRate(destinationChainId),
		])

		const relayerFeeInOriginNativeAsset = await calculateRelayerFee(
			{
				...params,
				originChainId,
				destinationChainId,
				originNativeTokenPrice,
				destinationNativeTokenPrice,
				getGasPriceCallback: (domain: number) => this.chainreader.getGasPrice(domain),
			},
			this.chainData,
			this.logger
		)

		return relayerFeeInOriginNativeAsset
	}
}
