import { useQuery } from '@tanstack/react-query'

import { Player, PLAYER_FIELDS } from '@/graphql/subgraph'
import { apolloProdeQuery } from '@/lib/apolloClient'

const query = `
    ${PLAYER_FIELDS}
    query PlayersNameQuery($playerName: String) {
        players(where: {name:$playerName}) {
            ...PlayerFields
        }
    }
`

export const usePlayerName = (playerName: string) => {
	return useQuery<Player[], Error>(
		['usePlayerName', playerName],
		async () => {
			const response = await apolloProdeQuery<{ players: Player[] }>(query, {
				playerName: playerName,
			})

			if (!response) throw new Error('No response from TheGraph')

			return response.data.players
		},
		{ enabled: !!playerName }
	)
}
