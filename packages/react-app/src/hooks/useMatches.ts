import { useQuery } from "react-query";
import {Match, MATCH_FIELDS} from "../graphql/subgraph";
import {apolloProdeQuery} from "../lib/apolloClient";

const query = `
    ${MATCH_FIELDS}
    query MatchesQuery ($tournamentId: String!){
      matches(where:{tournament: $tournamentId}, orderBy: nonce, orderDirection: asc) {
        ...MatchFields
      }
    }
`;

export const useMatches = (tournamentId: string) => {
  return useQuery<Match[], Error>(
    ["useMatches", tournamentId],
    async () => {
      const response = await apolloProdeQuery<{ matches: Match[] }>(query, {tournamentId});

      if (!response) throw new Error("No response from TheGraph");

      return response.data.matches;
    }
  );
};