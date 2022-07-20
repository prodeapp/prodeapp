import { useQuery } from "react-query";
import {apolloProdeQuery} from "../lib/apolloClient";
import {Market, MARKET_FIELDS} from "../graphql/subgraph";

const query = `
    ${MARKET_FIELDS}
    query MarketsQuery($creatorId: String) {
      markets(where: {creator: $creatorId}, orderBy: creationTime, orderDirection: desc) {
        ...MarketFields
      }
    }
`;

export const useMarketsFromCreator = (creatorId: string) => {
  return useQuery<Market[], Error>(
    ["useMarketsFromCreator", creatorId],
    async () => {
      const response = await apolloProdeQuery<{ markets: Market[] }>(query, {creatorId: creatorId.toLowerCase()});

      if (!response) throw new Error("No response from TheGraph");

      return response.data.markets;
    },
    {enabled: !!creatorId}
  );
};