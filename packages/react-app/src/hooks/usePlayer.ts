import { useQuery } from '@tanstack/react-query'
import { Address, readContract } from '@wagmi/core'
import { useNetwork } from 'wagmi'

import { KeyValueAbi } from '@/abi/KeyValue'
import { Player } from '@/graphql/subgraph'
import { DEFAULT_CHAIN, KEY_VALUE_ADDRESSES } from '@/lib/config'

export const usePlayer = (playerId: Address) => {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()

	return useQuery<Player, Error>(
		['usePlayer', playerId, chain.id],
		async () => {
			const username = await readContract({
				address: KEY_VALUE_ADDRESSES[chain.id as keyof typeof KEY_VALUE_ADDRESSES],
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
