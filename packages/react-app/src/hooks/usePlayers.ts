import {Player, PLAYER_FIELDS} from "../graphql/subgraph";
import {apolloProdeQuery} from "../lib/apolloClient";
import { useQuery } from "react-query";

const query = `
    ${PLAYER_FIELDS}
    query PlayersQuery {
        players(first: 100, orderBy: numOfBets, orderDirection: desc) {
            ...PlayerFields
        }
    }
`;

export const usePlayers = () => {
  return useQuery<Player[], Error>(
    ["usePlayers"],
    async () => {
      const response = await apolloProdeQuery<{ players: Player[] }>(query);

      if (!response) throw new Error("No response from TheGraph");

      return response.data.players;
    }
  );
};