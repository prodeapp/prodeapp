import {Bet, BET_FIELDS} from "../graphql/subgraph";
import {apolloProdeQuery} from "../lib/apolloClient";
import { useQuery } from "react-query";

const query = `
    ${BET_FIELDS}
    query BetQuery($betId: String) {
        bet($betId}) {
          ...BetFields
        }
    }
`;

export const useBet = (betId: string | null | undefined) => {
 
  return useQuery<Bet, Error>(
    ["useBet", betId],
    async () => {
      const response = await apolloProdeQuery<{ bet: Bet }>(query, {betId});

      if (!response) throw new Error("No response from TheGraph");

      return response.data.bet;
    }
  );
};