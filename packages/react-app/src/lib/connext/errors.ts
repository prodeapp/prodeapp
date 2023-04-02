import { Logger } from '@ethersproject/logger'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers'
import { Static, Type } from '@sinclair/typebox'

export type Values<E> = E[keyof E]

export const NxtpErrorJsonSchema = Type.Object({
	message: Type.String(),
	context: Type.Any(),
	type: Type.String(),
	stack: Type.Optional(Type.String()),
})

export type NxtpErrorJson = Static<typeof NxtpErrorJsonSchema>

export class NxtpError extends Error {
	public readonly isNxtpError = true
	static readonly reasons: { [key: string]: string }

	constructor(
		public readonly msg: Values<typeof NxtpError.reasons>,
		public readonly context: any = {},
		public readonly type = NxtpError.name,
		public readonly level: 'debug' | 'info' | 'warn' | 'error' = 'error'
	) {
		super(msg)
	}

	public toJson(): NxtpErrorJson {
		return {
			message: this.msg,
			context: this.context,
			type: this.type,
			stack: this.stack,
		}
	}

	public static fromJson(json: NxtpErrorJson): NxtpError {
		return new NxtpError(json.message, json.context ?? {}, json.type ?? (json as any).name ?? NxtpError.name)
	}
}

export class UnpredictableGasLimit extends NxtpError {
	/**
	 * An error that we get back from ethers when we try to do a gas estimate, but this
	 * may need to be handled differently.
	 */
	static readonly type = UnpredictableGasLimit.name

	constructor(public readonly context: any = {}) {
		super('The gas estimate could not be determined.', context, UnpredictableGasLimit.type)
	}
}

export class QuorumNotMet extends NxtpError {
	static readonly type = QuorumNotMet.name

	constructor(highestQuorum: number, requiredQuorum: number, public readonly context: any = {}) {
		super(
			`Required quorum for RPC provider responses was not met! Highest quorum: ${highestQuorum}; Required quorum: ${requiredQuorum}`,
			{
				...context,
				highestQuorum,
				requiredQuorum,
			},
			QuorumNotMet.type
		)
	}
}

export class StallTimeout extends NxtpError {
	static readonly type = StallTimeout.name

	constructor(public readonly context: any = {}) {
		super('Request stalled and timed out.', context, StallTimeout.type)
	}
}

export class TransactionReverted extends NxtpError {
	/**
	 * An error that indicates that the transaction was reverted on-chain.
	 *
	 * Could be harmless if this was from a subsuquent attempt, e.g. if the tx
	 * was already mined (NonceExpired, AlreadyMined)
	 *
	 * Alternatively, if this is from the first attempt, it must be thrown as the reversion
	 * was for a legitimate reason.
	 */
	static readonly type = TransactionReverted.name

	static readonly reasons = {
		GasEstimateFailed: 'Operation for gas estimate failed; transaction was reverted on-chain.',
		InsufficientFunds: 'Not enough funds in wallet.',
		/**
		 * From ethers docs:
		 * If the transaction execution failed (i.e. the receipt status is 0), a CALL_EXCEPTION error will be rejected with the following properties:
		 * error.transaction - the original transaction
		 * error.transactionHash - the hash of the transaction
		 * error.receipt - the actual receipt, with the status of 0
		 */
		CallException: 'An exception occurred during this contract call.',
		/**
		 * No difference between the following two errors, except to distinguish a message we
		 * get back from providers on execution failure.
		 */
		ExecutionFailed: 'Transaction would fail on chain.',
		AlwaysFailingTransaction: 'Transaction would always fail on chain.',
		GasExceedsAllowance: 'Transaction gas exceeds allowance.',
	}

	constructor(
		public readonly reason: Values<typeof TransactionReverted.reasons>,
		public readonly receipt?: TransactionReceipt,
		public readonly context: any = {}
	) {
		super(reason, context, TransactionReverted.type)
	}
}

export class TransactionReplaced extends NxtpError {
	/**
	 * From ethers docs:
	 * If the transaction is replaced by another transaction, a TRANSACTION_REPLACED error will be rejected with the following properties:
	 * error.hash - the hash of the original transaction which was replaced
	 * error.reason - a string reason; one of "repriced", "cancelled" or "replaced"
	 * error.cancelled - a boolean; a "repriced" transaction is not considered cancelled, but "cancelled" and "replaced" are
	 * error.replacement - the replacement transaction (a TransactionResponse)
	 * error.receipt - the receipt of the replacement transaction (a TransactionReceipt)
	 */
	static readonly type = TransactionReplaced.name

	constructor(
		public readonly receipt: TransactionReceipt,
		public readonly replacement: TransactionResponse,
		public readonly context: any = {}
	) {
		super('Transaction replaced.', context, TransactionReplaced.type)
	}
}

export class TransactionAlreadyKnown extends NxtpError {
	/**
	 * This one occurs (usually) when we try to send a transaction to multiple providers
	 * and one or more of them already has the transaction in their mempool.
	 */
	static readonly type = TransactionAlreadyKnown.name

	constructor(public readonly context: any = {}) {
		super('Transaction is already indexed by provider.', context, TransactionAlreadyKnown.type)
	}
}

export class OperationTimeout extends NxtpError {
	/**
	 * An error indicating that an operation (typically confirmation) timed out.
	 */
	static readonly type = OperationTimeout.name

	constructor(public readonly context: any = {}) {
		super('Operation timed out.', context, OperationTimeout.type)
	}
}

export class ServerError extends NxtpError {
	/**
	 * An error indicating that an operation on the node server (such as validation
	 * before submitting a transaction) occurred.
	 *
	 * This error could directly come from geth, or be altered by the node server,
	 * depending on which service is used. As a result, we coerce this to a single error
	 * type.
	 */
	static readonly type = ServerError.name

	static readonly reasons = {
		BadResponse: 'Received bad response from provider.',
	}

	constructor(public readonly reason?: Values<typeof ServerError.reasons>, public readonly context: any = {}) {
		const stringifiedContext = Object.entries((context as unknown) as object)
			.map((k, v) => `${k}: ${v}`)
			.join(';')
		super((reason ?? 'Server error occurred.') + `{${stringifiedContext}}`, context, ServerError.type)
	}
}

export class RpcError extends NxtpError {
	static readonly type = RpcError.name

	/**
	 * Indicates the RPC Providers are malfunctioning. If errors of this type persist,
	 * ensure you have a sufficient number of backup providers configured.
	 */
	static readonly reasons = {
		OutOfSync: 'All providers for this chain fell out of sync with the chain.',
		FailedToSend: 'Failed to send RPC transaction.',
		NetworkError: 'An RPC network error occurred.',
		ConnectionReset: 'Connection was reset by peer.',
	}

	constructor(public readonly reason: Values<typeof RpcError.reasons>, public readonly context: any = {}) {
		const errors = (context.errors ? (context.errors as any[]) : []).map((e, i) => `-${i}: ${e}`).join(';\n')
		const stringifiedContext = Object.entries(({
			...context,
			errors,
		} as unknown) as object)
			.map((k, v) => `${k}: ${v}`)
			.join('\n')
		super(reason + `\n{${stringifiedContext}}`, context, RpcError.type)
	}
}

export class AxiosQueryError extends NxtpError {
	constructor(url: string, method: 'get' | 'post', data: any, errorObj: any) {
		super(`Error sending axios request to url ${url}`, { url, data, method, error: errorObj }, AxiosQueryError.name)
	}
}

export class ProviderNotConfigured extends NxtpError {
	static readonly type = ProviderNotConfigured.name

	static getMessage(chainId: string): string {
		return `No provider(s) configured for chain ${chainId}. Make sure this chain's providers are configured.`
	}

	constructor(public readonly chainId: string, public readonly context: any = {}) {
		super(ProviderNotConfigured.getMessage(chainId), context, ProviderNotConfigured.type)
	}
}

export class ConfigurationError extends NxtpError {
	static readonly type = ConfigurationError.name

	constructor(
		public readonly invalidParameters: { parameter: string; error: string; value: any }[],
		public readonly context: any = {}
	) {
		super('Configuration paramater(s) were invalid.', { ...context, invalidParameters }, ConfigurationError.type)
	}
}

export class GasEstimateInvalid extends NxtpError {
	static readonly type = GasEstimateInvalid.name

	static getMessage(returned: string): string {
		return `The gas estimate returned was an invalid value. Got: ${returned}`
	}

	constructor(returned: string, public readonly context: any = {}) {
		super(GasEstimateInvalid.getMessage(returned), context, GasEstimateInvalid.type)
	}
}

export class BadNonce extends NxtpError {
	/**
	 * An error indicating that we got a "nonce expired"-like message back from
	 * ethers while conducting sendTransaction.
	 */
	static readonly type = BadNonce.name

	static readonly reasons = {
		NonceExpired: 'Nonce for this transaction is already expired.',
		ReplacementUnderpriced:
			"Gas for replacement tx was insufficient (must be greater than previous transaction's gas).",
		NonceIncorrect: "Transaction doesn't have the correct nonce",
	}

	constructor(public readonly reason: Values<typeof BadNonce.reasons>, public readonly context: any = {}) {
		super(reason, context, BadNonce.type)
	}
}

export class ParamsInvalid extends NxtpError {
	constructor(context: any = {}) {
		super('Params invalid', context, ParamsInvalid.name)
	}
}

/**
 * Converts an error into a json object
 *
 * @param error - Error to convert
 * @returns An error json
 */
export const jsonifyError = (error: NxtpError | Error): NxtpErrorJson => {
	if ((error as any).toJson && typeof (error as any).toJson === 'function') {
		return (error as NxtpError).toJson()
	}
	return {
		message: error.message,
		type: error.name,
		context: {},
		stack: error.stack,
	}
}

/**
 * Parses error strings into strongly typed NxtpError.
 * @param error from ethers.js package
 * @returns NxtpError
 */
export const parseError = (error: any): NxtpError => {
	if (error.isNxtpError) {
		// If the error has already been parsed into a native error, just return it.
		return error
	}

	let message = error.message
	if (error.error && typeof error.error.message === 'string') {
		message = error.error.message
	} else if (typeof error.body === 'string') {
		message = error.body
	} else if (typeof error.responseText === 'string') {
		message = error.responseText
	}

	// Preserve error data, if applicable.
	let data = ''
	if (error.data) {
		if (error.data.data) {
			data = error.data.data.toString()
		} else {
			data = error.data.toString()
		}
	} else if (error.error?.data) {
		if (error.error.data.data) {
			data = error.error.data.data
		} else {
			data = error.error.data
		}
	} else if (error.body) {
		if (error.body.data) {
			if (error.body.data.data) {
				data = error.body.data.data
			} else {
				data = error.body.data
			}
		}
	}

	// Identify the error's name given its sighash, if possible.
	const name = 'n/a'

	// Preserve the original message before making it lower case.
	const originalMessage = message
	message = (message || '').toLowerCase()
	const context = {
		data: data ?? 'n/a',
		name,
		message: originalMessage,
		code: error.code ?? 'n/a',
		reason: error.reason ?? 'n/a',
	}

	if (message.match(/execution reverted/)) {
		return new TransactionReverted(TransactionReverted.reasons.ExecutionFailed, undefined, context)
	} else if (message.match(/always failing transaction/)) {
		return new TransactionReverted(TransactionReverted.reasons.AlwaysFailingTransaction, undefined, context)
	} else if (message.match(/gas required exceeds allowance/)) {
		return new TransactionReverted(TransactionReverted.reasons.GasExceedsAllowance, undefined, context)
	} else if (
		message.match(
			/another transaction with same nonce|same hash was already imported|transaction nonce is too low|nonce too low|oldnonce/
		)
	) {
		return new BadNonce(BadNonce.reasons.NonceExpired, context)
	} else if (message.match(/replacement transaction underpriced/)) {
		return new BadNonce(BadNonce.reasons.ReplacementUnderpriced, context)
	} else if (message.match(/tx doesn't have the correct nonce|invalid transaction nonce/)) {
		return new BadNonce(BadNonce.reasons.NonceIncorrect, context)
	} else if (message.match(/econnreset|eaddrinuse|econnrefused|epipe|enotfound|enetunreach|eai_again/)) {
		// Common connection errors: ECONNRESET, EADDRINUSE, ECONNREFUSED, EPIPE, ENOTFOUND, ENETUNREACH, EAI_AGAIN
		// TODO: Should also take in certain HTTP Status Codes: 429, 500, 502, 503, 504, 521, 522, 524; but need to be sure they
		// are status codes and not just part of a hash string, id number, etc.
		return new RpcError(RpcError.reasons.ConnectionReset, context)
	} else if (message.match(/already known|alreadyknown/)) {
		return new TransactionAlreadyKnown(context)
	} else if (message.match(/insufficient funds/)) {
		return new TransactionReverted(
			TransactionReverted.reasons.InsufficientFunds,
			error.receipt as TransactionReceipt,
			context
		)
	}

	switch (error.code) {
		case Logger.errors.TRANSACTION_REPLACED:
			return new TransactionReplaced(error.receipt as TransactionReceipt, error.replacement as TransactionResponse, {
				...context,
				hash: error.hash,
				reason: error.reason,
				cancelled: error.cancelled,
			})
		case Logger.errors.INSUFFICIENT_FUNDS:
			return new TransactionReverted(
				TransactionReverted.reasons.InsufficientFunds,
				error.receipt as TransactionReceipt,
				context
			)
		case Logger.errors.CALL_EXCEPTION:
			return new TransactionReverted(
				TransactionReverted.reasons.CallException,
				error.receipt as TransactionReceipt,
				context
			)
		case Logger.errors.NONCE_EXPIRED:
			return new BadNonce(BadNonce.reasons.NonceExpired, context)
		case Logger.errors.REPLACEMENT_UNDERPRICED:
			return new BadNonce(BadNonce.reasons.ReplacementUnderpriced, context)
		case Logger.errors.UNPREDICTABLE_GAS_LIMIT:
			return new UnpredictableGasLimit(context)
		case Logger.errors.TIMEOUT:
			return new OperationTimeout(context)
		case Logger.errors.NETWORK_ERROR:
			return new RpcError(RpcError.reasons.NetworkError, context)
		case Logger.errors.SERVER_ERROR:
			return new ServerError(ServerError.reasons.BadResponse, context)
		default:
			return error
	}
}
