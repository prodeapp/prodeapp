import { useQuery } from '@tanstack/react-query'
import { useNetwork } from 'wagmi'

import { Leaderboard, LEADERBOARD_FIELDS } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { filterChainId } from '@/lib/config'

const query = `
    ${LEADERBOARD_FIELDS}
    query LeaderboardQuery {
        players(first: 100, orderBy: numOfBets, orderDirection: desc) {
            ...LeaderboardFields
        }
    }
`

export const useLeaderboard = () => {
	const { chain } = useNetwork()
	const chainId = filterChainId(chain?.id)
	return useQuery<Leaderboard[], Error>(['useLeaderboard', chainId], async () => {
		const response = await apolloProdeQuery<{ players: Leaderboard[] }>(chainId, query)

		if (!response) throw new Error('No response from TheGraph')

		return response.data.players
	})
}
