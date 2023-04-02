import { ChainData, getChainData } from '@/lib/connext/chainData'

export const DEFAULT_GAS_ESTIMATES = {
	execute: '400000',
	executeL1: '20000',
	gasPriceFactor: '1000000000000000000',
}

export type GasEstimates = {
	execute: string
	executeL1: string
	gasPriceFactor: string
}

export const getHardcodedGasLimits = async (
	domainId: string,
	chainData?: Map<string, ChainData>
): Promise<GasEstimates> => {
	const chaindata = chainData ?? (await getChainData())
	const chainInfo = chaindata?.get(domainId) ?? chainData?.get('0')
	if (!chainInfo) return DEFAULT_GAS_ESTIMATES

	const execute = chainInfo.gasEstimates?.execute ?? DEFAULT_GAS_ESTIMATES.execute
	const executeL1 = chainInfo.gasEstimates?.executeL1 ?? DEFAULT_GAS_ESTIMATES.executeL1
	const gasPriceFactor = chainInfo.gasEstimates?.gasPriceFactor ?? DEFAULT_GAS_ESTIMATES.gasPriceFactor
	const res = {
		execute,
		executeL1,
		gasPriceFactor,
	} as GasEstimates
	return res
}
