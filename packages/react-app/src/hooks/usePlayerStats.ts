import { useQuery } from '@tanstack/react-query'

import { PLAYER_STATS_FIELDS, PlayerStats } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'

const query = `
    ${PLAYER_STATS_FIELDS}
    query PlayerQuery($playerId: String) {
        playerStats(id: $playerId) {
            ...PlayerStatsFields
        }
    }
`

export const usePlayerStats = (playerId: string) => {
	return useQuery<PlayerStats, Error>(
		['usePlayerStats', playerId],
		async () => {
			const response = await apolloProdeQuery<{ playerStats: PlayerStats }>(query, { playerId: playerId.toLowerCase() })

			if (!response) throw new Error('No response from TheGraph')

			return response.data.playerStats
		},
		{ enabled: !!playerId }
	)
}
