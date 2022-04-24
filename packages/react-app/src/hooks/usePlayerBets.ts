import {Bet, BET_FIELDS} from "../graphql/subgraph";
import {apolloProdeQuery} from "../lib/apolloClient";
import { useQuery } from "react-query";

const query = `
    ${BET_FIELDS}
    query BetsQuery($playerId: String) {
        bets(where: {player: $playerId}) {
            ...BetFields
        }
    }
`;

export const usePlayerBets = (playerId: string) => {
  return useQuery<Bet[], Error>(
    ["usePlayerBets", playerId],
    async () => {
      const response = await apolloProdeQuery<{ bets: [] }>(query, {playerId: playerId.toLowerCase()});

      if (!response) throw new Error("No response from TheGraph");

      return response.data.bets;
    }
  );
};