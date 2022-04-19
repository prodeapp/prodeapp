import {BET_FIELDS, Bet} from "../graphql/subgraph";
import {useQuery} from "react-query";
import apollo from "../lib/apolloClient";

const query = `
    ${BET_FIELDS}
    query BetsQuery {
      bets(tournament: $id) {
        ...BetFields
      }
    }
`;

/** TODO: sort the bets by points */
export const useRanking = (tournamentId: string) => {
  return useQuery<Bet[], Error>(
    ["useRanking", tournamentId],
    async () => {
      const response = await apollo<{ bets: Bet[] }>(query, {tournamentId});

      if (!response) throw new Error("No response from TheGraph");

      return response.data.bets;
    }
  );
};