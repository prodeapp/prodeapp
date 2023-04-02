import axios, { AxiosResponse } from 'axios'

import { AxiosQueryError, jsonifyError, NxtpError } from '@/lib/connext/errors'

// eslint-disable-next-line @typescript-eslint/no-implied-eval
export const delay = (ms: number): Promise<void> => new Promise((res: () => void): any => setTimeout(res, ms))

export const axiosGet = async <T = any, R = AxiosResponse<T>, D = any>(
	url: string,
	data?: D,
	numAttempts = 5,
	retryDelay = 2000
): Promise<R> => {
	let error
	for (let i = 0; i < numAttempts; i++) {
		try {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			const response = await axios.get<T, R, D>(url, data as any)
			return response
		} catch (err) {
			if (axios.isAxiosError(err)) {
				error = { error: err.toJSON(), status: err.response?.status }
			}
			error = jsonifyError(err as NxtpError)
		}
		await delay(retryDelay)
	}
	throw new AxiosQueryError(url, 'get', data, error)
}
