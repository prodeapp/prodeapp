import { useQuery } from "react-query";
import {Match, MATCH_FIELDS} from "../graphql/subgraph";
import apollo from "../lib/apolloClient";

const query = `
    ${MATCH_FIELDS}
    query MatchesQuery ($tournamentId: String!){
      matches(where:{tournament: $tournamentId}, orderBy:id, orderDirection:desc) {
        ...MatchFields
      }
    }
`;

export const useMatches = (tournamentId: string) => {
  return useQuery<Match[], Error>(
    ["useMatches"],
    async () => {
      const response = await apollo<{ matches: Match[] }>(query, {tournamentId});

      if (!response) throw new Error("No response from TheGraph");

      return response.data.matches;
    }
  );
};