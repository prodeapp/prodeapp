import { useQuery } from "@tanstack/react-query";
import {apolloProdeQuery} from "../lib/apolloClient";
import {Market, MARKET_FIELDS} from "../graphql/subgraph";

const query = `
    ${MARKET_FIELDS}
    query MarketQuery($marketId: String) {
        market(id: $marketId) {
            ...MarketFields
        }
    }
`;

export const useMarket = (marketId: string) => {
  return useQuery<Market, Error>(
    ["useMarket", marketId],
    async () => {
      const response = await apolloProdeQuery<{ market: Market }>(query, {marketId});

      if (!response) throw new Error("No response from TheGraph");

      return response.data.market;
    }
  );
};