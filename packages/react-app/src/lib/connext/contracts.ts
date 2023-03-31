import _contractDeployments from '@/lib/connext/deployments.json'

export type ContractPostfix = 'Staging' | ''

export type MultisendContractDeploymentGetter = (chainId: number) => { address: string; abi: any } | undefined
export type UnwrapperContractDeploymentGetter = (chainId: number) => { address: string; abi: any } | undefined

export const _getContractDeployments = (): Record<string, Record<string, any>> => {
	return _contractDeployments as any
}

export const getDeployedConnextContract = (
	chainId: number,
	postfix: ContractPostfix = ''
): { address: string; abi: any } | undefined => {
	const record = _getContractDeployments()[chainId.toString()] ?? {}
	const contract = record[0]?.contracts ? record[0]?.contracts[`Connext${postfix}`] : undefined
	return contract ? { address: contract.address, abi: contract.abi } : undefined
}

export const getDeployedMultisendContract = (chainId: number): { address: string; abi: any } | undefined => {
	const record = _getContractDeployments()[chainId.toString()] ?? {}
	const contract = record[0]?.contracts ? record[0]?.contracts['MultiSend'] : undefined
	return contract ? { address: contract.address, abi: contract.abi } : undefined
}

export const getDeployedUnwrapperContract = (chainId: number): { address: string; abi: any } | undefined => {
	const record = _getContractDeployments()[chainId.toString()] ?? {}
	const contract = record[0]?.contracts ? record[0]?.contracts['Unwrapper'] : undefined
	return contract ? { address: contract.address, abi: contract.abi } : undefined
}

export type ConnextContractDeploymentGetter = (
	chainId: number,
	postfix?: ContractPostfix,
	proxy?: boolean
) => { address: string; abi: any } | undefined

export type HubConnectorDeploymentGetter = (
	chainId: number,
	prefix: string,
	postfix?: ContractPostfix
) => { address: string; abi: any } | undefined

export type SpokeConnectorDeploymentGetter = (
	chainId: number,
	prefix: string,
	postfix?: ContractPostfix
) => { address: string; abi: any } | undefined

export type ConnextContractDeployments = {
	connext: ConnextContractDeploymentGetter
	multisend: MultisendContractDeploymentGetter
	unwrapper: UnwrapperContractDeploymentGetter
}

export const contractDeployments: ConnextContractDeployments = {
	connext: getDeployedConnextContract,
	multisend: getDeployedMultisendContract,
	unwrapper: getDeployedUnwrapperContract,
}
