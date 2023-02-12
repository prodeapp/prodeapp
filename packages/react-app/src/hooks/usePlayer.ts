import { useQuery } from '@tanstack/react-query'
import { Address, readContract } from '@wagmi/core'

import { KeyValueAbi } from '@/abi/KeyValue'
import { Player } from '@/graphql/subgraph'

export const usePlayer = (playerId: Address) => {
	return useQuery<Player, Error>(
		['usePlayer', playerId],
		async () => {
			const username = await readContract({
				address: import.meta.env.VITE_KEY_VALUE as Address,
				abi: KeyValueAbi,
				functionName: 'username',
				args: [playerId],
			})

			return {
				id: playerId,
				name: username || playerId,
			}
		},
		{ enabled: !!playerId }
	)
}
