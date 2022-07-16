import {BET_FIELDS, Bet} from "../graphql/subgraph";
import {useQuery} from "react-query";
import {apolloProdeQuery} from "../lib/apolloClient";

const query = `
    ${BET_FIELDS}
    query BetQuery($marketId: String, $tokenId: String) {
      bets(where: {market: $marketId, tokenID: $tokenId}, orderBy: points, orderDirection: desc) {
        ...BetFields
      }
    }
`;

export const useBet = (marketId: string, tokenId: string) => {
  return useQuery<Bet | undefined, Error>(
    ["useBet", marketId, tokenId],
    async () => {
      const response = await apolloProdeQuery<{ bets: Bet[] }>(query, {marketId, tokenId});

      if (!response) throw new Error("No response from TheGraph");

      return response.data.bets[0];
    },
    {enabled: !!marketId || !!tokenId}
  );
};