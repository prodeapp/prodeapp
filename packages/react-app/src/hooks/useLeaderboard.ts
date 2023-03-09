import { useQuery } from '@tanstack/react-query'
import { useNetwork } from 'wagmi'

import { Leaderboard, LEADERBOARD_FIELDS } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { DEFAULT_CHAIN } from '@/lib/config'

const query = `
    ${LEADERBOARD_FIELDS}
    query LeaderboardQuery {
        players(first: 100, orderBy: numOfBets, orderDirection: desc) {
            ...LeaderboardFields
        }
    }
`

export const useLeaderboard = () => {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()
	return useQuery<Leaderboard[], Error>(['useLeaderboard', chain.id], async () => {
		const response = await apolloProdeQuery<{ players: Leaderboard[] }>(chain.id, query)

		if (!response) throw new Error('No response from TheGraph')

		return response.data.players
	})
}
