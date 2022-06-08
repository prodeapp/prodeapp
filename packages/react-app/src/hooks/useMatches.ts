import { useQuery } from "react-query";
import {Match, MATCH_FIELDS} from "../graphql/subgraph";
import {apolloProdeQuery} from "../lib/apolloClient";

const query = `
    ${MATCH_FIELDS}
    query MatchesQuery ($marketId: String!){
      matches(where:{market: $marketId}, orderBy: nonce, orderDirection: asc) {
        ...MatchFields
      }
    }
`;

export const fetchMatches = async (marketId: string) => {
  const response = await apolloProdeQuery<{ matches: Match[] }>(query, {marketId});

  if (!response) throw new Error("No response from TheGraph");

  return response.data.matches;
};


export const useMatches = (marketId: string) => {
  return useQuery<Match[], Error>(
    ["useMatches", marketId],
    async () => {
      return fetchMatches(marketId);
    }
  );
};