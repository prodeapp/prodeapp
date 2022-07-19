import {BET_FIELDS, Bet} from "../graphql/subgraph";
import {useQuery} from "react-query";
import {apolloProdeQuery} from "../lib/apolloClient";
import {buildQuery} from "../lib/SubgraphQueryBuilder";

const query = `
    ${BET_FIELDS}
    query BetsQuery(#params#) {
      bets(where: {#where#}, orderBy: points, orderDirection: desc) {
        ...BetFields
      }
    }
`;

export const useRanking = (marketId: string, account?: string) => {
  return useQuery<Bet[], Error>(
    ["useRanking", marketId, account],
    async () => {
      const variables = {market: marketId.toLowerCase()};

      const response = await apolloProdeQuery<{ bets: Bet[] }>(buildQuery(query, variables), variables);

      if (!response) throw new Error("No response from TheGraph");

      if (!account) {
        return response.data.bets;
      }

      return [
        ...response.data.bets.filter(bet => bet.player.id.toLowerCase() === account.toLowerCase()),
        ...response.data.bets.filter(bet => bet.player.id.toLowerCase() !== account.toLowerCase())
      ];
    },
    {enabled: !!marketId}
  );
};