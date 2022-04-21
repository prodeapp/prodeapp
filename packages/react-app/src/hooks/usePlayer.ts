import {Player, PLAYER_FIELDS} from "../graphql/subgraph";
import {apolloProdeQuery} from "../lib/apolloClient";
import { useQuery } from "react-query";

const query = `
    ${PLAYER_FIELDS}
    query PlayerQuery($playerId: String) {
        player(id: $playerId) {
            ...PlayerFields
        }
    }
`;

export const usePlayer = (playerId: string) => {
  return useQuery<Player, Error>(
    ["usePlayer", playerId],
    async () => {
      const response = await apolloProdeQuery<{ player: Player }>(query, {playerId});

      if (!response) throw new Error("No response from TheGraph");

      return response.data.player;
    }
  );
};