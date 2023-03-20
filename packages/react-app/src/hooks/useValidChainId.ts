import { useNetwork } from 'wagmi'

import { DEFAULT_CHAIN } from '@/lib/config'

export function useValidChainId() {
	const { chain } = useNetwork()
	return chain && !chain.unsupported ? chain.id : DEFAULT_CHAIN
}
