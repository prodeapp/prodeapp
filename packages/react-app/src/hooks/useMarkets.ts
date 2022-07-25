import { useQuery } from "@tanstack/react-query";
import {apolloProdeQuery} from "../lib/apolloClient";
import {Market, MARKET_FIELDS} from "../graphql/subgraph";
import {buildQuery, QueryVariables} from "../lib/SubgraphQueryBuilder";
import {getSubcategories} from "../lib/helpers";

const query = `
    ${MARKET_FIELDS}
    query MarketsQuery(#params#) {
      markets(where: {#where#}, first: 50, orderBy: closingTime, orderDirection: desc) {
        ...MarketFields
      }
    }
`;

export type MarketStatus = 'active'|'pending'|'closed'

interface Props {
  curated?: boolean
  status?: MarketStatus
  category?: string
  minEvents?: number
  creatorId?: string
}

export const useMarkets = ({curated, status, category, minEvents, creatorId}: Props = {}) => {
  return useQuery<Market[], Error>(
    ["useMarkets", curated, status, category, minEvents, creatorId],
    async () => {
      const variables: QueryVariables = {curated};

      if (category) {
        variables['category_in'] = [category, ...getSubcategories(category).map(s => s.id)];
      }

      if (minEvents) {
        variables['numOfEvents_gte'] = String(minEvents);
      }

      if (status !== undefined) {
        if (status === 'active') {
          variables['closingTime_gt'] = String(Math.round(Date.now() / 1000))
        } else if (status === 'pending') {
          variables['hasPendingAnswers'] = true
          variables['closingTime_lt'] = String(Math.round(Date.now() / 1000))
        } else if (status === 'closed') {
          variables['hasPendingAnswers'] = false
        }
      }

      if (creatorId) {
        variables['creator'] = creatorId.toLowerCase();
      }

      const response = await apolloProdeQuery<{ markets: Market[] }>(buildQuery(query, variables), variables);

      if (!response) throw new Error("No response from TheGraph");

      return response.data.markets;
    }
  );
};