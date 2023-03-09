import { useQuery } from '@tanstack/react-query'
import { useNetwork } from 'wagmi'

import { PLAYER_STATS_FIELDS, PlayerStats } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { DEFAULT_CHAIN } from '@/lib/config'

const query = `
    ${PLAYER_STATS_FIELDS}
    query PlayerQuery($playerId: String) {
        playerStats(id: $playerId) {
            ...PlayerStatsFields
        }
    }
`

export const usePlayerStats = (playerId: string) => {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()
	return useQuery<PlayerStats, Error>(
		['usePlayerStats', playerId, chain.id],
		async () => {
			const response = await apolloProdeQuery<{ playerStats: PlayerStats }>(chain.id, query, {
				playerId: playerId.toLowerCase(),
			})

			if (!response) throw new Error('No response from TheGraph')

			return response.data.playerStats
		},
		{ enabled: !!playerId }
	)
}
