import {BET_FIELDS, Bet} from "../graphql/subgraph";
import {useQuery} from "react-query";
import {apolloProdeQuery} from "../lib/apolloClient";

const query = `
    ${BET_FIELDS}
    query BetQuery($playerId: String) {
      bets(where: {player: $playerId}, orderBy: points, orderDirection: desc) {
        ...BetFields
      }
    }
`;

export const useBets = (playerId: string) => {
  return useQuery<Bet[], Error>(
    ["useBets", playerId],
    async () => {
      const response = await apolloProdeQuery<{ bets: Bet[] }>(query, {playerId: playerId.toLowerCase()});

      if (!response) throw new Error("No response from TheGraph");

      return response.data.bets;
    },
    {enabled: !!playerId}
  );
};