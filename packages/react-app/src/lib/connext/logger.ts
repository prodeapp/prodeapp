import { NxtpErrorJson } from '@/lib/connext/errors'

export type MethodContext = {
	id: string
	name: string
}

export type BaseRequestContext = {
	id: string
	origin: string
}

export type RequestContextWithTransactionId = BaseRequestContext & {
	transferId: string
}

export type RequestContext<T extends string | undefined = undefined> = T extends undefined
	? BaseRequestContext
	: RequestContextWithTransactionId

export class Logger {
	debug(_msg: string, _requestContext?: RequestContext, _methodContext?: MethodContext, _ctx?: any): void {
		console.log(_msg, _requestContext, _methodContext, _ctx)
	}

	info(_msg: string, _requestContext?: RequestContext, _methodContext?: MethodContext, _ctx?: any): void {
		console.log(_msg, _requestContext, _methodContext, _ctx)
	}

	warn(_msg: string, _requestContext?: RequestContext, _methodContext?: MethodContext, _ctx?: any): void {
		console.log(_msg, _requestContext, _methodContext, _ctx)
	}

	error(
		_msg: string,
		_requestContext?: RequestContext,
		_methodContext?: MethodContext,
		_error?: NxtpErrorJson,
		_ctx?: any
	): void {
		console.log(_msg, _requestContext, _methodContext, _error, _ctx)
	}
}
