import {Match, MATCH_FIELDS} from "../graphql/subgraph";
import { gql, useQuery } from "@apollo/client";

const query = gql`
    ${MATCH_FIELDS}
    query MATCHsQuery ($id: String!){
      matches(where:{tournament: $id}, orderBy:id, orderDirection:desc) {
        ...MatchFields
      }
    }
`;
export const useMatches = (tournamentID: string) => {
  const {loading, error, data} = useQuery<{matches: Match[]}>(query, {
    variables: {id: tournamentID}});
  return {loading, error, matches: data?.matches || []}
};