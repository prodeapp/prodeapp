import { useQuery } from '@tanstack/react-query'
import { Address, readContract } from '@wagmi/core'
import { useNetwork } from 'wagmi'

import { KeyValueAbi } from '@/abi/KeyValue'
import { Player } from '@/graphql/subgraph'
import { DEFAULT_CHAIN, getConfigAddress } from '@/lib/config'

export const usePlayer = (playerId: Address) => {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()

	return useQuery<Player, Error>(
		['usePlayer', playerId, chain.id],
		async () => {
			const username = await readContract({
				address: getConfigAddress('KEY_VALUE', chain.id),
				abi: KeyValueAbi,
				functionName: 'username',
				args: [playerId],
				chainId: chain.id,
			})

			return {
				id: playerId,
				name: username || playerId,
			}
		},
		{ enabled: !!playerId }
	)
}
