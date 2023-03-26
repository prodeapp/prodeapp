import { useQuery } from '@tanstack/react-query'
import { Address, readContract } from '@wagmi/core'
import { useNetwork } from 'wagmi'

import { KeyValueAbi } from '@/abi/KeyValue'
import { Player } from '@/graphql/subgraph'
import { filterChainId, getConfigAddress } from '@/lib/config'

export const usePlayer = (playerId: Address) => {
	const { chain } = useNetwork()
	const chainId = filterChainId(chain?.id)

	return useQuery<Player, Error>(
		['usePlayer', playerId, chainId],
		async () => {
			const username = await readContract({
				address: getConfigAddress('KEY_VALUE', chainId),
				abi: KeyValueAbi,
				functionName: 'username',
				args: [playerId],
				chainId: filterChainId(chainId),
			})

			return {
				id: playerId,
				name: username || playerId,
			}
		},
		{ enabled: !!playerId }
	)
}
