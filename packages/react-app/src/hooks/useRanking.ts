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
  tournamentId?: string
  playerId?: string
}

export const useRanking = ({tournamentId = '', playerId = ''}: Props) => {
  return useQuery<Bet[], Error>(
    ["useRanking", tournamentId, playerId],
    async () => {
      const variables = {tournament: tournamentId?.toLowerCase(), player: playerId?.toLowerCase()};

      const response = await apolloProdeQuery<{ bets: Bet[] }>(buildQuery(query, variables), variables);

      if (!response) throw new Error("No response from TheGraph");

      return response.data.bets;
    },
    {enabled: !!tournamentId || !!playerId}
  );
};