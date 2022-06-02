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

interface Props {
  marketId?: string
  playerId?: string
}

export const useRanking = ({marketId, playerId}: Props) => {
  return useQuery<Bet[], Error>(
    ["useRanking", marketId, playerId],
    async () => {
      const variables = {market: marketId?.toLowerCase(), player: playerId?.toLowerCase()};

      const response = await apolloProdeQuery<{ bets: Bet[] }>(buildQuery(query, variables), variables);

      if (!response) throw new Error("No response from TheGraph");

      return response.data.bets;
    },
    {enabled: !!marketId || !!playerId}
  );
};