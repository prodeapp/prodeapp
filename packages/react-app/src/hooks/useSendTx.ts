import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { Abi } from 'abitype'
import { useState } from 'react'
import {
	useContractWrite,
	UseContractWriteConfig,
	usePrepareContractWrite,
	UsePrepareContractWriteConfig,
	useWaitForTransaction,
	WriteContractMode,
} from 'wagmi'

import { useDebounce } from './useDebounce'

export const useSendTx = <TAbi extends Abi | readonly unknown[], TFunctionName extends string>({
	address,
	abi,
	functionName,
	args,
	overrides,
	enabled,
}: UsePrepareContractWriteConfig<TAbi, TFunctionName>) => {
	const [isTxSuccess, setIsTxSuccess] = useState(false)
	const [isTxError, setIsTxError] = useState(false)
	const [receipt, setReceipt] = useState<TransactionReceipt | undefined>()
	const debouncedArgs = useDebounce(args, 500)

	// the first call to useDebounce returns undefined, we need to skip this because the args are not ready yet
	const waitDebounce = typeof args !== 'undefined' && typeof debouncedArgs === 'undefined'

	// @ts-ignore
	const { config, isError: isPrepareError } = usePrepareContractWrite({
		address,
		abi,
		functionName: waitDebounce ? '' : functionName,
		args: debouncedArgs,
		overrides,
		enabled,
	})

	const {
		isLoading: isWriteLoading,
		isError: isWriteError,
		data,
		write,
		// @ts-ignore
	} = useContractWrite(config)

	const { isLoading: isTxLoading, error } = useWaitForTransaction({
		hash: data?.hash,
		onSuccess: data => {
			const isSuccess = data.status === 1
			setIsTxSuccess(isSuccess)
			setIsTxError(!isSuccess)
			setReceipt(data)
		},
		onError: () => {
			setIsTxSuccess(false)
			setIsTxError(true)
		},
	})

	return {
		isPrepareError,
		isLoading: isWriteLoading || isTxLoading,
		isSuccess: isTxSuccess,
		isError: isWriteError || isTxError,
		error,
		write,
		receipt,
	}
}

export const useSendRecklessTx = <
	TMode extends WriteContractMode = WriteContractMode,
	TAbi extends Abi | readonly unknown[] = Abi,
	TFunctionName extends string = string
>({
	address,
	abi,
	functionName,
}: Omit<UseContractWriteConfig<TMode, TAbi, TFunctionName>, 'mode'>) => {
	const [isTxSuccess, setIsTxSuccess] = useState(false)
	const [isTxError, setIsTxError] = useState(false)
	const [receipt, setReceipt] = useState<TransactionReceipt | undefined>()

	const {
		isLoading: isWriteLoading,
		isError: isWriteError,
		data,
		write,
		// @ts-ignore
	} = useContractWrite({
		mode: 'recklesslyUnprepared',
		address,
		abi,
		functionName,
	})

	const { isLoading: isTxLoading, error } = useWaitForTransaction({
		hash: data?.hash,
		onSuccess: data => {
			const isSuccess = data.status === 1
			setIsTxSuccess(isSuccess)
			setIsTxError(!isSuccess)
			setReceipt(data)
		},
		onError: () => {
			setIsTxSuccess(false)
			setIsTxError(true)
		},
	})

	return {
		isLoading: isWriteLoading || isTxLoading,
		isSuccess: isTxSuccess,
		isError: isWriteError || isTxError,
		error,
		write,
		receipt,
	}
}
