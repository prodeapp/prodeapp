import { useQuery } from '@tanstack/react-query'

// import { useNetwork } from 'wagmi'
import { Bet, BET_FIELDS } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { DEFAULT_CHAIN } from '@/lib/config'
// import { filterChainId } from '@/lib/config'

const query = `
	${BET_FIELDS}
    query PlayerBetsQuery($playerId: ID!) {
        bets(where: {reward_gt: "0", player: $playerId}, orderBy: timestamp, orderDirection: desc, first:10) {
            reward
			tokenID
			market {name, id}
        }
    }
`

export const usePlayerWinnerBets = (playerId: string | undefined) => {
	return useQuery<Bet[], Error>(
		['usePlayerWinnerBets', playerId],
		async () => {
			const response = await apolloProdeQuery<{ bets: Bet[] }>(DEFAULT_CHAIN, query, {
				playerId: playerId!.toLowerCase(),
			})
			if (!response) throw new Error('No response from TheGraph')

			return response.data.bets || []
		},
		{ enabled: !!playerId }
	)
}
