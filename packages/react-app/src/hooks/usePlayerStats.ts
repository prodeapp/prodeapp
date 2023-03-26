import { useQuery } from '@tanstack/react-query'
import { useNetwork } from 'wagmi'

import { PLAYER_STATS_FIELDS, PlayerStats } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { filterChainId } from '@/lib/config'

const query = `
    ${PLAYER_STATS_FIELDS}
    query PlayerQuery($playerId: ID!) {
        player(id: $playerId) {
            ...PlayerStatsFields
        }
    }
`

export const usePlayerStats = (playerId: string) => {
	const { chain } = useNetwork()
	const chainId = filterChainId(chain?.id)
	return useQuery<PlayerStats, Error>(
		['usePlayerStats', playerId, chainId],
		async () => {
			const response = await apolloProdeQuery<{ player: PlayerStats }>(chainId, query, {
				playerId: playerId.toLowerCase(),
			})

			if (!response) throw new Error('No response from TheGraph')

			return (
				response.data.player || {
					id: playerId,
					amountBet: 0,
					pricesReceived: 0,
					totalAttributions: 0,
				}
			)
		},
		{ enabled: !!playerId }
	)
}
